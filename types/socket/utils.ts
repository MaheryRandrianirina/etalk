import { Conversation } from "../Database";

interface ServerToClientEvents {
    noArg: () => void;
    conversations: (a: Conversation[])=>void
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
}

interface ClientToServerEvents {
    get_conversations: () => void;
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}

export type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData
}