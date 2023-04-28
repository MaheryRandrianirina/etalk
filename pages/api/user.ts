import { NextApiRequest, NextApiResponse} from "next"
import { UserIdentity } from "../../types/user"
import UserTable from "../../backend/database/tables/UserTable"
import { DataFromRegistration } from "../../types/registration/dataFromRegistration"
import ValidationError from "../../backend/security/validationError"
import UserValidator from "../../backend/security/userValidator"

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
        }
    }
}

function handleRegistrationStepOne(data:DataFromRegistration, validator: UserValidator,res: NextApiResponse){
    const errors: ValidationError | null = validator
        .required("sex")
        .string("sex")
        .name('name')
        .firstname("firstname")
        .username("username")
        .getErrors()
    res.status(200).json({success: true}) 
    // try {
    //     if(errors === null){
    //         insertUserIdentity(data)
    //         res.status(200).json({success: true}) 
    //     }else {
    //         res.status(500).json({...errors, success: false})
    //     }
        
    // }catch(error){
    //     res.status(500).json({success: false})
    // }
}

async function insertUserIdentity(userIdentity: DataFromRegistration): Promise<void>{
    const userTable = new UserTable()
    
    try {
        const success = await userTable.new({
            'name': userIdentity.name, 
            'firstname': userIdentity.firstname, 
            'username': userIdentity.username, 
            'sex': userIdentity.sex
        })
        
    }catch(err){
        console.error(err)
        throw new Error("Echec de l'insertion dans la base de données à cause d'une erreur")
    }
}

function handleRegistrationStepTwo(data:DataFromRegistration, validator: UserValidator,res: NextApiResponse) {
    const errors = validator
        .email("email")
        .password("password")
        .equals("password", "password_confirmation")
        .getErrors()
    console.log(errors)
}