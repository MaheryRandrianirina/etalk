
type ChangeType<T extends {}, item extends keyof T, newType> = {
    [key in keyof T] : key extends item ? newType : T[key]
}

type GetAway<T extends {[key: symbol]: string | Date | number | boolean}, U extends (keyof T)[]> = {
    [key in keyof T as key extends U[number] ? never : key]: T[key]
}

const a: GetAway<{"username": string, name: string}, ["username"]> = {name: ""}
export type { ChangeType, GetAway }