import {
    ChangeEvent,
    ChangeEventHandler,
    Dispatch,
    FormEvent,
    FormEventHandler,
    MouseEventHandler,
    SetStateAction,
    SyntheticEvent,
    useState
} from "react";
import {RegisterStepOne, RegisterStepThree, RegisterStepTwo} from "../components/form/registerStepElements";
import CongratsForSubscription from "../components/congratsForSubscription";
import styles from "../styles/sass/modules/buttons.module.scss";
import Link from "next/link";
import {UserIdentity, UserUniqueProperties} from "../types/user";
import axios, {AxiosError} from "axios";
import {RegistrationFormErrors} from "../types/registration/registrationFormErrors";
import {DataFromRegistration} from "../types/registration/dataFromRegistration";
import { PostDataReturnType } from "../types/registration/dataBaseCommunication";


const PostData: (step: number, data: UserIdentity | UserUniqueProperties)=>Promise<PostDataReturnType> 
    = async (step, data): Promise<any> => {
    try {
        const res = await axios.post("/api/user", {registrationStep: step, data: data})
        if(res.statusText === "OK"){
            return res.data
        }
    }catch(error){
        throw error
    }
}

export default function Register(): JSX.Element {
    const [registerStep, setRegisterStep]: [
        registerStep: number,
        stRegisterStep: Function
    ] = useState(1)

    const [identity, setIdentity]: [identity: UserIdentity, setIdentity: Function] = useState({
        name: "",
        firstname: "",
        username: "",
        sex: "man"
    })

    const [formErrors, setFormErrors]: [
        formErrors: RegistrationFormErrors,
        setFormErrors: Function
    ] = useState({})

    const [userUniqueProperties, setUserUniqueProperties]: [
        userUniqueProperties: UserUniqueProperties,
        setUserUniqueProperties: Function
    ] = useState({
        email: "",
        password: "",
        password_confirmation: "",
        id: null
    })

    const handleSubmit: FormEventHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            let res: PostDataReturnType | undefined
            if(registerStep === 1){
                res = await PostData(registerStep, identity)
            }else if(registerStep === 2){
                res = await PostData(registerStep, userUniqueProperties)
            }

            if( res !== undefined && 'success' in res && res.success === true){
                if("insertedUserId" in res){
                    setUserUniqueProperties((p: UserUniqueProperties) => {
                        return {...p, id:res?.insertedUserId}
                    })
                }
                setRegisterStep((s: number) => s + 1)
            }
        }catch(error){
            if(error instanceof AxiosError && "errors" in error.response?.data){
                setFormErrors(error.response?.data.errors)
            }
            
        }
        
    }

    const handleChange: ChangeEventHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const targetName = event.target.name as Exclude<keyof DataFromRegistration,"sex">

        const value: string = event.target.value

        if(targetName === "name"){
            setIdentity((s:UserIdentity) => {
                return {...s,
                    name: value 
                }
            })
        }else if(targetName === "firstname"){
            setIdentity((s:UserIdentity) => {
                return {...s, firstname: value} 
            })
        }else if(targetName === "username") {
            setIdentity((s:UserIdentity)=>{
                return {...s, username: value}
            })
        }else if(event.target.className === "man_radio_button" || event.target.className === "woman_radio_button"){
            setIdentity((s:UserIdentity)=>{
                return {...s,sex: value}
            })
        }else if(targetName === "email"){
            setUserUniqueProperties((properties: UserUniqueProperties) => {
                return {
                    ...properties, email: value
                }
            })
        }else if(targetName === "password"){
            setUserUniqueProperties((properties: UserUniqueProperties) => {
                return {
                    ...properties, password: value
                }
            })
        }else if(targetName === "password_confirmation"){
            setUserUniqueProperties((properties: UserUniqueProperties) => {
                return {
                    ...properties, password_confirmation: value
                }
            })
        }
    }

    const chooseProfilPic: MouseEventHandler = (event: SyntheticEvent) => {

    }

    return <div className="registration_page">
        {registerStep === 1 && <Link href="/login" className={styles.to_loginpage_button}>
            Se connecter
        </Link>}
        {registerStep < 4 ? <form method="post" onSubmit={handleSubmit}>
            
            {registerStep === 1 && <RegisterStepOne inputsEvents={{
                onChange: handleChange
            }} values={{
                name: identity.name,
                firstname: identity.firstname,
                username: identity.username,
                sex: identity.sex
            }} errors={formErrors}/>}
            {JSON.stringify(userUniqueProperties)}
            {registerStep === 2 && <RegisterStepTwo inputsEvents={{
                onChange: handleChange
            }} values={{
                email:userUniqueProperties.email,
                password: userUniqueProperties.password,
                password_confirmation: userUniqueProperties.password_confirmation,
                id: userUniqueProperties.id
            }}/>}

            {registerStep === 3 && <RegisterStepThree events={{
                onClick: chooseProfilPic
            }}/>}
        </form> : <CongratsForSubscription/>}
    </div>
}