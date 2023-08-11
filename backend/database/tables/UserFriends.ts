import { UserFriends as UserFriendsType } from "../../../types/Database";
import Table from "./Table";

export default class UserFriends<T extends UserFriendsType> extends Table<T> {
    protected table = "user_friends"
}