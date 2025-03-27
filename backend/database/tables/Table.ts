import Query from "../Query"
import connection from "../mysqlConnection"
import { ColumnsToFill, Data, Entity, Join, JoinArray, Orders, Prefix, PrefixArray, QueryConditions, TableColumns, UnknownQueryConditions } from "../../../types/Database"
import { User } from "../../../types/user"
import Str from "../../Helpers/Str"
import { Connection, FieldPacket, OkPacket, RowDataPacket } from "mysql2/promise"

export default class Table<T extends Entity> {

    protected query?: Query<T>

    protected table: string = ""

    protected aliases: {[alias: string]: string} = {}

    protected columnsToFetch?: string[]

    protected conditions?: {
        columns: UnknownQueryConditions,
        data?: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[]
    }

    protected tableToJoin?: {[table: string]: {alias: string, on: string, type?: string}}

    protected orders?: Orders<T>

    protected fetchLimit: number = 0

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
        return new Promise(async(resolve, reject)=>{
            let arrayOfColumns: (keyof ColumnsToFill<T>)[] = []
            let data: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[] = []

            for(const i in columns){
                const columnName = i as keyof ColumnsToFill<T>
                arrayOfColumns.push(columnName)
                data.push(columns[columnName])
            }

            if(type === "insert"){
                this.query = this.getQueryBuilder().insert(arrayOfColumns)
            }else {
                this.query = this.getQueryBuilder().update(arrayOfColumns)
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
                
                this.query = this.query.where<undefined>(conditions)
            }

            const queryString: string = this.query.__toString() 
            
            try {
                const res = await this.getMysqlConnection().query(queryString, data);
    
                if(type === "insert" 
                    && res !== undefined 
                    && "insertId" in res
                ){
                    resolve(res.insertId as Type)
                }else {
                    resolve(true as Type)
                }
            }catch(e){
                reject(e);
            }
        })
    }

    protected getQueryBuilder(): Query<T> {
        return new Query<T>(this.table)
    }

    protected getMysqlConnection(): Connection {
        return connection
    }

    update(columns: ColumnsToFill<T>, conditions?: ColumnsToFill<T> | (keyof ColumnsToFill<T>)[]): Promise<true> {
        return this.queryTypeInsertion<true>('update', columns, conditions)
    }

    find(id: number): Promise<Entity[]> {
        return new Promise(async(resolve, reject)=>{
            let query: Query<T>

            if(this.columnsToFetch){
                query = this.getQueryBuilder()
                    .select(this.columnsToFetch)
                    .where(['id'] as (keyof ColumnsToFill<T>)[])
            }else {
                query = this.getQueryBuilder().select("*").where(['id'] as (keyof ColumnsToFill<T>)[])
            }

            try {
                const res = await this.getMysqlConnection().query<Entity[]>(
                    query.__toString(), 
                    [id]);

                resolve(res[0]);
            }catch(e){
                reject(e)
            }
        })
    }

    all(): Promise<Entity[]> {
        return new Promise(async(resolve, reject)=>{
            try {
                const res = await this.getMysqlConnection().query<Entity[]>(this.getQueryBuilder().select("*").__toString());

                resolve(res[0]);
            }catch(e){
                reject(e)
            }
        })
    }

    columns<U extends Entity | any, ConcatTypes extends unknown>(columns: U extends Entity ? 
        (ConcatTypes extends true ? JoinArray<PrefixArray<ColumnsToFill<T>, T>, 
            PrefixArray<ColumnsToFill<U>, U>> : PrefixArray<ColumnsToFill<T>, T>) 
        : (keyof ColumnsToFill<T>)[]
    ): this {

        this.columnsToFetch = columns as string[]

        return this
    }

    where<U extends unknown>(
        conditions: QueryConditions<T, U>, 
        dataForArrayConditions?: U extends undefined ? (ColumnsToFill<T>[keyof ColumnsToFill<T>])[] :
        (U extends Entity ? 
            (Join<ColumnsToFill<T>, ColumnsToFill<U>>[keyof Join<ColumnsToFill<T>, ColumnsToFill<U>>])[] :
            undefined
        ),
    ): this {
        
        this.conditions = {
            columns: conditions as UnknownQueryConditions,
            data: dataForArrayConditions
        }
        
        return this
    }

    join(table:{[table: string]: {alias: string, on: string, type?: string}}): this {
        this.tableToJoin = table
        return this
    }

    orderBy(column: keyof Prefix<T, T>, type: "DESC" | "ASC"): this {
        this.orders = {
            column: column,
            type: type
        }

        return this
    }

    limit(number: number): this {
        this.fetchLimit = number
        return this
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
    get<U extends Entity, ConcatTypes extends any>(): Promise<unknown> {
        return new Promise(async(resolve, reject)=>{
            
            if(this.columnsToFetch && this.columnsToFetch.length > 0){
                this.query = this.getQueryBuilder().select<U, true>(this.columnsToFetch as TableColumns<T, U, ConcatTypes>, this.tableToJoin !== undefined)
            }else {
                this.query = this.getQueryBuilder().select("*", this.tableToJoin !== undefined)
            }

            if(this.tableToJoin !== undefined){
                this.query = this.query.join(this.tableToJoin)
            }
            
            if(this.conditions !== undefined){
                this.query = this.query.where<U>(this.conditions.columns as QueryConditions<T, U>)
                let data: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[] = []
                
                if(this.conditions.columns instanceof Array){
                    if(this.conditions.data){
                        data = this.conditions.data
                    }
                }
                
                this.addOrder()
                this.addLimit()
                
                try {
                    const results = await this.getMysqlConnection().query<Entity[]>(this.query.__toString(), data) ;
                    resolve(results[0])
                }catch(e) {
                    reject(e)
                }
            }else {
                this.addOrder()
                this.addLimit()
                
                try {
                    const res = await this.getMysqlConnection().query<Entity[]>(this.query.__toString());
                    resolve(res[0])
                 }catch(e) {
                     reject(e)
                 }
            } 
        })
    }

    /**
     * Ajoute un ORDER BY au query si this.orders est défini
     */
    protected addOrder(): void {
        if(this.orders && this.query){
            this.query = this.query.orderBy(`${this.orders.column as string} ${this.orders.type}`)
        }
        
    }

    /**
     * Ajoute un LIMIT au querysi this.fetchLimit > 0 donc défini.
     */
    protected addLimit(): void {
        if(this.fetchLimit > 0 && this.query){
            this.query = this.query.limit(this.fetchLimit)
        }
    }

    search(columns:
        (keyof ColumnsToFill<T>)[], 
        conditions: ColumnsToFill<T> | (keyof ColumnsToFill<T>)[],
        dataForArrayConditions?: {values: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[], operator?: "OR" | "AND"}
    ): Promise<ColumnsToFill<Entity>[]>{
        return new Promise(async(resolve, reject)=>{
            let query: Query<T>

            if(columns.length > 0){
                query = this.getQueryBuilder().select(columns)
            }else {
                query = this.getQueryBuilder().select("*")
            }

            if(this.tableToJoin){
                this.query = query.join(this.tableToJoin)
            }

            if(dataForArrayConditions && conditions instanceof Array){
                query.where<undefined>(conditions, dataForArrayConditions.operator , true)
                
                try {
                    const res = await this.getMysqlConnection().query<Entity[]>(query.__toString(), dataForArrayConditions.values)
                    resolve(res[0])
                }catch(e){
                    reject(e)
                }
                
            }else  {
                query.where<undefined>(conditions, undefined , true)

                try {
                    const res = await this.getMysqlConnection().query<Entity[]>(query.__toString())
                    resolve(res[0])
                }catch(e){
                    reject(e)
                }
            }
        })
    }

    delete(credential: number | (keyof ColumnsToFill<T>)[] | ColumnsToFill<T>, 
        dataForArrayCredential?: (ColumnsToFill<T>[keyof ColumnsToFill<T>])[]
    ) {
        return new Promise(async(resolve, reject)=>{
            if(typeof credential === "number"){
                this.query = this.getQueryBuilder().delete().where(['id'] as (keyof ColumnsToFill<T>)[])

                try {
                    const res = await this.getMysqlConnection().query<Entity[]>(this.query.__toString(), credential)
                    resolve(res[0])
                }catch(e){
                    reject(e)
                }
            }else if(credential instanceof Array && dataForArrayCredential) {
                this.query = this.getQueryBuilder().delete().where<undefined>(credential)

                try {
                    const res = await this.getMysqlConnection().query<Entity[]>(this.query.__toString(), dataForArrayCredential)
                    resolve(res[0])
                }catch(e){
                    reject(e)
                }
            }else {
                this.query = this.getQueryBuilder().delete().where<undefined>(credential)

                try {
                    const res = await this.getMysqlConnection().query<Entity[]>(this.query.__toString())
                    resolve(res[0])
                }catch(e){
                    reject(e)
                }
            }
        })
    }
}