import {User} from "../user"
type UserTableColumns = {
    [key in keyof User]?: User[key]
}

export type {UserTableColumns}