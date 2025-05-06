import { useEffect, useState } from "react";
import { DefaultEventsMap } from "socket.io";
import { io, Socket } from "socket.io-client";

type ConnectionEvent = "connect";
type SocketType = Socket<DefaultEventsMap, DefaultEventsMap>|null;
type ConnectionState = {
    connected: boolean,
    connectionError: Error|null,
    transport: string|null
}

export const useConnectionStateListener = (event: ConnectionEvent)=>{
    const [socket, setSocket] = useState<SocketType>(null);
    const [connectionState, setConnectionState] = useState<ConnectionState>({
        connected: false,
        connectionError: null,
        transport: null
    })

    useEffect(()=>{
        const newSocket = io({
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        setSocket(newSocket as SocketType);

        function onConnect(){
            setConnectionState(state => ({...state, connected: true, transport: newSocket.io.engine.transport.name }));

            newSocket.io.engine.on("upgrade", (transport) => {
                setConnectionState(state => ({...state, transport: transport.name }));
            })
        }

        function onConnectionError(error: Error) {
            if (!newSocket.active) {
                setConnectionState(state => ({ ...state, connectionError: error }));
            }
        }

        function onDisconnect() {
            console.log("Disconnected");
            
            newSocket.connect()

            setConnectionState(state => ({...state, connected: false, transport: "N/A"}));
        }

        if (event === "connect" && connectionState.connected === false) {
            newSocket.on(event, onConnect);

            

            newSocket.on("connect_error", onConnectionError);

            

            newSocket.on("disconnect", onDisconnect);

            
        }

        return ()=>{
            newSocket.off("connect", onConnect)
            newSocket.off("disconnect", onDisconnect)
            newSocket.off("connect_error", onConnectionError)
        }
    }, [])
    
    const { connected, connectionError} = connectionState

    return {socket, connected, connectionError}
}