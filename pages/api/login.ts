import { NextApiRequest, NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { getSession } from "@/lib/index";

export default async function Login(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST"){
        const session = await getSession(req, res)
        const auth = new Auth(req, res, session)
        await auth.loginUser()
    }else {
        res.status(401).send("Not Allowed Method")
    }
}