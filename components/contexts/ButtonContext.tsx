import { Context, MouseEvent, MouseEventHandler, createContext } from "react"

export const ButtonContext: Context<MouseEventHandler<HTMLButtonElement>> = createContext((e: MouseEvent<HTMLButtonElement, MouseEvent>)=>{
    console.log(e)
})