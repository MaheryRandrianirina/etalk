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
import { PostDataReturnType } from "../types/registration/dataBaseCommunication"
import { RegistrationStepThreeProperties } from "../types/registration/registration";


const PostData: (step: number, data: UserIdentity | UserUniqueProperties | File)=>Promise<PostDataReturnType> 
    = async (step, data): Promise<any> => {
    try {
        const res = await axios.post("/api/register", {registrationStep: step, data: data})
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
        password_confirmation: ""
    })

    const [stepThreeProperties, setStepThreeProperties]: [
        stepThreeProperties: RegistrationStepThreeProperties, 
        setStepThreeProperties: Dispatch<SetStateAction<RegistrationStepThreeProperties>>
    ] = useState({
        activeButton: "ignore",
        chosenImage: null
    } as RegistrationStepThreeProperties)

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
                setRegisterStep((s: number) => s + 1)
            }else if(res !== undefined && 'success' in res && res.success === false){
                console.error("Echec de l'insertion")
                if("sqlError" in res){
                    console.error(res.sqlError)
                }
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
                return {...s, name: value}
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

    const handleStepThreeButtonClick: MouseEventHandler<HTMLButtonElement> = (e: SyntheticEvent) => {
        e.preventDefault()
        
        /* ON INITIALISE UNE SESSION ICI. JUSTE AVANT L'ETAPE EN DESSOUS*/
        const activeButton = stepThreeProperties.activeButton
        if(activeButton === "finish" && stepThreeProperties.chosenImage !== null){
            PostData(registerStep, stepThreeProperties.chosenImage).then(res => {
                if("success" in res && res.success === true){
                    setRegisterStep((s: number) => s + 1)
                }else {}
            })
        }else if(activeButton === "ignore") {
            setRegisterStep((s: number) => s + 1)
        }
    }

    const chooseProfilPic: MouseEventHandler = (event: SyntheticEvent) => {
        console.log("choose profile pic")

        const fileInput = document.querySelector('.hidden_file_input') as HTMLInputElement
        if(fileInput && fileInput.type === "file"){
            fileInput.click()
            fileInput.addEventListener('change', ()=>{
                setStepThreeProperties(s =>{
                    const file = fileInput.files !== null ? fileInput.files[0] : null
                    return {...s, activeButton: "finish", chosenImage: file}
                })
            })
            
        }else {
            console.error("La variable fileInput possède une valeur null ou n'est pa de type file")
        }
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
            
            {registerStep === 2 && <RegisterStepTwo inputsEvents={{
                onChange: handleChange
            }} values={{
                email:userUniqueProperties.email,
                password: userUniqueProperties.password,
                password_confirmation: userUniqueProperties.password_confirmation
            }}/>}

            {registerStep === 3 && <RegisterStepThree onButtonClick={handleStepThreeButtonClick} events={{
                onClick: chooseProfilPic
            }} activeButton={stepThreeProperties.activeButton}
                chosenProfilePhoto={stepThreeProperties.chosenImage}
            />}
        </form> : <CongratsForSubscription/>}
    </div>
}
