import { User } from "./user"

type Conversation = {
    id: number,
    initializer_id: number 
    created_at: Date,
    updated_at: Date
}

type Message = {
    id: number,
    texto: string,
    file: string,
    image: string,
    vocal: string,
    created_at: Date,
    conversation_id: number,
    sender_id: number,
    receiver_id: number,
}

type Calls = {
    id: number,
    created_at: Date,
    caller_id: number,
    called_id: number
}

type UserCalls = {
    user_id: number,
    call_id: number
}

type ConversationUser = {
    conversation_id: number,
    user_id: number
}

type UserFriends = {
    user_id: number,
    friend_id: number
}

type BlockedUsers = {
    user_id: number,
    blocked_user_id: number
}

type Entity = User | Conversation | ConversationUser
    | Calls | Message | UserCalls 
    | UserFriends | BlockedUsers 

type Data<Table extends Entity> = {
    [key in keyof Table]: Table[key]
}

/**
 * Tables
 */
type ColumnsToFill<T extends Entity> = {
    [key in keyof T]?: T[key]
}

type Prefix<T extends ColumnsToFill<Entity>, U extends T> = {
    [key in keyof T as U extends User ? `u.${(key | "*") & string}` : 
        (U extends Message ? `m.${key & string}` : (U extends ConversationUser ? `cu.${key & string}` 
        : (U extends Calls ? `ca.${key & string}` : (U extends UserCalls ? `uc.${key & string}`
        : (U extends UserFriends ? `uf.${key & string}` : (U extends BlockedUsers ? `bu.${key & string}` 
        : (U extends Conversation ? `c.${key & string}`: never))))))) 
    ]: T[key]
}

type PrefixArray<T extends ColumnsToFill<Entity>, U extends T> = [
    (U extends User ? `u.${(keyof U | "*") & string}` :(U extends Message ? `m.${(keyof U | "*") & string}` : (U extends ConversationUser ? `cu.${(keyof U | "*") & string}` 
        : (U extends Calls ? `ca.${(keyof U | "*") & string}` : (U extends UserCalls ? `uc.${(keyof U | "*") & string}`
        : (U extends UserFriends ? `uf.${(keyof U | "*") & string}` : (U extends BlockedUsers ? `bu.${(keyof U | "*") & string}` 
        : (U extends Conversation ? `c.${(keyof U | "*") & string}` : never))))))))
]

type Join<T, U> = T & U

type JoinArray<T extends any[], U extends any[]> = T extends any[] ? (U extends any[] ? [...T, ...U] : never) : never

export type { Entity, 
    Data, ColumnsToFill, 
    Conversation, Message,
    ConversationUser, UserCalls,
    UserFriends, BlockedUsers,
    Prefix, PrefixArray,Join, JoinArray
}