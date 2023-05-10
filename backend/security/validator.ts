import { TableColumns } from "../../types/Database/tables/TableColumns"
import { ValidationErrorTypes, ValidationErrors } from "../../types/validator/errors"
import ValidationError from "./validationError"

export default class Validator {

    protected errors: ValidationErrors = {
        "required": [],
        "string": [],
        "number": [],
        "exclude": [],
        "min_length": {},
        "max_length": {},
        "name": "",
        "username": "",
        "firstname": "",
        "email": "",
        "password": "",
        "inequals": ["", ""]
    } 

    protected lengthForField: {min_length: number, max_length: number} = {min_length: 0, max_length: 0}

    protected caractersToExclude: string = ""

    constructor(protected data: TableColumns){
        
    }

    required(...fields: string[]): this {
        this.checkFieldError(fields, (fieldInObject, field)=>{
            if(this.data[fieldInObject] === null || this.data[fieldInObject] === "") {
                this.addError(field, "required")
            }
        })
        
        return this
    }

    protected checkFieldError(fields: string[] | string, callback: (fieldInObj: keyof TableColumns, field: string)=>void): void {
        if(fields instanceof Array){
            fields.forEach(field => {
                const fieldInObject = field as keyof TableColumns
                callback(fieldInObject, field)
            })
        }else if(typeof fields === "string"){
            const fieldInObject = fields as keyof TableColumns
            callback(fieldInObject, fields)
        }
    }
    
    protected addError(field: string | [string, string], type: ValidationErrorTypes): void {
        
        if(!this.lengthForFieldAreInit()
            && (type === "min_length" || type === "max_length") 
            && typeof field === "string"
        ){
            this.errors[type][field] = [field, this.lengthForField[type]]
            this.lengthForField = {min_length: 0, max_length: 0}
        }else if(type !== "min_length" && type !== "max_length" 
            && type !== "username"
            && type !== "firstname"
            && type !== "name" && type !== "password" 
            && type !== "email"
            && typeof field === "string"
        ){
            this.errors[type].push(field)
        }else if(typeof field !== "string" && type === "inequals"){
            this.errors[type] = field
        }
    }

    protected lengthForFieldAreInit(): boolean
    {
        return this.lengthForField.min_length === 0 && this.lengthForField.max_length === 0
    }

    string(...fields: string[]): this {
        this.checkFieldError(fields, (fieldInObject: keyof TableColumns, field: string)=>{
            const fieldValue = this.data[fieldInObject]
            
            if(typeof fieldValue === "string" && !isNaN(parseInt(fieldValue))) {
                console.log('adazd')
                this.addError(field, "string")
            }
        })

        return this
    }

    length(field: string, min: number, max: number): this {
        this.lengthForField = {min_length: min, max_length: max}
        
        this.checkFieldError(field, (fieldInObj, field)=>{
            const fieldValue = this.data[fieldInObj]
            if(typeof fieldValue === "string"){
                const valueLength = fieldValue.length
                if(valueLength < min){
                    this.addError(field, "min_length")
                }else if(valueLength > max){
                    this.addError(field, "max_length")
                }
            }
        })
        
        return this
    }

    exclude(field: string): this {
        this.checkFieldError(field, (fieldInObj, field)=>{
            const fieldValue = this.data[fieldInObj]

            if(typeof fieldValue === "string" && 
                (this.caractersToExclude.length > 0 
                    && new RegExp(this.caractersToExclude).test(fieldValue)
                )
            ){
                this.addError(field, "exclude")
            }
        })
        return this
    }


    equals(fieldOne: string, fieldTwo: string): this {
        const f_one = fieldOne as keyof TableColumns
        const f_two  = fieldTwo as keyof TableColumns
        
        if(this.data[f_one] !== this.data[f_two]){
            this.addError([f_one, f_two], "inequals")
        }
        
        return this
    }

    getErrors(): ValidationError | null
    {
        let errorsLength = 0
        for(const type in this.errors){
            const t = type as ValidationErrorTypes
            if(t !== "min_length" && t !== "max_length" 
                && t !== "inequals"
                && this.errors[t].length > 0
            ){
                errorsLength++
            }else if(t === "min_length" || t === "max_length"){
                if(Object.keys(this.errors[t]).length > 0){
                    errorsLength++
                }
            }else if(t === "inequals"){
                this.errors[t].forEach(field => {
                    if(field.length > 0){
                        errorsLength++
                    }
                })
            }
        }

        if(errorsLength > 0){
            return new ValidationError(this.errors)
        }

        return null
    }
}