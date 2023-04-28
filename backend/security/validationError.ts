import {  UserSpecificValidationErrorTypes, ValidationErrorTypes, ValidationErrors } from "../../types/validator/errors"

export default class ValidationError {

    private errors: {[index: string]: string[]} = {}
    private currentField: string | number = ""

    constructor(private validationErrors: ValidationErrors){
        
        for(const type in this.validationErrors){
            const t = type as ValidationErrorTypes
            
            if(t !== "max_length" && 
                t !== "min_length" && 
                t !== "username" &&
                t !== "firstname" &&
                t !== "name" && t !== "email" 
                && t !== "password" && t !== 'inequals'
            ){

                this.validationErrors[t].forEach(field => {
                    this.currentField = field
                    if(t === "required"){
                        this.pushError("Ce champ est requis")
                    }else if(t === "string"){
                        this.pushError("Ce champ doit être une chaîne de caractères.")
                    }else if (t === "exclude"){
                        this.pushError(`Ce champ ne peut pas contenir des caractères spéciaux.`)
                    }else {
                        this.pushError(`La valeur de ce champ doit être un nombre.`)
                    }
                })
            }else if(t === "min_length"){
                for(const field in this.validationErrors[t]){
                    this.currentField = field
                    this.pushError(`Ce champ doit contenir au moins ${this.validationErrors[t][field][1]} caractères.`)
                }
            }else if(t === "max_length"){
                for(const field in this.validationErrors[t]){
                    this.currentField = field
                    this.pushError(`Ce champ doit contenir au plus ${this.validationErrors[t][field][1]} caractères.`)
                }
            }else if(t === 'email'){
                this.pushErrorForSpecificField(t, `Ce champ ne contient pas un email valide`)
            }else if(t === "password"){
                this.pushErrorForSpecificField(t, "Ce champ contient un mot de passe invalide")
            }else if(t === 'inequals'){
                console.log('here we are in inequals error')
                this.currentField = this.validationErrors[t][1]
                this.pushError(`Ce champ doit contenir la même valeur que le champ précédent`)
            }else{
                this.pushErrorForSpecificField(t, `Ce champ est invalide`)
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
            this.currentField = field
            this.pushError(message)
        }
    }
}