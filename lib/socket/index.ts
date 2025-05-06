import { useEvent } from "./hooks/useEvent"
import { useConnectionStateListener } from "./hooks/useConnectionStateListener"
import { io } from "socket.io-client";

const isBrowser = typeof window !== "undefined";

export const socket = isBrowser ? io() : {};

export {
    useConnectionStateListener,
    useEvent
}