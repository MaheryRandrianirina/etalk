
import Table from "./Table"
import { Conversation } from "../../../types/Database"
 
export default class ConversationTable<T extends Conversation> extends Table<T> {
    protected table: string = "conversation"
}