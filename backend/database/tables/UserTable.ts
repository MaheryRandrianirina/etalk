
import { Entity } from "../../../types/Database";
import { User } from "../../../types/user";
import Table from "./Table";

export default class UserTable<T extends User> extends Table<T> {
    protected table: string = "users"

    constructor()
    {
        super()
    }    
}