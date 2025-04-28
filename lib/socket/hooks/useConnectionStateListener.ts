import { useState } from "react";
import { io } from "socket.io-client";

type ConnectionState = "connect";

export const useConnectionStateListener = (state: ConnectionState)=>{
    const socket = io();

    const [ connected, setConnected] = useState<boolean>(false);
    const [connectionError, setConnectionError] = useState<boolean>(false);

    if (state === "connect" && connected === false) {
        socket.on(state, () => {
            setConnected(true);
        });

        socket.on("connect_error", (error) => {
            if (!socket.active) {
                setConnected(false);
                setConnectionError(true);
            } 
        });
    }

    return {socket, connected, connectionError}
}