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
type SetMessage = Dispatch<SetStateAction<ConversationMessage | null>>

export type {Receiver, ChosenReceiver, SearchResultStyle, SetMessage, ConversationMessage, UserConversations}