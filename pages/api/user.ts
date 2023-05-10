import { NextApiRequest, NextApiResponse} from "next"
import { UserIdentity } from "../../types/user"
import UserTable from "../../backend/database/tables/UserTable"
import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import ValidationError from "../../backend/security/validationError"
import UserValidator from "../../backend/security/userValidator"
import PasswordGuard from "../../backend/security/password"

export default function User(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST"){
        const {registrationStep, data}: {registrationStep: number, data:DataFromRegistration} = req.body
        const validator = new UserValidator(data)

        switch(registrationStep){
            case 1:
                handleRegistrationStepOne(data, validator, res)
                break
            case 2:
                handleRegistrationStepTwo(data, validator, res)
                break
        }
    }
}


async function handleRegistrationStepOne(data:DataFromRegistration, validator: UserValidator,res: NextApiResponse){
    const errors: ValidationError | null = validator
        .required("sex")
        .string("sex")
        .name('name')
        .firstname("firstname")
        .username("username")
        .getErrors()

    try {
        if(errors === null){
            const userId: number = await insertUserIdentity(data)
            res.status(200).json({success: true, insertedUserId: userId}) 
        }else {
            res.status(500).json({...errors, success: false})
        }
        
    }catch(error){
        res.status(500).json({success: false})
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

function handleRegistrationStepTwo(data:DataFromRegistration, validator: UserValidator, res: NextApiResponse) {
    const errors = validator
        .required("id")
        .email("email")
        .password("password")
        .equals("password", "password_confirmation")
        .getErrors()
    
    if (errors === null && data.id !== null) {
        try {
            insertUserStepTwoData(data)
            res.status(200).json({ success: true })
        } catch (e) {
            res.status(500).json({ success: false })
        }
    } else {
        res.status(500).json({ ...errors, success: false })
    }
    
    
}

async function insertUserStepTwoData(data: DataFromRegistration): Promise<void> {
    const hash = PasswordGuard.hash(data.password)
    try {
        await userTable.update({
            password: hash,
            email: data.email
        }, {id: data.id})
    }catch(e){
        throw e
    }
}