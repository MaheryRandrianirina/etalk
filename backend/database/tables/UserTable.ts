
import { Entity } from "../../../types/Database";
import { User } from "../../../types/user";
import Table from "./Table";

export default class UserTable extends Table<User> {
    protected table: string = "users"

    constructor()
    {
        super()
    }    
}