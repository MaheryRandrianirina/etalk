import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import UserValidator from "../security/userValidator"
import {NextApiRequest, NextApiResponse} from "next"
import ValidationError from "../security/validationError"
import UserTable from "../database/tables/UserTable"
import PasswordGuard from "../security/password"
import { User } from "../../types/user"
import { createWriteStream } from "fs"
import { File } from "buffer"
import { LoginInputs } from "../../components/login"
import { NextResponse } from "next/server"

export default class Auth {

    private userTable = new UserTable()
    private passwordGuard = new PasswordGuard()
    private userValidator: UserValidator = new UserValidator()

    constructor(private req: NextApiRequest, private res: NextApiResponse) {

    }

    registerUser() {
        const d: BeforeStepThreeData | File = this.req.body
        
        if(d instanceof File === false || typeof d === "object"){
            const {registrationStep, data} = d as BeforeStepThreeData

            this.userValidator.setData(data)
            
            switch(registrationStep){
                case 1:
                    this.handleRegistrationStepOne(data, this.req, this.res)
                    break
                case 2:
                    this.handleRegistrationStepTwo(data, this.req, this.res)
                    break
            }
        }
        //this.handleRegistrationStepThree(d, req, res)
    }

    private async handleRegistrationStepOne(data:DataFromRegistration,
        req: NextApiRequest,
        res: NextApiResponse){
    
        const errors: ValidationError | null = this.userValidator
            .required("sex")
            .string("sex")
            .name('name')
            .firstname("firstname")
            .username("username")
            .getErrors()
        
        if(errors === null){
            try {
                const userId: number = await this.insertUserIdentity(data)
                req.session.userId = userId
                await req.session.save()
    
                res.status(200).json({success: true}) 
            }catch(e){
                const error = e as Error
                res.status(500).json({success: false, sqlError: error.message})
            }
        }else {
            res.status(500).json({...errors, success: false})
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
    
    private async handleRegistrationStepTwo(data:DataFromRegistration, req: NextApiRequest, res: NextApiResponse) {
        const errors = this.userValidator
            .email("email")
            .password("password")
            .equals("password", "password_confirmation")
            .getErrors()
    
        const userId = req.session.userId
        
        if (errors === null && userId !== undefined && userId !== null) {
            try {
                await this.insertUserStepTwoData(data, userId)
                const authenticatedUser = await this.loginAfterRegistration(data, userId, req)

                if(authenticatedUser){
                    res.status(200).json({ success: true })
                }else {
                    res.status(301).redirect("/forbidden").send("Accès refusé !")
                }
                
            } catch (error) {
                res.status(500).json({success: false, sqlError: error})
            }
        } else {
            res.status(500).json({ ...errors, success: false })
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
        console.log("verified password : ",verifiedPassword)
        if(verifiedPassword){
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
    
    private handleRegistrationStepThree(imageFile:File, req: NextApiRequest, res: NextApiResponse) {
        
        const authUser = req.session.user
        console.log('aeazd')
        if (authUser !== undefined && authUser.id !== null) {
            try {
                const writeStream = createWriteStream("D:\\CODES\\MESPROJETS\\nextjs\\ETALK\\storage\\public\\user.png")
                req.on('data', (chunk)=>{
                    console.log('write')
                    writeStream.write(chunk)
                })
    
                req.on('end', ()=>{
                    writeStream.end()
                    
                    //insertUserStepThreeData(path, authUser.id)
                    res.status(200).json({ success: true })
                })
                
            } catch (error) {
                res.status(500).json({success: false, sqlError: error})
            }
        } else {
            res.status(500).json({ success: false, user: "Vous devez être connecté pour pouvoir faire cette action." })
        }  
    }
    
    private insertUserStepThreeData(imagePath: string, userid: number){
        this.userTable.update({image: imagePath},{id: userid})
    }

    async loginUser() {
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
    }
}

type BeforeStepThreeData = {registrationStep: number, data:DataFromRegistration}