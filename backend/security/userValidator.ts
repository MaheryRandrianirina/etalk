import { Entity } from "../../types/Database";
import { ValidationErrorTypes, ValidationErrors } from "../../types/validator/errors";
import Validator from "./validator";

export default class UserValidator<T extends Entity> extends Validator<T> {

    protected caractersToExclude: string = '[-@<>?!/#~&()^=°+{}`à*%,;:§$¤]'

    name(name: keyof T): this {
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

    firstname(firstname: keyof T): this {
        return this.username(firstname)
    }

    username(username: keyof T): this
    {
        this.checkFieldError(username, (fieldInOb, field)=>{
            const errors = this.required(username)
                .string(username)
                .length(username, 3, 20)
                .exclude(username)
                .getErrors()
            
            if(errors !== null){
                const f = username as ValidationErrorTypes<T>
                this.addError(field, f)
            }
        })
        
        return this
    }

    email(field: keyof T): this {
        this.checkFieldError(field, (fieldInObj, field)=>{
            this.caractersToExclude = this.caractersToExclude.replace("@", "")
            
            const errors = this.required(field)
                .string(field)
                .exclude(field)
                .getErrors()
             
            if(errors !== null) {
                this.addError(field, "email")
            }
        })
        return this
    }

    password(field: keyof T): this {
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