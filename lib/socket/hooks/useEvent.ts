import { ResponseHandler } from "@/types/socket/utils"
import { DefaultEventsMap } from "socket.io"
import { Socket } from "socket.io-client"

type Channel = "chat_list"

export const useEvent = (event: string, socket: Socket<DefaultEventsMap, DefaultEventsMap>, responseHandler: ResponseHandler)=>{
    socket.on(event, responseHandler)
}