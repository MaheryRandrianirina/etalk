import { NextApiRequest, NextApiResponse} from "next"
import CsrfClass from "../../backend/security/csrf"

export default async function Csrf(req: NextApiRequest, res: NextApiResponse){
    const csrf = new CsrfClass()

    if(req.method === "GET"){
        console.log("method get")
        try
        {
            const token = await csrf.generate()
            res.setHeader("Content-Type", "plain/text").status(200).send(token)
        }catch(error){
            res.status(500).send("Impossible de générer le token à cause d'une erreur.")
        }
    }
}