import { Dispatch, SetStateAction } from "react"
import { User } from "./user"
import { GetAway } from "./utils"
import { Conversation, Message } from "./Database"

type Receiver = GetAway<User, ["password"]>
type ChosenReceiver = {id: number, username: string}
type SearchResultStyle = {left: string, width: string}

type ConversationMessage = {
    [key in keyof Message]?: Message[key]
} 

type UserConversations = Conversation[] | null
type SetMessage<T extends {[index: string]: unknown} | undefined> = Dispatch<SetStateAction<T extends undefined 
    ? ConversationMessage | null : (ConversationMessage & T) | null>>

export type {Receiver, ChosenReceiver, SearchResultStyle, SetMessage, ConversationMessage, UserConversations}