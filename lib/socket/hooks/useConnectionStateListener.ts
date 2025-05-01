import { useState } from "react";
import { io } from "socket.io-client";

type ConnectionState = "connect";

export const useConnectionStateListener = (state: ConnectionState)=>{
    const socket = io();

    const [ connectionState, setConnectionState] = useState<{connected: boolean, connectionError: boolean}>({connected:false, connectionError: false});

    if (state === "connect" && connectionState.connected === false) {
        socket.on(state, () => {
            setConnectionState(state => ({...state, connected: true}));
        });

        socket.on("connect_error", (error) => {
            if (!socket.active) {
                setConnectionState(state => ({...state, connectionError: true}));
            } 
        });
    }

    const {connected, connectionError} = connectionState;

    return {socket, connected, connectionError}
}