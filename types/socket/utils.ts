import { DefaultEventsMap } from "socket.io";
import { Conversation, Join, Message } from "../Database";
import { ConversationMessage } from "../conversation";
import { AuthUser, User } from "../user";
import { Socket } from "socket.io-client";

type ServerToClientEvents<T extends string = string> = {
    conversations: (a: Conversation[])=>void;
    conversation_owners: (owners: {initializer: AuthUser, adressee:AuthUser}) => void;
    conversation_messages: (messages: Message[]) => void,
    conversation_messages_error: (error: {status: number, message: string}) => void
} & {
    [key in `${T}.conversation_last_message`]: (message: Join<ConversationMessage, { sender: AuthUser }>) => void;
  };

interface ClientToServerEvents {
    get_conversations: () => void;
    get_conversation_last_message: (conversation_id: number)=>void;
    get_conversation_owners: (initializer_id: number, adressee_id: number) => void;
    get_conversation_messages: (conversation_id: number, adressee_id: number) => void;
    message: (conversation_id: number, {message, adressee_id}: {message: ConversationMessage, adressee_id: number}) => void
}

interface InterServerEvents {
    ping: () => void;
}

interface SocketData {
    name: string;
    age: number;
}

type ResponseHandler = (message: unknown) => void

type SocketValue = { socket: Socket<DefaultEventsMap, DefaultEventsMap>, connected: boolean, connectionError: boolean }
export type {
    ServerToClientEvents,
    ClientToServerEvents,
    InterServerEvents,
    SocketData,
    ResponseHandler,
    SocketValue
}