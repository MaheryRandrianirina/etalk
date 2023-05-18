
type ChangeType<T extends {}, item extends keyof T, newType> = {
    [key in keyof T] : key extends item ? newType : T[key]
}

export type { ChangeType }