import { BlockedUsers } from "../../../types/Database";
import Table from "./Table";

export default class BlockedUsersTable<T extends BlockedUsers> extends Table<T> {
    protected table = "blocked_users"
}