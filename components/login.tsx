import { ChangeEvent, ChangeEventHandler, Context, Dispatch, MouseEventHandler, SetStateAction, SyntheticEvent, useState } from "react";
import { InputCheckbox, InputPassword, InputText } from "./form/input";
import { PrimaryButton } from "./widgets/button";
import Link from "next/link";
import { ButtonContext } from "./contexts/ButtonContext";
import axios, { AxiosError } from "axios";
import useFormErrors from "../lib/hooks/useFormErrors";
import { LoginFormErrors } from "../types/errors";

export type LoginInputs = {
    username: string,
    password: string,
    remember_me: boolean
}

const PostLoginData = async (data: LoginInputs) => {
    try {
        const res = await axios.post("/api/login", data)
        if(res.statusText === "OK"){
            return res.data
        }else {
            throw new Error("Une erreur est survenue lors de la connexion")
        }
    }catch(e){
        throw e
    }
    
}

export default function Login(): JSX.Element {

    const [inputsValues, setInputsValues]: [
        inputsValues: LoginInputs, 
        setInputsValues: Dispatch<SetStateAction<LoginInputs>>
    ] = useState({
        username: "",
        password: "",
        remember_me: false
    } as LoginInputs)

    const [formErrors, setFormErrors]= useFormErrors<LoginFormErrors>({})

    const handleChangeInputs: ChangeEventHandler = (event: ChangeEvent<HTMLInputElement>)=>{
        const target = event.currentTarget
        switch(target.name) {
            case "username":
                setInputsValues(v => {
                    return {...v, username: target.value}
                })
                break
            case "password":
                setInputsValues(v => {
                    return { ...v, password: target.value }
                })
                break
            case "remember_me":
                setInputsValues(v => {
                    return { ...v, remember_me: "checked" in target ? target.checked : false }
                })
                break
        }
    }

    const handleClickButton: MouseEventHandler<HTMLButtonElement> = async (e)=>{
        e.preventDefault();

        try {
            await PostLoginData(inputsValues) as {success: boolean, message: string}
        }catch(e){
            const error = e as AxiosError
            const errorResponse = error.response

            if(errorResponse !== undefined 
                && typeof errorResponse.data === "object" 
                && errorResponse.data !== null
            ){
                if("errors" in errorResponse.data){
                    const errors = errorResponse.data.errors as LoginFormErrors
                    setFormErrors(errors)
                }else if("sqlError" in errorResponse.data){
                    const sqlError = errorResponse.data.sqlError
                    // ON FAIT CA QUAND ON RENCOTRE UN CAS D'ERREUR SQL
                    // if(typeof sqlError === "string" && sqlError.includes("ER_DUP_ENTRY")){
                    //     const message = "Cette valeur existe déjà"
    
                    //     if(sqlError.includes("username")){
                    //         setFormErrors(e =>{
                    //             return {...e, username: [message]}
                    //         })
                    //     }else if(sqlError.includes('password')){
                    //         setFormErrors(e =>{
                    //             return {...e, password: [message]}
                    //         })
                    //     }
    
                    // }else {
                    //     console.error(sqlError)
                    // }
                }
            }
            
        }
        
    }
    const disabledButton: boolean = inputsValues.username.length < 3 
        || inputsValues.password.length < 8

    return <div className="login_page">
        {JSON.stringify(inputsValues)}
        <div className="logo">LOGO</div>
        <form action="" method="post">
            <InputText events={{
                onChange: handleChangeInputs
            }} errors={formErrors.username !== undefined ? formErrors.username : null} attributes={{className: "username_input", name: "username", value: inputsValues.username, placeholder: "Pseudo"}}/>
            
            <InputPassword events={{
                onChange: handleChangeInputs
            }} attributes={{className: "password_input", name: "password", value: inputsValues.password, placeholder: "Mot de passe"}}/>
            
            <InputCheckbox events={{
                onChange: handleChangeInputs
            }} label="se souvenir de moi" attributes={{className: "remember_me_input", name: "remember_me", checked: inputsValues.remember_me}}/>
            
            <ButtonContext.Provider value={handleClickButton}>
                <PrimaryButton disabled={disabledButton}>Se connecter</PrimaryButton>
            </ButtonContext.Provider>
            <div className="no_account_yet">
                Pas de compte ? <Link href="/register" className="registration_link_from_login">S&lsquo;inscrire</Link>
            </div>
        </form>
    </div>
}