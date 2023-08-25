import { ColumnsToFill, Entity, Join, JoinArray, Orders, Prefix, PrefixArray, QueryConditions, TableColumns } from "../../types/Database"
import { User } from "../../types/user"
import Str from "../Helpers/Str"

export default class Query<T extends Entity> {
    queries: string[] = []
    protected table: string

    constructor(table: string) {
        this.table = table
    }
    
    select<U extends Entity, Concat extends any>(
        columns: TableColumns<T, U, Concat>, 
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

    where<U extends any>(conditions: QueryConditions<T, U>,
        operator?: "OR" | "AND",
        like?: true
    ): this {
        this.queries.push(`WHERE ${this.transformObjectToForConditions<U>(conditions, operator, like)}`)

        return this
    }

    transformObjectToForConditions<U extends unknown>(conditions: QueryConditions<T, U>,
        operator?: "OR" | "AND",
        like?: true
    ): string {
        let collections: string[] = []

        if(conditions instanceof Array){
            conditions.forEach(column => {
                const c = column as string
                if(!like){
                    collections.push(`${c.includes('!=') ? c + " ?" : c + " = ?"}`)
                }else {
                    collections.push(`${c} LIKE ?`)
                }
            })
        }else {
            for(const i in conditions){
                const index = i as keyof QueryConditions<T, U>
                
                if(!like){
                    if(conditions[index] instanceof Array){
                        const c = conditions[index] as string[]
                        collections.push(`${i} = ${c[0]} OR ${i} = ${c[1]}`)
                    }else if(index === "OR"){
                        const ORConditions = conditions[index]
                        let ORQuery: string = ""
                        
                        for(const idx in ORConditions){
                            ORQuery += ORQuery.length === 0 ? 
                                idx + " = " + ORConditions[idx] : " OR " 
                                + idx + " = " + ORConditions[idx]
                        }

                        collections.push(ORQuery)
                        
                    }else {
                        collections.push(i + " = " + conditions[index])
                    }
                    
                }else {
                    collections.push(`${i} LIKE ${conditions[index]}`)
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
        this.queries.push(`DELETE FROM ${this.table}`)
        return this
    }

    join(context: {[table: string]: {alias: string, on: string, type?: string}}): this {
        let query = ""
        let countJointure = 0

        for(let table in context){
            countJointure++
            const tableAttributes = context[table]

            const joinType = tableAttributes.type
            if(joinType){
                query += `${joinType} JOIN `
            }else {
                if(countJointure === 1){
                    query += "JOIN"
                }else{
                    query += " JOIN"
                }
                
            }
    
            query += ` ${table} ${tableAttributes.alias} ON ${tableAttributes.on}`
        }
        
        this.queries.push(query)
        return this
    }

    orderBy(what: string): this {
        this.queries.push(`ORDER BY ${what}`)
        return this
    }

    limit(number: number): this {
        this.queries.push(`LIMIT ${number}`)
        return this
    }

    __toString(): string {
        return this.queries.join(" ")
    }
}