
import Table from "./Table"
import { Conversation, ConversationUser } from "../../../types/Database"
import { User } from "../../../types/user"
 
export default class ConversationTable<T extends Conversation> extends Table<T> {
    protected table: string = "conversation"
}