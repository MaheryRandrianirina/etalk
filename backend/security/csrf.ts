import { randomBytes } from "crypto";

export class CsrfGenerator {
    private tokens: string[] = []

    constructor(private key: string = "csrf", private sessionKey: string = "_csrf"){}
    
    generate(): Promise<Buffer> {
        return new Promise((resolve, reject)=>{
            randomBytes(32, (err, buf)=>{
                if(err) reject(err)
                resolve(buf)
            })
            
        })
    }
}