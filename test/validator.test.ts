import { test } from "@jest/globals"
import Validator from "../backend/security/validator"
import ValidationError from "../backend/security/validationError"

test("username validation fail", ()=>{
    const validator = new Validator({username: ""})
    const errors = validator.required("username").getErrors()

    expect(errors).toBeInstanceOf(ValidationError)
    expect(errors).not.toBeNull()
})
