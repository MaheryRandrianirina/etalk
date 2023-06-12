import { Conversation, Join } from "../Database";
import { ConversationMessage } from "../conversation";
import { AuthUser, User } from "../user";
import { GetAway } from "../utils";

interface ServerToClientEvents {
    conversations: (a: Conversation[])=>void;
    conversation_last_message: (message: Join<ConversationMessage, {sender: AuthUser}>) => void
}

interface ClientToServerEvents {
    get_conversations: () => void;
    get_conversation_last_message: (conversation_id: number)=>void
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