import { Connection, OkPacket } from "mysql"
import Query from "../Query"
import connection from "../mysqlConnection"
import { ColumnsToFill, Data, Entity, Join, JoinArray, Prefix, PrefixArray } from "../../../types/Database"
import { User } from "../../../types/user"
import Str from "../../Helpers/Str"


export default class Table<T extends Entity> {

    protected table: string = ""
    protected aliases: {[alias: string]: string} = {}

    constructor(){
        const alias = Str.getTableAlias(this.table)
        this.aliases = {[alias]: this.table}
    }

    new(columns: ColumnsToFill<T>): Promise<number> {
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
    private queryTypeInsertion<Type extends number | true>(type: "insert" | "update", 
        columns: ColumnsToFill<T>, 
        conditions?: ColumnsToFill<T> | (keyof ColumnsToFill<T>)[]
    ): Promise<Type>{
        return new Promise((resolve, reject)=>{
            let arrayOfColumns: (keyof ColumnsToFill<T>)[] = []
            let data: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[] = []

            for(const i in columns){
                const columnName = i as keyof ColumnsToFill<T>
                arrayOfColumns.push(columnName)
                data.push(columns[columnName])
            }

            let query: Query<T> 

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
                            const index = i as keyof ColumnsToFill<T>
                            data.push(conditions[index]) 
                        }
                        
                    }
                }
                
                query = query.where<undefined>(conditions)
            }

            const queryString: string = query.__toString() 
            
            this.getMysqlConnection().query(queryString, data, (err, results)=>{
                if(err) reject(err)

                const res = results as OkPacket
                
                if(type === "insert" 
                    && res !== undefined 
                    && "insertId" in res
                ){
                    resolve(res.insertId as Type)
                }else {
                    resolve(true as Type)
                }
                
            })
        })
    }

    protected getQueryBuilder(): Query<T> {
        return new Query(this.table)
    }

    protected getMysqlConnection(): Connection {
        return connection
    }

    update(columns: ColumnsToFill<T>, conditions?: ColumnsToFill<T> | (keyof ColumnsToFill<T>)[]): Promise<true> {
        return this.queryTypeInsertion<true>('update', columns, conditions)
    }

    find(id: number): Promise<Data<T>[]> {
        return new Promise((resolve, reject)=>{
            this.getMysqlConnection().query(
                this.getQueryBuilder().select("*").where(['id'] as (keyof ColumnsToFill<T>)[]).__toString(), 
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
    get<U extends Entity | undefined, Concat extends true | undefined>(
        columns: U extends Entity ? 
            (Concat extends true ? JoinArray<PrefixArray<ColumnsToFill<T>, T>, 
                PrefixArray<ColumnsToFill<U>, U>> : PrefixArray<ColumnsToFill<T>, T>) 
            : (keyof ColumnsToFill<T>)[], 
        conditions?: U extends Entity ? Join<Prefix<ColumnsToFill<T>, T>, Prefix<ColumnsToFill<U>, U>> 
            : ColumnsToFill<T> | (keyof ColumnsToFill<T>)[], 
        dataForArrayConditions?: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[],
        join?: {[table: string]: {alias: string, on: string, type?: string}}
    ): Promise<unknown> {
        return new Promise((resolve, reject)=>{
            let query: Query<T>
            
            if(columns.length > 0){
                query = this.getQueryBuilder().select<U, Concat>(columns, join !== undefined)
            }else {
                query = this.getQueryBuilder().select<undefined, undefined>("*", join !== undefined)
            }

            if(join){
                query = query.join(join)
            }

            if(conditions !== undefined){
                query = query.where<U>(conditions)
                let data: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[] = []
                
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

    search(columns:
        (keyof ColumnsToFill<T>)[], 
        conditions: ColumnsToFill<T> | (keyof ColumnsToFill<T>)[],
        dataForArrayConditions?: {values: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[], operator?: "OR" | "AND"}
    ): Promise<ColumnsToFill<Entity>[]>{
        return new Promise((resolve, reject)=>{
            let query: Query<T>

            if(columns.length > 0){
                query = this.getQueryBuilder().select(columns)
            }else {
                query = this.getQueryBuilder().select("*")
            }

            if(dataForArrayConditions && conditions instanceof Array){
                query.where<undefined>(conditions, dataForArrayConditions.operator , true)

                this.getMysqlConnection().query(query.__toString(), dataForArrayConditions.values, (err, results)=>{
                    if(err) reject(err)
                    resolve(results)
                })
            }else  {
                query.where<undefined>(conditions, undefined , true)

                this.getMysqlConnection().query(query.__toString(), (err, results)=>{
                    if(err) reject(err)
                    resolve(results)
                })
            }
        })
    }
}