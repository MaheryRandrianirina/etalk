import { PropsWithChildren } from "react";
import { SocketContext } from "../SocketContext";
import { SocketValue } from "@/types/socket/utils";

export const SocketProvider = ({children, socketValue}: PropsWithChildren & {socketValue:SocketValue}) => {
    return <SocketContext.Provider value={socketValue}>
        {children}
    </SocketContext.Provider>
}