import { compare, genSalt, hash } from "bcrypt";

export default class PasswordGuard {
    private saltRounds: number =10

    constructor() {

    }

    hash(password: string): Promise<string> {
        return new Promise((resolve, reject)=>{
            genSalt(this.saltRounds, (err, salt)=>{
                if(err) reject(err)
                hash(password, salt, (err, hash)=>{
                    if(err) reject(err)
                    resolve(hash)
                })
            })
        })
    }

    verify(password: string, passwordFromDB: string): Promise<boolean>{
        return new Promise((resolve, reject)=>{
            compare(password, passwordFromDB, (err, result)=>{
                if(err) reject(err)
                resolve(result)
            })
        })
    }
}