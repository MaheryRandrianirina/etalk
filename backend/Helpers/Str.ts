import { randomBytes } from "crypto";

export default class Str {
    
    static random(length: number): string {
        return randomBytes(64).toString("hex").slice(0, length)
    }

    static getTableAlias(caracter: string): string {
        let alias = ""

        const separator = '_'
        if(caracter.includes(separator)){
            caracter.split(separator).forEach(item => {
                alias += item.slice(0,1).toLocaleLowerCase()
            })
        }else {
            alias = caracter.slice(0,1).toLocaleLowerCase()
        }

        return alias
    }
}