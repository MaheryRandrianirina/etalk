import { DataFromRegistration } from "./dataFromRegistration";


type RegistrationFormErrors = {
    [key in keyof DataFromRegistration]?: key extends "sex" ? never : DataFromRegistration[key][]
}

export type { RegistrationFormErrors }