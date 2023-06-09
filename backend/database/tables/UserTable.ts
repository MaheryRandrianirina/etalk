
import { Entity } from "../../../types/Database";
import Table from "./Table";

export default class UserTable<T extends Entity> extends Table<T> {
    protected table: string = "user"

    constructor()
    {
        super()
    }    
}