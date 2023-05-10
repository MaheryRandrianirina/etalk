import { Connection, OkPacket } from "mysql"
import Query from "../Query"
import connection from "../mysqlConnection"
import { TableColumns } from "../../../types/Database/tables/TableColumns"
import { queryConditions } from "../../../types/Database/Query"


export default class Table {
    protected table: string = ""

    new(columns: TableColumns, conditions?: queryConditions): Promise<number | boolean> {
        return this.queryTypeInsertion("insert", columns, conditions)
    }

    private queryTypeInsertion(type: "insert" | "update", columns: TableColumns, conditions?: queryConditions): Promise<number | boolean> {
        return new Promise((resolve, reject)=>{
            let arrayOfColumns: (keyof TableColumns)[] = []
            let data = []

            for(const i in columns){
                const columnName = i as keyof TableColumns
                arrayOfColumns.push(columnName)
                data.push(columns[columnName])
            }

            let query: Query 
            if(type === "insert"){
                query = this.getQueryBuilder().insert(arrayOfColumns)
            }else {
                query = this.getQueryBuilder().update(arrayOfColumns)
            }

            if(conditions !== undefined){
                query = query.where(conditions)
            }

            const queryString: string = query.__toString() 
            
            this.getMysqlConnection().query(queryString, data, (err, results)=>{
                if(err) reject(err)
                const res = results as OkPacket
                if("insertId" in res){
                    resolve(res.insertId)
                }else {
                    resolve(true)
                }
                
            })
        })
    }

    update(columns: TableColumns, conditions?: queryConditions): Promise<number | boolean> {
        return this.queryTypeInsertion('update', columns, conditions)
    }

    protected getQueryBuilder(): Query {
        return new Query(this.table)
    }

    protected getMysqlConnection(): Connection {
        return connection
    }

    
}