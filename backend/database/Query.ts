import { TableColumns } from "../../types/Database/tables/TableColumns"

abstract class QueryBuilder {

    protected abstract queries: string[]

    protected abstract table: string

    abstract select(columns: string[]): this

    abstract insert(columns: string[]): this

    abstract update(columns: string[]): this

    abstract delete(): this

    abstract __toString(): string
}

export default class Query extends QueryBuilder {
    queries: string[] = []
    protected table: string

    constructor(table: string) {
        super()
        this.table = table
    }

    select(columns: string[] | string): this {
        let query: string = "SELECT "
        if(typeof columns === "string"){
            query += columns
        }else {
            query += columns.join(', ')
        }

        query += ` FROM ${this.table}`
        this.queries.push(query)
        return this
    }

    insert(columns: string[]): this {
        
        this.queries.push(`INSERT INTO ${this.table} SET ${this.columnsToFill(columns)}`)
        return this
    }

    private columnsToFill(columns: string[]): string {
        let toJoin: string[] = []
        columns.forEach(column => {
            toJoin.push(`${column} = ?`)
        })
        
        return toJoin.join(', ')
    }

    where(conditions: TableColumns | (keyof TableColumns)[]): this {
        this.queries.push(`WHERE ${this.transformObjectToForConditions(conditions)}`)
        return this
    }

    transformObjectToForConditions(conditions: TableColumns | (keyof TableColumns)[]): string {
        let collections: string[] = []
        if(conditions instanceof Array){
            conditions.forEach(column => {
                collections.push(`${column} = ?`)
            })
        }else {
            for(const i in conditions){
                const index = i as keyof Object
                collections.push(i + " = " + conditions[index])
            }
        }
        

        return collections.join(" AND ")
    }

    update(columns: string[]): this {
        this.queries.push(`UPDATE ${this.table} SET ${this.columnsToFill(columns)}`)
        return this
    }

    delete(): this {
        return this
    }

    __toString(): string {
        return this.queries.join(" ")
    }
}