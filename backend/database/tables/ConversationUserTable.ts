import { ConversationUser } from "../../../types/Database";
import Table from "./Table";

export default class ConversationUserTable<T extends ConversationUser> extends Table<T>{
    protected table = "conversation_user"
}