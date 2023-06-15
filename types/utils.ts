import { Socket } from "socket.io-client"
import { ClientToServerEvents, ServerToClientEvents } from "./socket/utils"
import { Dispatch, SetStateAction } from "react"

type ChangeType<T extends {}, item extends keyof T, newType> = {
    [key in keyof T] : key extends item ? newType : T[key]
}

type GetAway<T extends {[key: symbol]: string | Date | number | boolean}, U extends (keyof T)[]> = {
    [key in keyof T as key extends U[number] ? never : key]: T[key]
}

type AppSocketState = Socket<ServerToClientEvents, ClientToServerEvents> | null
type SocketStateDispatcher = Dispatch<SetStateAction<AppSocketState>>

type Undefine<T extends {[key: symbol]: any}> = {
    [key in keyof T]?: T[key]
}

type MultipleClassnameForAnimation<T extends string[]> = {
    [key in T[number]]: string
}

export type { 
    ChangeType, 
    GetAway, 
    SocketStateDispatcher, 
    AppSocketState, 
    Undefine,
    MultipleClassnameForAnimation
}