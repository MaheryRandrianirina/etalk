import { Message } from "../../../types/Database";
import Table from "./Table";

export default class MessageTable<T extends Message> extends Table<T> {
    protected table = "message"
    
}