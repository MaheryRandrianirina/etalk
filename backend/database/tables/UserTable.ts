
import { UserTableColumns } from "../../../types/tables/UserTableColumns";
import Table from "./Table";

export default class UserTable extends Table {
    protected table: string = "users"

    constructor()
    {
        super()
    }    
}