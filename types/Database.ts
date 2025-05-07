import { User } from "./user"
import { RowDataPacket } from "mysql2";

interface Conversation extends RowDataPacket {
    id: number,
    initializer_id: number,
    adressee_id: number
    created_at: Date,
    updated_at: Date
}

interface Message extends RowDataPacket {
    id: number,
    texto: string,
    file: string,
    image: string,
    vocal: string,
    created_at: string,
    conversation_id: number,
    sender_id: number,
    receiver_id: number,
    pending: boolean
}

interface Calls extends RowDataPacket {
    id: number,
    created_at: Date,
    caller_id: number,
    called_id: number
}

interface UserCalls extends RowDataPacket {
    user_id: number,
    call_id: number
}

interface ConversationUser extends RowDataPacket {
    conversation_id: number,
    user_id: number
}

interface UserFriends extends RowDataPacket {
    user_id: number,
    friend_id: number
}

interface BlockedUsers extends RowDataPacket {
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
    [key in keyof T]?: T[key] | (T[key])[] 
}

type Prefix<T extends ColumnsToFill<Entity>, U extends T> = {
    [key in keyof T as U extends User ? `u.${(key | "*") & string}` : 
        (U extends Message ? `m.${key & string}` : (U extends ConversationUser ? `cu.${key & string}` : 
        (U extends Calls ? `ca.${key & string}` : (U extends UserCalls ? `uc.${key & string}`: 
        (U extends UserFriends ? `uf.${key & string}` : (U extends BlockedUsers ? `bu.${key & string}` : 
        (U extends Conversation ? `c.${key & string}`: never))))))) 
    ]: T[key]
}


type PrefixArray<T extends ColumnsToFill<Entity>, U extends T> = 
    U extends User
        ? (`u.${keyof U & string}` | "u.*")[]
        : U extends Message
        ? (`m.${keyof U & string}` | "m.*")[]
        : U extends ConversationUser
        ? (`cu.${keyof U & string}` | "cu.*")[]
        : U extends Calls
        ? (`ca.${keyof U & string}` | "ca.*")[]
        : U extends UserCalls
        ? (`uc.${keyof U & string}` | "uc.*")[]
        : U extends UserFriends
        ? (`uf.${keyof U & string}` | "uf.*")[]
        : U extends BlockedUsers
        ? (`bu.${keyof U & string}` | "bu.*")[]
        : U extends Conversation
        ? (`c.${keyof U & string}` | "c.*")[]
        : never;
;

type Join<T, U> = T & U

type JoinArray<T extends any[], U extends any[]> = T extends any[] ? 
    (U extends any[] ? [...T, ...U] : never) : never

type UnknownQueryConditions = string[] | Join<{[index: string]: string}, {"OR"?: {[index: string]: string}}>

type QueryConditions<T extends Entity, U extends any> = U extends Entity ? 
    Join<Join<Prefix<ColumnsToFill<T>, T>, Prefix<ColumnsToFill<U>, U>>, 
    {"OR"?: {[index: string]: string | number}}> | (keyof Join<Join<OptionalSuffix<T, Prefix<ColumnsToFill<T>, T>, "!=">, OptionalSuffix<U, Prefix<ColumnsToFill<U>, U>, "!=">>, 
        {"OR"?: {[index: string]: string}}>)[]
: ColumnsToFill<T> | (keyof ColumnsToFill<T>)[]

type OptionalSuffix<U extends Entity, T extends Prefix<ColumnsToFill<U>, U>, S extends "!="> = {
    [key in keyof T as key extends string ? (`${key} ${S}` & string) | key : key] : T[key]
}

type TableColumns<T extends Entity, U extends Entity, Concat extends unknown> = U extends Entity ? 
    (Concat extends true ? JoinArray<PrefixArray<ColumnsToFill<T>, T>, PrefixArray<ColumnsToFill<U>, U>> : 
    (Concat extends undefined ? PrefixArray<ColumnsToFill<T>, T> : any))  : 
    (keyof ColumnsToFill<T>)[] | keyof ColumnsToFill<T> | string

type Orders<T extends Entity> = {
    column: keyof Prefix<T, T>,
    type: "DESC" | "ASC"
}

export type { 
    Entity, 
    Data, ColumnsToFill, 
    Conversation, Message,
    ConversationUser, UserCalls,
    UserFriends, BlockedUsers,
    Prefix, PrefixArray,Join, JoinArray,
    UnknownQueryConditions, QueryConditions, TableColumns,
    Orders
}