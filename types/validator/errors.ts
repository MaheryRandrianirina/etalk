import { ColumnsToFill, Entity } from "../Database"
import { User } from "../user"

type keyofEntityArray<T extends Entity> = (keyof ColumnsToFill<T>)[]

interface ValidationErrors<T extends Entity> {
    "required": keyofEntityArray<T>,
    "number": keyofEntityArray<T>,
    "string": keyofEntityArray<T>,
    "exclude": keyofEntityArray<T>,
    "min_length": {[index: string]: (string|number)[]},
    "max_length": {[index: string]: (string|number)[]},
    "username": keyof ColumnsToFill<T> | "",
    "name": keyof ColumnsToFill<T> | "",
    "firstname": keyof ColumnsToFill<T> | "",
    "email": keyof ColumnsToFill<T> | "",
    "password": keyof ColumnsToFill<T> | "",
    "inequals": [keyof ColumnsToFill<T> | '', keyof ColumnsToFill<T> | '']
}


// type GlobalValidationErrors = {
//     [key in keyof UserValidationErrors]: key extends "username" | "name" | "firstname" | 'email' | 'password'
//         ? UserValidationErrors[key] | undefined : UserValidationErrors[key]
// }

type ValidationErrorTypes<T extends Entity> = keyof ValidationErrors<T>

type UserSpecificValidationErrorTypes = "email" | "username" | "name" | "firstname" | "password"
export type { ValidationErrors, 
    ValidationErrorTypes, 
    UserSpecificValidationErrorTypes
}