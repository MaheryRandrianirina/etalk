import { NextApiRequest, NextApiResponse} from "next"
import UserTable from "../../backend/database/tables/UserTable"
import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import ValidationError from "../../backend/security/validationError"
import UserValidator from "../../backend/security/userValidator"
import PasswordGuard from "../../backend/security/password"
import { withSessionRoute } from "../../backend/utilities/withSession"

export default withSessionRoute(Register) 

function Register(req: NextApiRequest, res: NextApiResponse) {
    
    if(req.method === "POST"){
        const {registrationStep, data}: {registrationStep: number, data:DataFromRegistration} = req.body
        const validator = new UserValidator(data)

        switch(registrationStep){
            case 1:
                handleRegistrationStepOne(data, validator, req, res)
                break
            case 2:
                handleRegistrationStepTwo(data, validator, req, res)
                break
        }
    }
}

async function handleRegistrationStepOne(data:DataFromRegistration, 
    validator: UserValidator,
    req: NextApiRequest,
    res: NextApiResponse){
    const errors: ValidationError | null = validator
        .required("sex")
        .string("sex")
        .name('name')
        .firstname("firstname")
        .username("username")
        .getErrors()

    
    if(errors === null){
        try {
            const userId: number = await insertUserIdentity(data)
            req.session.userId = userId
            console.log("user id from server", userId, req.session.userId)
            await req.session.save()

            res.status(200).json({success: true}) 
        }catch(error){
            res.status(500).json({success: false, sqlError: error})
        }
    }else {
        res.status(500).json({...errors, success: false})
    }
        
    
}

const userTable = new UserTable()

async function insertUserIdentity(userIdentity: DataFromRegistration): Promise<number>{
    
    try {
        const userid = await userTable.new({
            'name': userIdentity.name, 
            'firstname': userIdentity.firstname, 
            'username': userIdentity.username, 
            'sex': userIdentity.sex
        }) as number
        return userid
        
    }catch(err){
        console.error(err)
        throw new Error("Echec de l'insertion dans la base de données à cause d'une erreur")
    }
}

function handleRegistrationStepTwo(data:DataFromRegistration, validator: UserValidator, req: NextApiRequest, res: NextApiResponse) {
    const errors = validator
        .required("id")
        .email("email")
        .password("password")
        .equals("password", "password_confirmation")
        .getErrors()

    const userId = req.session.userId
    console.log("userid from step 2: ", userId)
    if (errors === null && userId !== undefined && userId !== null) {
        try {
            insertUserStepTwoData(data, userId)
            res.status(200).json({ success: true })
        } catch (error) {
            res.status(500).json({success: false, sqlError: error})
        }
    } else {
        res.status(500).json({ ...errors, success: false })
    }
    
    
}

async function insertUserStepTwoData(data: DataFromRegistration, userId: number): Promise<void> {
    const hash = PasswordGuard.hash(data.password)
    try {
        await userTable.update({
            password: hash,
            email: data.email
        }, {id: userId})
    }catch(e){
        throw e
    }
}