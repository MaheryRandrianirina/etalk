import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import UserValidator from "../security/userValidator"
import type {NextApiRequest, NextApiResponse} from "next"
import ValidationError from "../security/validationError"
import UserTable from "../database/tables/UserTable"
import PasswordGuard from "../security/password"
import { User } from "../../types/user"
import { File } from "buffer"
import { LoginInputs } from "../../components/login"
import { NextRequest, NextResponse } from "next/server"
import Str from "../Helpers/Str"
import { MysqlError } from "mysql"

export default class Auth {

    private userTable = new UserTable<User>()

    private passwordGuard = new PasswordGuard()

    private userValidator: UserValidator<User> = new UserValidator<User>()

    private errorMessage = {
        responseNull: "Impossible d'invoquer cetter methode si 'this.res' est null",
        not: {
            NextApiRequest: "this.req n'est pas de type NextApiRequest"
        }
    }

    constructor(private req: NextApiRequest, private res?: NextApiResponse) {

    }

    async registerUser() {
        const body: BeforeStepThreeData = this.req.body 
        
        if (this.res) {
            const { registrationStep, data } = body

            this.userValidator.setData(data)

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
        }else {
            throw Error(this.errorMessage.responseNull)
        }
    }

    private async handleRegistrationStepOne(data:DataFromRegistration){
    
        try {
            if(this.res){
                const errors: ValidationError<User> | null = this.userValidator
                    .required("sex")
                    .string("sex")
                    .name('name')
                    .firstname("firstname")
                    .username("username")
                    .getErrors()
            
                if(errors === null && "session" in this.req){
                    try {
                        const userId: number = await this.insertUserIdentity(data)
                        this.req.session.userId = userId
                        await this.req.session.save()
            
                        this.res.status(200).json({success: true}) 
                    }catch(e){
                        const error = e as Error
                        console.error(error);
                        this.res.status(500).json({success: false, sqlError: error.message})
                    }
                }else {
                    this.res.status(500).json({...errors, success: false})
                }
            }else {
                throw new Error(this.errorMessage.responseNull)
            }
        }catch(e){
            console.error(e)
            throw e
        }
            
        
    }
    
    private async insertUserIdentity(userIdentity: DataFromRegistration): Promise<number>{
        
        try {
            const userid = await this.userTable.new({
                'name': userIdentity.name, 
                'firstname': userIdentity.firstname, 
                'username': userIdentity.username, 
                'sex': userIdentity.sex
            }) as number
            return userid
        }catch(err){
            throw err
        }
    }
    
    private async handleRegistrationStepTwo(data:DataFromRegistration) {
        if(this.res && "session" in this.req){
            const errors = this.userValidator
            .email("email")
            .password("password")
            .equals("password", "password_confirmation")
            .getErrors()
    
            const userId = this.req.session.userId
            
            if (errors === null && userId !== undefined && userId !== null) {
                try {
                    await this.insertUserStepTwoData(data, userId)
                    const authenticatedUser = await this.loginAfterRegistration(data, userId, this.req)

                    if(authenticatedUser){
                        this.res.status(200).json({ success: true })
                    }else {
                        this.res.status(301).redirect("/forbidden").send("Accès refusé !")
                    }
                    
                } catch (error) {
                    this.res.status(500).json({success: false, sqlError: error})
                }
            } else {
                this.res.status(500).json({ ...errors, success: false })
            }  
        }
    }
    
    private async insertUserStepTwoData(data: DataFromRegistration, userId: number): Promise<void> {
        const hash = await this.passwordGuard.hash(data.password)
        
        try {
            await this.userTable.update({
                password: hash,
                email: data.email
            }, {id: userId})
        }catch(e){
            throw e
        }
    }
    
    private async loginAfterRegistration(data: DataFromRegistration, userId: number, req: NextApiRequest): Promise<boolean> {
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
        if(verifiedPassword && "session" in this.req){
            this.req.session.user = {
                id: user.id,
                name: user.name,
                firstname: user.firstname,
                username: user.username,
                image: user.image,
                is_online: true,
                sex: user.sex,
                email: user.email
            }

            await this.req.session.save()

            if(remember_me === true){
                try {
                    const rememberToken = this.generateRememberToken(user)
                    this.userTable.update({remember_token: rememberToken}, {id: user.id})
                    
                    const response = NextResponse.next()
                    response.cookies.set("auth", rememberToken)
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
        if(this.res && "session" in this.req){
            const authUser = this.req.session.user
            if (authUser !== undefined && authUser.id !== null) {
                try {
                    await this.userTable.update(
                        { image: file }, 
                        { id: this.req.session.userId as number }
                    )

                    this.res.status(200).json({ success: true })
                } catch (error) {
                    this.res.status(500).json({success: false, sqlError: error})
                }
            } else {
                this.res.status(500).json({ 
                    success: false, 
                    user: "Vous devez être connecté pour pouvoir faire cette action." 
                })
            } 
        }else {
            throw Error(this.errorMessage.responseNull)
        } 
    }
    
    private insertUserStepThreeData(imagePath: string, userid: number){
        this.userTable.update({image: imagePath},{id: userid})
    }

    async loginUser() {
        if(this.res){
            const loginData = this.req.body as LoginInputs
            const errors = this.userValidator.setData(loginData)
                .required("username", "password")
                .username("username")
                .password("password")
                .getErrors()
            
            if(errors === null){
                try {
                    const [user] = await this.userTable
                        .where<undefined>(["username"], [loginData.username])
                        .get() as [User | undefined]
                        
                    if(user !== undefined){
                        const authenticatedUser = await this
                            .authenticatedUser(loginData.password, user, loginData.remember_me)
                        if(authenticatedUser){
                            this.res
                                .status(200)
                                .json({success: true, redirection:{redirected: true, url: "/"}})
                        }else {
                            this.res
                                .status(500)
                                .json({success: false, errors: {password: "Mot de passe incorrect"}})
                        }
                    }else {
                        this.res
                            .status(500)
                            .json({success: false, errors: {username: "Aucun utilisateur ne possède ce pseudo"}})
                    }
                }catch(e){
                    const error = e as MysqlError | Error
                    if("sqlMessage" in error){
                        this.res
                        .status(500)
                        .json({success: false, errors: {sqlMessage: error.message}})
        
                    }else{
                        this.res
                        .status(500)
                        .json({success: false, errors: {message: error.message}})
                    }
                }
            }else {
                console.log(errors)
                this.res.status(500).json({success: false, errors: errors})
            }
        }else {
            throw Error(this.errorMessage.responseNull)
        }
    }

    isAuthenticated(): boolean {
        if("session" in this.req){
            const authUser = this.req.session.user
            return authUser !== undefined 
                && authUser.is_online === true
        }else {
            throw Error(this.errorMessage.not.NextApiRequest)
        }
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

type BeforeStepThreeData = {registrationStep: number, data:DataFromRegistration}