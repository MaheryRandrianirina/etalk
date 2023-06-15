import { Context, MouseEvent, MouseEventHandler, SyntheticEvent, createContext } from "react"

export const ButtonContext: Context<MouseEventHandler<HTMLButtonElement>> = createContext((e: MouseEvent<HTMLButtonElement>): void =>{
    console.log(e)
})
