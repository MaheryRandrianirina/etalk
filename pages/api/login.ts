import { NextApiRequest, NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { getSession } from "@/lib/index";
import { NextRequest } from "next/server";

export default async function Login(req: NextRequest|NextApiRequest, res: NextApiResponse) {
    
    if(req.method === "POST"){
        const session = await getSession(req as NextApiRequest, res)
        const auth = new Auth(req as NextApiRequest, res, session)
        await auth.loginUser()
    }else {
        res.status(401).send("Not Allowed Method")
    }
}