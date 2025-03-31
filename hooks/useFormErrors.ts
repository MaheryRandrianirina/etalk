import { Dispatch, SetStateAction, useState } from "react";
import { LoginFormErrors, RegistrationFormErrors } from "../types/errors";

export default function useFormErrors<T extends RegistrationFormErrors | LoginFormErrors>(init: {[key in keyof T]: T[key]}): [T, Dispatch<SetStateAction<{[key in keyof T]: T[key]}>>] {
    const [formErrors, setFormErrors]: [
        formErrors: T,
        setFormErrors: Dispatch<SetStateAction<{[key in keyof T]: T[key]}>>
    ] = useState(init)

    return [formErrors, setFormErrors]
}