interface ValidationErrors {
    "required": string[],
    "number": string[],
    "string": string[],
    "exclude": string[],
    "min_length": {[index: string]: (string|number)[]},
    "max_length": {[index: string]: (string|number)[]},
    "username": string
    "name": string,
    "firstname": string,
    "email": string,
    "password": string,
    "inequals": [string, string]
}


// type GlobalValidationErrors = {
//     [key in keyof UserValidationErrors]: key extends "username" | "name" | "firstname" | 'email' | 'password'
//         ? UserValidationErrors[key] | undefined : UserValidationErrors[key]
// }

type ValidationErrorTypes = keyof ValidationErrors
type UserSpecificValidationErrorTypes = "email" | "username" | "name" | "firstname" | "password"
export type { ValidationErrors, 
    ValidationErrorTypes, 
    UserSpecificValidationErrorTypes
}