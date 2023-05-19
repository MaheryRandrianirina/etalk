import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import UserValidator from "../security/userValidator"
import {NextApiRequest, NextApiResponse} from "next"
import ValidationError from "../security/validationError"
import UserTable from "../database/tables/UserTable"
import PasswordGuard from "../security/password"
import { User } from "../../types/user"
import { File } from "buffer"
import { LoginInputs } from "../../components/login"
import multer from "multer"
import { NextRequest } from "next/server"


export default class Auth {

    private userTable = new UserTable()
    private passwordGuard = new PasswordGuard()
    private userValidator: UserValidator = new UserValidator()

    private errorMessage = {
        responseNull: "Impossible d'invoquer cetter methode si 'this.res' est null",
        not: {
            NextApiRequest: "this.req n'est pas de type NextApiRequest"
        }
    }

    constructor(private req: NextApiRequest | NextRequest, private res?: NextApiResponse) {

    }

    registerUser() {
        const d: BeforeStepThreeData | File = this.req.body
        if (this.res) {
            if (d instanceof File === false) {
                const { registrationStep, data } = d as BeforeStepThreeData

                this.userValidator.setData(data)

                switch (registrationStep) {
                    case 1:
                        this.handleRegistrationStepOne(data)
                        break
                    case 2:
                        this.handleRegistrationStepTwo(data)
                        break
                }
            }
            //this.handleRegistrationStepThree(d)
        }else {
            throw Error(this.errorMessage.responseNull)
        }
    }

    private async handleRegistrationStepOne(data:DataFromRegistration){
    
        try {
            if(this.res){
                const errors: ValidationError | null = this.userValidator
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
                        this.res.status(500).json({success: false, sqlError: error.message})
                    }
                }else {
                    this.res.status(500).json({...errors, success: false})
                }
            }else {
                throw new Error(this.errorMessage.responseNull)
            }
        }catch(e){
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
                const authenticatedUser = await this.loginAfterRegistration(data, userId, req)

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

    private async authenticatedUser(password: string, user: User): Promise<boolean> {
        const verifiedPassword = await this.passwordGuard.verify(password, user.password)
        if(verifiedPassword && "session" in this.req){
            this.req.session.user = {
                id: user.id,
                name: user.name,
                firstname: user.firstname,
                username: user.username,
                image: user.image,
                is_online: true,
                sex: user.sex
            }

            await this.req.session.save()
            return true
        }else {
            return false
        }
    }
    
    private async handleRegistrationStepThree(imageFile:File) {
        if(this.res && "session" in this.req){
            const authUser = this.req.session.user
            if (authUser !== undefined && authUser.id !== null) {
                try {
                    
                    
                } catch (error) {
                    this.res.status(500).json({success: false, sqlError: error})
                }
            } else {
                this.res.status(500).json({ success: false, user: "Vous devez être connecté pour pouvoir faire cette action." })
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
                    const [user] = await this.userTable.get([],["username"], [loginData.username]) as [User | undefined]
                    if(user !== undefined){
                        const authenticatedUser = await this.authenticatedUser(loginData.password, user)
                        if(authenticatedUser){
                            this.res
                                .status(301)
                                .redirect("/")
                                .json({success: true, message: "Vous êtes connecté !"})
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
                    const error = e as Error
                    this.res
                        .status(500)
                        .json({success: false, sqlError: error.message})
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
}

export const config = {
    api: {
        bodyParser: false,
    }
}

type BeforeStepThreeData = {registrationStep: number, data:DataFromRegistration}