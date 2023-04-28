import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, MouseEventHandler, SyntheticEvent, useState } from "react";
import { RegisterStepOne, RegisterStepThree, RegisterStepTwo } from "../components/form/registerStepElements";
import CongratsForSubscription from "../components/congratsForSubscription";
import styles from "../styles/sass/modules/buttons.module.scss";
import Link from "next/link";
import { UserIdentity, UserUniqueProperties } from "../types/user";
import axios, { AxiosError } from "axios";
import { RegistrationFormErrors } from "../types/registration/registrationFormErrors";
import { DataFromRegistration } from "../types/registration/dataFromRegistration";

const PostData: (step: number, identity: UserIdentity)=>Promise<any> = async (step, identity): Promise<any> => {
    try {
        const res = await axios.post("/api/user", {registrationStep: step, data: identity})
        if(res.statusText === "OK"){
            return res.data
        }
    }catch(error){
        throw error
    }
}

export default function Register(): JSX.Element {
    const [registerStep, setRegisterStep] = useState(1)

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
        passwordConfirmation: ""
    })

    const handleSubmit: FormEventHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            const res = await PostData(registerStep, identity)
            if('success' in res && res.success === true){
                console.log(res)
                setRegisterStep(s => s + 1)
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
                    ...properties, passwordConfirmation: value
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
                passwordConfirmation: userUniqueProperties.passwordConfirmation
            }}/>}

            {registerStep === 3 && <RegisterStepThree events={{
                onClick: chooseProfilPic
            }}/>}
        </form> : <CongratsForSubscription/>}
    </div>
}