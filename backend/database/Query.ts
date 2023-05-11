import { queryConditions } from "../../types/Database/Query"

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

    select(columns: string[]): this {
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

    where(conditions: queryConditions): this {
        this.queries.push(`WHERE ${this.transformObjectToEquality(conditions)}`)
        return this
    }

    transformObjectToEquality(object: {}): string {
        let string: string = ""
        for(const i in object){
            const index = i as keyof Object
            string += i + " = " + object[index] + " AND "
        }

        return string.slice(0, string.lastIndexOf(" AND "))
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