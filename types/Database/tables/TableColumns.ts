import { UserTableColumns } from "./UserTableColumns"

type Entity = UserTableColumns

type TableColumns = {
    [key in keyof Entity]?: Entity[key]
} 

export type { TableColumns,Entity }