import { ValidationErrorTypes, ValidationErrors } from "../../types/validator/errors";
import Validator from "./validator";

export default class UserValidator extends Validator {

    protected caractersToExclude: string = '[-@<>?!/#~&()^=°+{}`à*%,;:§$¤]'

    name(name: string): this {
        this.checkFieldError(name, (fieldInObj, field)=>{
            const errors = this.required(name)
                .string(name)
                .length(name, 3, 40)
                .exclude(name)
                .getErrors()
            
            if(errors !== null){
                this.addError(field, "name")
            }
        })
        return this
    }
    
    protected addError(field: string, type: ValidationErrorTypes): void {
        
        if(!this.lengthForFieldAreInit()
            && (type === "min_length" || type === "max_length")
        ){
            this.errors[type][field] = [field, this.lengthForField[type]]
            this.lengthForField = {min_length: 0, max_length: 0}
        }else if(type !== "min_length" && 
            type !== "max_length" && 
            type !== "username" &&
            type !== "firstname" && 
            type !== "name" && type !== "email" 
            && type !== "password"
        ){
            this.errors[type].push(field)
        }else if(type !== "min_length" && type !== "max_length"){
            this.errors[type] = field
        }
    }

    firstname(firstname: string): this {
        return this.username(firstname)
    }

    username(username: string): this
    {
        this.checkFieldError(username, (fieldInOb, field)=>{
            const errors = this.required(username)
                .string(username)
                .length(username, 3, 20)
                .exclude(username)
                .getErrors()
            
            if(errors !== null){
                const f = username as ValidationErrorTypes
                this.addError(field, f)
            }
        })
        
        return this
    }

    email(field: string): this {
        this.checkFieldError(field, (fieldInObj, field)=>{
            this.caractersToExclude = this.caractersToExclude.replace("@", "")
            
            const errors = this.required(field)
                .string(field)
                .exclude(field)
                .getErrors()
            console.log("email", errors)  
            if(errors !== null) {
                this.addError(field, "email")
            }
        })
        return this
    }

    password(field: string): this {
        this.checkFieldError(field, (fieldInObj, field)=>{
            const errors = this.required(field)
                .string(field)
                .length(field, 8, 256)
                .getErrors()
            
            if(errors !== null){
                this.addError(field, 'password')
            }

        })
        return this
    }
}