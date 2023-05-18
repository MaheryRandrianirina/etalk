import { compare, genSalt, hash } from "bcrypt"
import { createHmac, generateKeyPairSync, pbkdf2Sync, randomBytes } from "crypto"

export default class PasswordGuard {
    private saltRound: number = 10

    constructor(){
        
    }

    hash(password: string): Promise<string> {
        return new Promise((resolve, reject)=>{
            genSalt(this.saltRound, (err, salt)=>{
                if(err) reject(err)
                hash(password, salt, (err, hash)=>{
                    if(err) reject(err)
                    resolve(hash)
                })
            })
        })
    }

    verify(password: string, hashedPasswordFromDB: string): Promise<boolean> {
        console.log(password, " and ", hashedPasswordFromDB)
        return new Promise((resolve, reject)=>{
            compare(password, hashedPasswordFromDB, (err, result)=>{
                if(err) reject(err)
                resolve(result)
            })
        })
    }
}