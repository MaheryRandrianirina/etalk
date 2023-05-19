import {createHmac} from "crypto"

export default class PasswordGuard {
    

    static hash(password: string): string {
        const hashedPassword = createHmac("sha256", "a secret")
            .update(password)
            .digest("hex")
        return hashedPassword
    }
}