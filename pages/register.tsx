import {
    ChangeEvent,
    ChangeEventHandler,
    Dispatch,
    FormEvent,
    FormEventHandler,
    MouseEventHandler,
    SetStateAction,
    SyntheticEvent,
    useEffect,
    useState
} from "react";
import {RegisterStepOne, RegisterStepThree, RegisterStepTwo} from "@/components/organisms/registerStepElements";
import CongratsForSubscription from "@/components/molecules/congratsForSubscription";
import buttons_styles from "@/styles/sass/modules/buttons.module.scss";
import Link from "next/link";
import {UserIdentity, UserUniqueProperties} from "@/types/user";
import axios, { AxiosError, AxiosResponse } from "axios";
import {DataFromRegistration} from "@/types/registration/dataFromRegistration";
import { PostDataReturnType } from "@/types/registration/dataBaseCommunication"
import { RegistrationStepThreeProperties } from "@/types/registration/registration";
import useFormErrors from "@/hooks/useFormErrors";
import { RegistrationFormErrors } from "@/types/errors";
import { getServerSideProps } from "@/pages/api/authenticated";
import { FileError, UploadError } from "@/lib/index";
import { password_alerts } from "@/lib/constants";
import { debounce } from "@/lib/utils";
import { ProgressContext } from "@/components/contexts/Progress";
import { onUploadProgress } from "@/lib/utils/events";
import { setPageTitle } from "@/lib/utils/page";
import { page_title} from "@/lib/constants";


const PostDataforRegistration: (
    step: number, 
    data: UserIdentity | UserUniqueProperties | {image:File},
    setProgress: (progress: number) => void
) => Promise<PostDataReturnType> = async (step, data, setProgress): Promise<any> => {
    try {
        let res: AxiosResponse<{success: boolean}, unknown> | undefined

        if("image" in data){
            const imageSizeAccepted: boolean = data.image.size <= 10*1024*1024
            
            if(!data.image.type.includes("image")){
                throw new FileError("Le format de votre fichier n\'est pas supporté")
            }

            if(imageSizeAccepted){
                const formdata = new FormData()
                formdata.append("profile_photo", data.image)

                const uploadRes = await axios.post("/api/upload", formdata) as AxiosResponse<{success: boolean, file?: string}, unknown>
                
                if(uploadRes.data.success){
                    res = await axios.post(
                        "/api/register", 
                        { 
                            registrationStep: step, 
                            data: {file: uploadRes.data.file}
                        }
                    ) as AxiosResponse<{success: boolean}, unknown>
                }else {
                    throw new UploadError("Le téléversement de votre fichier a échoué.\nVeuillez réessayer s'il vous plait")
                }
            }else {
                throw new FileError("Le fichier est trop volumineux")
            }
        }else {
            res = await axios.post("/api/register", {registrationStep: step, data: data}, {
                onUploadProgress: onUploadProgress(setProgress)
            })            
        }
        
        if(res?.statusText === "OK"){
            return res.data
        }
    }catch(error){
        throw error
    }
}

/**
 * verifie la validite du mot de passe
 * @param password string
 * @returns boolean
 */
const isValid: (password: string) => boolean = (password:string) => {
    return password.length >= 8 && password.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).+$/) !== null
}

export default function Register(): JSX.Element {
    const [registerStep, setRegisterStep]: [
        registerStep: number,
        stRegisterStep: Function
    ] = useState(1)

    const [identity, setIdentity] = useState<UserIdentity>({
        name: "",
        firstname: "",
        username: "",
        sex: "man"
    } as UserIdentity)

    const [formErrors, setFormErrors]= useFormErrors<RegistrationFormErrors>({})

    const [userUniqueProperties, setUserUniqueProperties] = useState<UserUniqueProperties>({
        email: "",
        password: "",
        password_confirmation: ""
    } as UserUniqueProperties)

    const [stepThreeProperties, setStepThreeProperties]: [
        stepThreeProperties: RegistrationStepThreeProperties, 
        setStepThreeProperties: Dispatch<SetStateAction<RegistrationStepThreeProperties>>
    ] = useState({
        activeButton: "ignore",
        chosenImage: null
    } as RegistrationStepThreeProperties)

    const [passConfirmationError, setpassConfirmationError] = useState<string|null>(null)
    const [passwordInvalidError, setPasswordInvalidError] = useState<string|null>(null)
    const [progress, setProgress] = useState<number>(0)

    useEffect(()=>{

        setPageTitle(page_title.REGISTER)

        if(userUniqueProperties.password !== "" && !isValid(userUniqueProperties.password)){
            debounce(() => setPasswordInvalidError(password_alerts.PASSWORD_INVALID))()
        }else {
            debounce(() => setPasswordInvalidError(e => e !== null ? null : e))()
        }

        if(userUniqueProperties.password_confirmation !== "" && userUniqueProperties.password !== userUniqueProperties.password_confirmation){
            debounce(() => setpassConfirmationError(password_alerts.PASSWORD_CONFIRMATION))()
        }else{
            debounce(() => setpassConfirmationError(null))()
        }
    }, [userUniqueProperties.password, userUniqueProperties.password_confirmation])

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
                res = await PostDataforRegistration(registerStep, identity, setProgress)
            }else if(registerStep === 2){
                res = await PostDataforRegistration(registerStep, userUniqueProperties, setProgress)
            }else if(registerStep === 3){
                const activeButton = stepThreeProperties.activeButton
                if(activeButton === "finish" && stepThreeProperties.chosenImage !== null){
                    res = await PostDataforRegistration(
                        registerStep, 
                        {image: stepThreeProperties.chosenImage},
                        setProgress
                    )
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
                                return {...e, username: message}
                            })
                        }else if(sqlError.includes('password')){
                            setFormErrors(e=>{
                                return {...e, password: message}
                            })
                        }else if(sqlError.includes('email')){
                            setFormErrors(e=>{
                                return {...e, email: message}
                            })
                        }

                    }else {
                        console.error(sqlError)
                    }
                }else {
                    console.error(error)
                }
            }else if(error instanceof FileError
                || error instanceof UploadError
            ){
                console.error(error.message)
            }
            
        }

        // reset progress a 0
        setProgress(0)
    }

    const handleChange: ChangeEventHandler = (event: ChangeEvent<HTMLInputElement>) => {
        const targetName = event.target.name as Exclude<keyof DataFromRegistration,"sex">
        
        const value: string = event.target.value

        if(targetName === "name" || targetName === "firstname" || targetName === "username"){
            setIdentity((s:UserIdentity) => ({...s, [targetName]: value}))
        }else if(event.target.className === "man_radio_button" || event.target.className === "woman_radio_button"){
            setIdentity((s)=>({...s,sex: value} as UserIdentity))
        }else if(targetName === "email" || targetName === "password" || targetName === "password_confirmation"){
            setUserUniqueProperties((properties: UserUniqueProperties) => ({...properties, [targetName]: value}))
        }
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
        {registerStep === 1 && <Link href="/login" className={buttons_styles.to_loginpage_button}>
            Se connecter
        </Link>}
        {registerStep < 4 ? 
        <form method="post" onSubmit={handleSubmit} encType="multipart/form-data">
            <ProgressContext.Provider value={progress}>
                {registerStep === 1 && <RegisterStepOne inputsEvents={{
                    onChange: handleChange
                }} values={{
                    name: identity.name,
                    firstname: identity.firstname,
                    username: identity.username,
                    sex: identity.sex
                } as UserIdentity} errors={formErrors} disableButton={disabledButton as boolean}/>}
                
                {registerStep === 2 && 
                    <RegisterStepTwo inputsEvents={{
                    onChange: handleChange
                    }} values={{
                        email:userUniqueProperties.email,
                        password: userUniqueProperties.password,
                        password_confirmation: userUniqueProperties.password_confirmation
                    } as UserUniqueProperties} disableButton={disabledButton as boolean} 
                    passConfirmationError={passConfirmationError}
                    invalidPassError={passwordInvalidError}/>
                }

                {registerStep === 3 && <RegisterStepThree events={{
                    onClick: chooseProfilPic
                }} activeButton={stepThreeProperties.activeButton}
                    chosenProfilePhoto={stepThreeProperties.chosenImage}
                />}
            </ProgressContext.Provider>
        </form> 
            : 
        <CongratsForSubscription/>
        }
    </div>
}

export {getServerSideProps}
