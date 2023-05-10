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
    password_confirmation: string,
    id: number | null
}

export type { User, UserIdentity, UserUniqueProperties }