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
import {DataFromRegistration} from "../types/registration/dataFromRegistration";
import { PostDataReturnType } from "../types/registration/dataBaseCommunication"
import { RegistrationStepThreeProperties } from "../types/registration/registration";
import useFormErrors from "../lib/hooks/useFormErrors";
import { RegistrationFormErrors } from "../types/errors";
import { getServerSideProps } from "./api/authenticated";


const PostDataforRegistration: (step: number, data: UserIdentity | UserUniqueProperties | {image:File})=>Promise<PostDataReturnType> 
    = async (step, data): Promise<any> => {
    try {
        let res
        if("image" in data){
            const imageSizeAccepted: boolean = data.image.size <= 10 * 1024 *1024
            if(imageSizeAccepted){
                const formdata = new FormData()
                formdata.append("profile_photo", data.image)
                res = await axios.postForm("/api/register", formdata, {
                    headers: {
                        "Content-Type": "multipart/form-data"
                    }
                })
            }else {
                console.error("Le fichier est trop volumineux")
            }
        }else {
            res = await axios.post("/api/register", {registrationStep: step, data: data})
        }
        
        if(res?.statusText === "OK"){
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

    const [formErrors, setFormErrors]= useFormErrors<RegistrationFormErrors>({})

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

    const rulesForEachStep = {
        one: identity.name.length >= 3 
            && identity.firstname.length >= 3 
            && identity.username.length >= 3
            && (identity.sex === "man" || identity.sex === "woman"),
        two: userUniqueProperties.email.includes("@") 
            && userUniqueProperties.email.includes('.')
            && userUniqueProperties.password.length >= 8
            && userUniqueProperties.password_confirmation.length >= 8
            && (userUniqueProperties.password === userUniqueProperties.password_confirmation)
    }

    const handleSubmit: FormEventHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()

        try {
            let res: PostDataReturnType | undefined
            if(registerStep === 1){
                res = await PostDataforRegistration(registerStep, identity)
            }else if(registerStep === 2){
                res = await PostDataforRegistration(registerStep, userUniqueProperties)
            }else if(registerStep === 3){
                console.log("register step 3")
                const activeButton = stepThreeProperties.activeButton
                if(activeButton === "finish" && stepThreeProperties.chosenImage !== null){
                    
                    PostDataforRegistration(registerStep, {image: stepThreeProperties.chosenImage}).then(res => {
                        if("success" in res && res.success === true){
                            setRegisterStep((s: number) => s + 1)
                        }else {
                            console.error("Echec de l'insertion de l'image. Veuillez réessayer.")
                        }
                    })
                }else if(activeButton === "ignore") {
                    setRegisterStep((s: number) => s + 1)
                }
            }

            if( res !== undefined && 'success' in res && res.success === true){
                setRegisterStep((s: number) => s + 1)
            }else if(res !== undefined && 'success' in res && res.success === false){
                if("sqlError" in res){
                    console.error(res.sqlError)
                }
            }
        }catch(error){
            if(error instanceof AxiosError && error.response !== undefined){
                const errorData = error.response.data
                if("errors" in errorData){
                    setFormErrors(errorData.errors)
                }else if("sqlError" in errorData){
                    const sqlError = errorData.sqlError
                    if(typeof sqlError === "string" && sqlError.includes("ER_DUP_ENTRY")){
                        const message = "Cette valeur existe déjà"

                        if(sqlError.includes("username")){
                            setFormErrors(e=>{
                                return {...e, username: [message]}
                            })
                        }else if(sqlError.includes('password')){
                            setFormErrors(e=>{
                                return {...e, password: [message]}
                            })
                        }else if(sqlError.includes('email')){
                            setFormErrors(e=>{
                                return {...e, email: [message]}
                            })
                        }

                    }else {
                        console.error(sqlError)
                    }
                }else {
                    console.error(error)
                }
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
        
    }

    const chooseProfilPic: MouseEventHandler = (event: SyntheticEvent) => {

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

    const disabledButton: boolean | null = registerStep === 1 
        ? rulesForEachStep.one === false
        : (registerStep === 2 ? rulesForEachStep.two === false : null)

    return <div className="registration_page">
        {registerStep === 1 && <Link href="/login" className={styles.to_loginpage_button}>
            Se connecter
        </Link>}
        {registerStep < 4 ? <form method="post" onSubmit={handleSubmit} encType="multipart/form-data">
            
            {registerStep === 1 && <RegisterStepOne inputsEvents={{
                onChange: handleChange
            }} values={{
                name: identity.name,
                firstname: identity.firstname,
                username: identity.username,
                sex: identity.sex
            }} errors={formErrors} disableButton={disabledButton as boolean}/>}
            
            {registerStep === 2 && <RegisterStepTwo inputsEvents={{
                onChange: handleChange
            }} values={{
                email:userUniqueProperties.email,
                password: userUniqueProperties.password,
                password_confirmation: userUniqueProperties.password_confirmation
            }} disableButton={disabledButton as boolean}/>}

            {registerStep === 3 && <RegisterStepThree events={{
                onClick: chooseProfilPic
            }} activeButton={stepThreeProperties.activeButton}
                chosenProfilePhoto={stepThreeProperties.chosenImage}
            />}
        </form> : <CongratsForSubscription/>}
    </div>
}

export {getServerSideProps}
