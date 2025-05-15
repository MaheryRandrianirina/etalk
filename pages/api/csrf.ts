import { NextApiRequest, NextApiResponse} from "next"
import { CsrfGenerator } from "../../backend/security/csrf"

export default async function Csrf(req: NextApiRequest, res: NextApiResponse){    
    try{
        const csrf = new CsrfGenerator()
        const token = await csrf.generate()
        const tokenString = token.toString("base64")

        res.setHeader("Set-Cookie", `_csrf=${tokenString}; Path=/; HttpOnly; SameSite=Strict; Secure;; Max-Age=${60*5}`)
            .json({
                success: true,
                csrf: tokenString,
            })
    }catch(error){
        res.status(500).send("Impossible de générer le token à cause d'une erreur serveur.")
    }
}