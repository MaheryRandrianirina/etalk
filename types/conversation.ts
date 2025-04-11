import { Dispatch, SetStateAction } from "react"
import { User } from "./user"
import { GetAway, Undefine } from "./utils"
import { Conversation, Message } from "./Database"

type Receiver = GetAway<User, ["password"]>
type ChosenReceiver = {id: number, username: string}
type SearchResultStyle = {left: string, width: string}

type ConversationMessage = Undefine<Message>

type UserConversations = Conversation[] | null
type SetMessage<T extends {[index: string]: unknown} | undefined> = T extends undefined  ? Dispatch<SetStateAction<ConversationMessage | null>> : Dispatch<SetStateAction<(ConversationMessage & T) | null>>

export type {Receiver, ChosenReceiver, SearchResultStyle, SetMessage, ConversationMessage, UserConversations}