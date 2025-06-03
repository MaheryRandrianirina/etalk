import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import UserValidator from "../security/userValidator"
import type {NextApiRequest, NextApiResponse} from "next"
import ValidationError from "../security/validationError"
import UserTable from "../database/tables/UserTable"
import PasswordGuard from "../security/password"
import { User } from "../../types/user"
import { LoginInputs } from "../../components/organisms/login"
import { NextResponse } from "next/server"
import Str from "../Helpers/Str"
import { MysqlError } from "mysql"
import { SessionData } from "../../types/session"
import { ColumnsToFill } from "../../types/Database"
import { SessionError } from "@/lib/index"
import { IronSession } from "iron-session"

export default class Auth {

    private userTable = new UserTable()

    private passwordGuard = new PasswordGuard()

    private userValidator: UserValidator<User> = new UserValidator<User>()

    private errorMessage = {
        responseNull: "Impossible d'invoquer cetter methode si 'this.res' est null",
        not: {
            NextApiRequest: "this.req n'est pas de type NextApiRequest"
        }
    }

    constructor(private req: NextApiRequest, private res: NextApiResponse, private session: IronSession<SessionData>) {}

    async registerUser() {
        const body: RegistrationRequestBody = this.req.body 
        
        const { registrationStep, data } = body
        
        this.userValidator.setData(data as ColumnsToFill<User>)

        switch (registrationStep) {
            case 1:
                await this.handleRegistrationStepOne(data)
                break
            case 2:
                await this.handleRegistrationStepTwo(data)
                break
            case 3:
                await this.handleRegistrationStepThree(data.file)
                break
        }
    }

    private async handleRegistrationStepOne(data:DataFromRegistration){
        try {
            const errors: ValidationError<User> | null = this.userValidator
                    .required("sex")
                    .string("sex")
                    .name('name')
                    .firstname("firstname")
                    .username("username")
                    .getErrors()
                
            if (errors === null) {
                try {
                    const pseudoAlreadyUsed = await this.checkIfUserAlreadyExistsInDB("username", data.username)
                    if (pseudoAlreadyUsed) {
                        this.res.status(409).json({ success: false, errors: { username: "Ce pseudo est deja utilise" } })
                        return
                    }

                    this.session.registrationStepOneData = data;
                    
                    await this.session.save();

                    this.res.status(200).json({ success: true });

                    return;
                } catch (e) {
                    const error = e as Error
                    
                    if (error instanceof SessionError) {
                        console.error(error.message);

                        return;
                    }

                    this.res.status(500).json({ success: false, sqlError: error.message })
                }
            } else {
                this.res.status(500).json({ ...errors, success: false })
            }
        }catch(e){
            console.error(e)
            throw e
        }
            
        
    }

    private async checkIfUserAlreadyExistsInDB(key: string, value: string) {
        const foundUsers = await this.userTable.search([key], [key], { values: [`${value}`]})
        return foundUsers.length > 0
    }
    
    private async insertUserIdentity(userIdentity: DataFromRegistration): Promise<number>{
        try {
            const hash = await this.passwordGuard.hash(userIdentity.password);

            const userid = await this.userTable.new({
                name: userIdentity.name, 
                firstname: userIdentity.firstname, 
                username: userIdentity.username, 
                sex: userIdentity.sex,
                password: hash,
                email: userIdentity.email
            } as ColumnsToFill<User>) as number;
            
            return userid;
        }catch(err){
            throw err
        }
    }
    
    private async handleRegistrationStepTwo(data:DataFromRegistration) {
        const errors = this.userValidator
            .email("email")
            .password("password")
            .equals("password", "password_confirmation")
            .getErrors();
    
        const registration_step_one_data = this.session.registrationStepOneData;
        
        if (errors === null && registration_step_one_data) {
            try {
                const emailAlreadyUsed = await this.checkIfUserAlreadyExistsInDB("email", data.email)
                if (emailAlreadyUsed) {
                    this.res.status(409).json({ success: false, errors: { email: "Cet adresse email est deja utilise"}})
                    return
                }

                const userId: number = await this.insertUserIdentity({...registration_step_one_data, ...data});
                
                const authenticatedUser = await this.loginAfterRegistration(data, userId)

                if (authenticatedUser) {
                    this.res.status(200).json({ success: true })
                } else {
                    this.res.status(301).redirect("/forbidden").send("Accès refusé !")
                }

            } catch (error) {
                console.error(error)
                this.res.status(500).json({ success: false, sqlError: error })
            }
        } else {
            this.res.status(500).json({ ...errors, success: false })
        } 
    }
    
    private async loginAfterRegistration(data: DataFromRegistration, userId: number): Promise<boolean> {
        try {
            const res = await this.userTable.find(userId) as [User]
            const user = res[0]
            return this.authenticatedUser(data.password, user)
    
        }catch(e){
            throw e
        }
    }

    private async authenticatedUser(password: string, user: User, remember_me?: boolean): Promise<boolean> {
        const verifiedPassword = await this.passwordGuard.verify(password, user.password)
        if(verifiedPassword){
            this.session.user = {
                id: user.id,
                name: user.name,
                firstname: user.firstname,
                username: user.username,
                image: user.image,
                is_online: true,
                sex: user.sex,
                email: user.email
            }

            await this.session.save();

            if(remember_me === true){
                try {
                    const rememberToken = this.generateRememberToken(user)
                    this.userTable.update({remember_token: rememberToken} as ColumnsToFill<User>, {id: user.id} as ColumnsToFill<User>)
                    
                    const response = NextResponse.next()
                    response.cookies.set("auth", rememberToken, {
                        httpOnly: true,
                        secure: true,
                        sameSite: "strict",
                        maxAge: 60 * 60 * 24 * 30 // 30 jours
                    })
                }catch(e){
                    throw e
                }
            }

            return true
        }else {
            return false
        }
    }
    
    private generateRememberToken(user: User): string {
        return user.id + "-----" + Str.random(64)
    }

    private async handleRegistrationStepThree(file: string) {
        const authUser = this.session.user
        if (authUser !== undefined && authUser.id !== null) {
            try {
                await this.userTable.update(
                    { image: file } as ColumnsToFill<User>,
                    { id: this.session.user?.id as number } as ColumnsToFill<User>
                )

                this.res.status(200).json({ success: true })
            } catch (error) {
                this.res.status(500).json({ success: false, sqlError: error })
            }
        } else {
            this.res.status(500).json({
                success: false,
                user: "Vous devez être connecté pour pouvoir faire cette action."
            })
        }  
    }

    async loginUser() {
        const loginData = this.req.body as LoginInputs
        const errors = this.userValidator.setData(loginData as ColumnsToFill<User>)
            .required("username", "password")
            .username("username")
            .password("password")
            .getErrors()

        if (errors === null) {
            try {
                const [user] = await this.userTable
                    .where<undefined>(["username"], [loginData.username])
                    .get() as [User | undefined]

                if (user !== undefined) {
                    const authenticatedUser = await this
                        .authenticatedUser(loginData.password, user, loginData.remember_me)
                    if (authenticatedUser) {
                        this.res
                            .status(200)
                            .json({ success: true, redirection: { redirected: true, url: "/" } })
                    } else {
                        this.res
                            .status(500)
                            .json({ success: false, errors: { password: "Mot de passe incorrect" } })
                    }
                } else {
                    this.res
                        .status(500)
                        .json({ success: false, errors: { username: "Aucun utilisateur ne possède ce pseudo" } })
                }
            } catch (e) {
                const error = e as MysqlError | Error;
                console.error(error)
                if ("sqlMessage" in error) {
                    this.res
                        .status(500)
                        .json({ success: false, errors: { sqlMessage: error.message } })

                } else {
                    this.res
                        .status(500)
                        .json({ success: false, errors: { message: error.message } })
                }
            }
        } else {
            console.log(errors)
            this.res.status(500).json({ success: false, errors: errors })
        }
    }

    isAuthenticated(): boolean {
        const authUser = this.session.user
        return authUser !== undefined 
            && authUser.is_online === true
    }

    async remembered(cookieValue: string): Promise<{
        ok: boolean,
        user: User
    }> {
        const userId = parseInt(cookieValue.split('-----')[0])
        const [user] = await this.userTable.find(userId)

        return {
            ok: user.remember_token === cookieValue,
            user: user
        }
    }
}

type RegistrationRequestBody = {
    registrationStep: number, 
    data:DataFromRegistration
}
