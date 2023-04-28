
abstract class QueryBuilder {

    protected abstract queries: string[]
    protected abstract table: string

    abstract select(columns: string[]): this

    abstract insert(columns: string[]): this

    abstract update(): this

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
        
    }

    insert(columns: string[]): this {
        this.queries.push(`INSERT INTO ${this.table} SET ${this.columnsToFill(columns)}`)
        return this
    }

    private columnsToFill(columns: string[]): string {
        let string = ""
        columns.forEach(column => {
            string += column + " = ?,"
        })

        return string.slice(0, string.lastIndexOf(','))
    }

    update(): this {
        
    }

    delete(): this {
        
    }

    __toString(): string {
        return this.queries.join(" ")
    }
}