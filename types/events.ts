import { ChangeEventHandler, MouseEventHandler } from "react"

type ElementEvents<T> = {
    onClick?: MouseEventHandler<HTMLElement>,
    onChange?: T extends HTMLInputElement ? ChangeEventHandler<HTMLInputElement> : never
}

export type { ElementEvents }