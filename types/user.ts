import { Join } from "./Database"
import { GetAway } from "./utils"
import { RowDataPacket } from "mysql2";

interface User extends RowDataPacket {
    "id": number,
    "name": string,
    "firstname": string,
    "username": string,
    "password": string,
    "sex": "man" | "woman",
    "image": string,
    "email": string,
    "created_at": Date,
    "updated_at": Date,
    "is_online": boolean,
    "remember_token": string
}

interface UserIdentity extends RowDataPacket {
    name: string,
    firstname: string,
    username: string,
    sex: "man" | "woman"
}

interface UserUniqueProperties extends RowDataPacket {
    email: string,
    password: string,
    password_confirmation: string
}

type AuthUser = GetAway<User, ["created_at","updated_at", "remember_token", "password"]>

type ConversationOwners = {
    initializer: AuthUser,
    adressee: AuthUser
}
export type { 
    User, UserIdentity, 
    UserUniqueProperties, 
    AuthUser, ConversationOwners }