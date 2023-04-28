import { randomBytes } from "crypto";

export default class CsrfClass {
    private tokens: string[] = []

    constructor(private key: string = "csrf", private sessionKey: string = "_csrf"){

    }
    
    generate(): Promise<any> {
        return new Promise((resolve, reject)=>{
            randomBytes(32, (err, buf)=>{
                if(err) reject(err)
                resolve(buf)
            })
            
        })
    }
}