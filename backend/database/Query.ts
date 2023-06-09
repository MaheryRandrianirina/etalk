import { ColumnsToFill, Entity, Join, JoinArray, Prefix, PrefixArray } from "../../types/Database"
import { User } from "../../types/user"
import Str from "../Helpers/Str"

export default class Query<T extends Entity> {
    queries: string[] = []
    protected table: string

    constructor(table: string) {
        this.table = table
    }
    
    select<U extends Entity | undefined, Concat extends true | undefined>(
        columns: U extends Entity ? (Concat extends true ? JoinArray<PrefixArray<ColumnsToFill<T>, T>, PrefixArray<ColumnsToFill<U>, U>> : PrefixArray<ColumnsToFill<T>, T>)  : (keyof ColumnsToFill<T>)[] | keyof ColumnsToFill<T> | string, 
        needAlias?: boolean
    ): this {
        let query: string = "SELECT "
        if(typeof columns === "string"){
            query += columns
        }else {
            const c = columns as (keyof ColumnsToFill<T>)[]
            query += c.join(', ')
        }

        query += ` FROM ${this.table}`

        if(needAlias){
            query += ` ${Str.getTableAlias(this.table)}`
        }

        this.queries.push(query)
        return this
    }

    insert(columns: (keyof ColumnsToFill<T>)[]): this {
        
        this.queries.push(`INSERT INTO ${this.table} SET ${this.columnsToFill(columns)}`)
        return this
    }

    private columnsToFill(columns: (keyof ColumnsToFill<T>)[]): string {
        let toJoin: string[] = []
        columns.forEach(column => {
            const c = column as string
            toJoin.push(`${c} = ?`)
        })
        
        return toJoin.join(', ')
    }

    where<U extends Entity | undefined>(conditions: U extends Entity 
        ? Join<Prefix<ColumnsToFill<T>, T>, Prefix<ColumnsToFill<U>, U>> 
        : ColumnsToFill<T> | (keyof ColumnsToFill<T>)[],
        operator?: "OR" | "AND",
        like?: true
    ): this {
        this.queries.push(`WHERE ${this.transformObjectToForConditions<U>(conditions, operator, like)}`)
        return this
    }

    transformObjectToForConditions<U extends Entity | undefined>(conditions: U extends Entity 
        ? Join<Prefix<ColumnsToFill<T>, T>, Prefix<ColumnsToFill<U>, U>> 
        : ColumnsToFill<T> | (keyof ColumnsToFill<T>)[],
        operator?: "OR" | "AND",
        like?: true
    ): string {
        let collections: string[] = []
        if(conditions instanceof Array){
            conditions.forEach(column => {
                const c = column as string
                if(!like){
                    collections.push(`${c} = ?`)
                }else {
                    collections.push(`${c} LIKE ?`)
                }
                
            })
        }else {
            for(const i in conditions){
                const index = i as keyof Object
                if(!like){
                    collections.push(i + " = " + conditions[index])
                }else {
                    collections.push(`${i} LIKE ${conditions[index]} `)
                }
                
            }
        }
        
        return collections.join(` ${operator ? operator : "AND"} `)
    }

    update(columns: (keyof ColumnsToFill<T>)[]): this {
        this.queries.push(`UPDATE ${this.table} SET ${this.columnsToFill(columns)}`)
        return this
    }

    delete(): this {
        return this
    }

    join(context: {[table: string]: {alias: string, on: string, type?: string}}): this {
        let query = ""
        for(let table in context){
            const tableAttributes = context[table]
            const joinType = tableAttributes.type
            if(joinType){
                query += `${joinType} JOIN `
            }else {
                query += "JOIN"
            }
    
            query += ` ${table} ${tableAttributes.alias} ON ${tableAttributes.on}`
        }
        
        this.queries.push(query)
        return this
    }

    __toString(): string {
        return this.queries.join(" ")
    }
}