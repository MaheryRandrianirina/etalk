import { NextApiRequest, NextApiResponse} from "next"
import { CsrfGenerator } from "../../backend/security/csrf"
import { getSession } from "@/lib"
import { NextResponse } from "next/server"

export default async function Csrf(req: NextApiRequest, res: NextApiResponse){    
    try{
        const csrf = new CsrfGenerator()
        const token = await csrf.generate()
        const tokenString = token.toString("base64")

        const session = await getSession(req, res)
        session._token = tokenString

        await session.save()
        
        const csrfCookie = `_csrf=${encodeURIComponent(tokenString)}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${60*5}`;

        const existingCookies = res.getHeader("Set-Cookie") as string|string[]|undefined || [];
        const cookies = Array.isArray(existingCookies) ? existingCookies : [existingCookies];

        res.setHeader("Set-Cookie", [...cookies, csrfCookie]);
        res.json({success: true})
    }catch(error){
        res.status(500).send("Impossible de générer le token à cause d'une erreur serveur.")
    }
}