import { Join } from "./Database"
import { GetAway, Undefine } from "./utils"

type User = {
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

type UserIdentity = {
    name: string,
    firstname: string,
    username: string,
    sex: "man" | "woman"
}

type UserUniqueProperties = {
    email: string,
    password: string,
    password_confirmation: string
}

type AuthUser = GetAway<User, ["created_at","updated_at", "email", "remember_token", "password"]>

type ConversationOwners = {
    initializer: AuthUser,
    adressee: AuthUser
}
export type { 
    User, UserIdentity, 
    UserUniqueProperties, 
    AuthUser, ConversationOwners }