import PasswordGuard from "../backend/security/password"

describe('test passwordGuard class', ()=>{
    
    test("hash method return hashed caracters of password", async ()=>{
        const p_one = new PasswordGuard()
        const hash = await p_one.hash("mypassword")
        expect(hash).not.toBeNull()
    })

    test("verify method return true",async ()=>{
        const p_one = new PasswordGuard()
        const hash = await p_one.hash("mypassword")
        console.log(hash)
        const p_two = new PasswordGuard()
        const verificationResult = await p_two.verify("mypassword", hash)
        expect(verificationResult).toBeTruthy()
    })
})