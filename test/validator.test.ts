import { test } from "@jest/globals"
import Validator from "../backend/security/validator"
import ValidationError from "../backend/security/validationError"
import { User } from "../types/user"

test("test setData method", ()=>{
    const validator = new Validator<User>()
    const v = validator.setData({name: "mahery"})
    const errors = v.required("name").getErrors()

    expect(v).toBeInstanceOf(Validator)
    expect(errors).not.toBeInstanceOf(ValidationError)
    expect(errors).toBeNull()
})
