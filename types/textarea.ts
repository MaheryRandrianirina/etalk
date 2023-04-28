import { ChangeEventHandler } from "react"

type TextareaAttributes = {
    className?: string,
    name?: string,
    id?: string,
    value?: string
}

type TextareaEvents = {
    onChange?: ChangeEventHandler<HTMLTextAreaElement>
}
export type { TextareaAttributes, TextareaEvents }