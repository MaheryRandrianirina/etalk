import { Connection, OkPacket } from "mysql"
import Query from "../Query"
import connection from "../mysqlConnection"
import { TableColumns } from "../../../types/Database/tables/TableColumns"


export default class Table {
    protected table: string = ""

    new(columns: TableColumns): Promise<number> {
        return this.queryTypeInsertion<number>("insert", columns)
    }

    /**
     * 
     * @param type 
     * @param columns 
     * @param  conditions représente un tableau contenant les colonnes à remplir venant de l'utilisateur
     * pour parvenir à ce resultat "colonne = ?". Ou bien un objet contenant les valeurs à remplir indexés par
     * le nom de la collone à remplir pour parvenir à ce resultat "colonne = valeur". Ce dernier est à utiliser quand les données ne viennent pas de l'utilisateur
     * @returns {Promise<number | boolean>} contenant le resultat venant de la BDD
     */
    private queryTypeInsertion<T extends number | true>(type: "insert" | "update", columns: TableColumns, conditions?: TableColumns | (keyof TableColumns)[]): Promise<T>{
        return new Promise((resolve, reject)=>{
            let arrayOfColumns: (keyof TableColumns)[] = []
            let data: (TableColumns[keyof TableColumns])[] = []

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
                if(conditions instanceof Array){
                    
                }else {
                    for (const i in conditions) {
                        if(typeof i === "string"){
                            const index = i as keyof TableColumns
                            data.push(conditions[index]) 
                        }
                        
                    }
                }
                
                query = query.where(conditions)
            }

            const queryString: string = query.__toString() 
            
            this.getMysqlConnection().query(queryString, data, (err, results)=>{
                if(err) reject(err)
                const res = results as OkPacket
                if(type === "insert" 
                    && res !== undefined 
                    && "insertId" in res
                ){
                    resolve(res.insertId as T)
                }else {
                    resolve(true as T)
                }
                
            })
        })
    }

    protected getQueryBuilder(): Query {
        return new Query(this.table)
    }

    protected getMysqlConnection(): Connection {
        return connection
    }

    update(columns: TableColumns, conditions?: TableColumns | (keyof TableColumns)[]): Promise<true> {
        return this.queryTypeInsertion<true>('update', columns, conditions)
    }

    find(id: number): Promise<unknown> {
        return new Promise((resolve, reject)=>{
            this.getMysqlConnection().query(
                this.getQueryBuilder().select("*").where(['id']).__toString(), 
                [id], (error, res)=>{
                    if(error) reject(error)
                    resolve(res)
            })
        })
    }

    /**
     * 
     * @param columns 
     * @param conditions sous forme de tableau avec les colonnes à remplir quand les données viennent de l'utilisateur.
     * Sous forme d'objet avec comme clé la colonne à remplir et valeur la valeur à inserer quand les données ne viennent
     * pas de l'utilisateur. Dans ce dernier cas, il faut que les valeurs de type string  soient représentées 
     * exactement comme suit : "'valeur'"
     * @param dataForArrayConditions est seulement defini quand conditions est défini et sous forme de tableau.
     * @returns 
     */
    get(columns: (keyof TableColumns)[], conditions?: TableColumns | (keyof TableColumns)[], dataForArrayConditions?: (TableColumns[keyof TableColumns])[]): Promise<unknown> {
        return new Promise((resolve, reject)=>{
            let query: Query

            if(columns.length > 0){
                query = this.getQueryBuilder().select(columns)
            }else {
                query = this.getQueryBuilder().select("*")
            }

            if(conditions !== undefined){
                query = query.where(conditions)
                let data: (TableColumns[keyof TableColumns])[] = []
                
                if(conditions instanceof Array){
                    if(dataForArrayConditions){
                        data = dataForArrayConditions
                    }
                }
                
                this.getMysqlConnection().query(query.__toString(), data, (err, results)=>{
                    if(err) reject(err)
                    resolve(results)
                })
            }else {
                this.getMysqlConnection().query(query.__toString(), (err, results)=>{
                    if(err) reject(err)
                    resolve(results)
                })
            } 
        })
    }
}