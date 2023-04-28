import { Connection } from "mysql"
import Query from "../Query"
import connection from "../mysqlConnection"
import { TableColumns } from "../../../types/tables/TableColumns"


export default class Table {
    protected table: string = ""

    new(columns: TableColumns): Promise<string | boolean> {
        return new Promise((resolve, reject)=>{
            let arrayOfColumns = []
            let data = []
            for(const i in columns){
                arrayOfColumns.push(i)
                data.push(columns[i])
            }

            const query = this.getQueryBuilder().insert(arrayOfColumns).__toString() 
            this.getMysqlConnection().query(query, data, (err, result)=>{
                if(err) reject(err)
                resolve(true)
            })
        })
    }

    protected getQueryBuilder(): Query {
        return new Query(this.table)
    }

    protected getMysqlConnection(): Connection {
        return connection
    }
}