import { LoginInputs } from "../components/organisms/login"
import { DataFromRegistration } from "./registration/dataFromRegistration" 


type RegistrationFormErrors = {
    [key in keyof DataFromRegistration]?: key extends "sex" ? never : DataFromRegistration[key]
}

type LoginFormErrors = {
    [key in keyof LoginInputs]?: key extends "remember_me" ? never : LoginInputs[key]
}

export type { RegistrationFormErrors, LoginFormErrors }