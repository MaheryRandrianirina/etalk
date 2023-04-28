import { ChangeEventHandler } from "react"

type InputTypes = ["text", "number", "radio", "checkbox", "password", "email", "hidden", "search"]

type InputAttributes<type extends InputTypes[number]> = {
    className?: string,
    name?: string,
    id?: string,
    value?: string | null,
    placeholder?: string,
    checked?: type extends "checkbox" | "radio"  ? boolean : never
}

type InputEvents<type extends InputTypes[number]> = {
    onChange?: ChangeEventHandler<HTMLInputElement>
}

type InputOptions<type extends InputTypes[number]> = {
    type?: type,
    label?: string,
    attributes: InputAttributes<type>,
    events?: InputEvents<type>
}

export type {
    InputOptions, InputAttributes, InputTypes, InputEvents
}