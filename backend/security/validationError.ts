import { Entity } from "../../types/Database"
import {  UserSpecificValidationErrorTypes, ValidationErrorTypes, ValidationErrors } from "../../types/validator/errors"

export default class ValidationError<T extends Entity> {

    private errors: {[index: string]: string[]} = {}
    private currentField: string | number = ""

    
    constructor(private validationErrors: ValidationErrors<T>){
        for(const type in this.validationErrors){
            
            const t = type as ValidationErrorTypes<T>
            if(t !== "max_length" && 
                t !== "min_length" && 
                t !== "username" &&
                t !== "firstname" &&
                t !== "name" && t !== "email" 
                && t !== "password" && t !== 'inequals'
            ){
                this.validationErrors[t].forEach(field => {
                    this.currentField = field as string
                    if(t === "required" && this.currentField.length > 0){
                        this.pushError("Ce champ est requis")
                    }else if(t === "string" && this.currentField.length > 0){
                        this.pushError("Ce champ doit être une chaîne de caractères.")
                    }else if (t === "exclude" && this.currentField.length > 0){
                        this.pushError(`Ce champ ne peut pas contenir des caractères spéciaux.`)
                    }else if(t === "number" && this.currentField.length > 0){
                        this.pushError(`La valeur de ce champ doit être un nombre.`)
                    }
                })
            }else if(t === "min_length"){
                for(const field in this.validationErrors[t]){
                    if(field.length > 0){
                        this.currentField = field
                        this.pushError(`Ce champ doit contenir au moins ${this.validationErrors[t][field][1]} caractères.`)
                    }
                    
                }
            }else if(t === "max_length"){
                for(const field in this.validationErrors[t]){
                    if(field.length > 0){
                        this.currentField = field
                        this.pushError(`Ce champ doit contenir au plus ${this.validationErrors[t][field][1]} caractères.`)
                    }
                }
            }else if(t === 'email' || 
                t === "username" || 
                t === "password" || 
                t === "name" ||
                t === "firstname"){
                this.pushErrorForSpecificField(t, `Ce champ ne contient pas un email valide`)
            }else if(t === 'inequals'){
                this.currentField = this.validationErrors[t][1] as string
                if(typeof this.currentField === "string" && this.currentField.length > 0){
                    this.pushError(`Ce champ doit contenir la même valeur que le champ précédent`)
                }
            }
        }
    }

    pushError(message: string): void
    {
        if(this.errors[this.currentField] === undefined){
            this.errors[this.currentField] = []
        }
        this.errors[this.currentField].push(message)
    }

    get(): {[index: string]: string[]} {
        return this.errors
    }

    /**
     * 
     * @param type Type spécifique regroupant plusieurs erreurs et qui n'appartient qu'à
     * un seul champ. Ex: le type email contenant les erreurs de champ vide, champ string,... n'appartient qu'au champ email
     * @param message 
     */
    pushErrorForSpecificField(type: UserSpecificValidationErrorTypes, message: string){
        const field = this.validationErrors[type]

        if(field !== "") {
            this.currentField = field as string
            this.pushError(message)
        }
    }
}