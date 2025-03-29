import { NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { RequestWithSession } from "../../types/session"

export default async function Login(req: RequestWithSession, res: NextApiResponse) {
    if(req.method === "POST"){
        const auth = new Auth(req, res)
        await auth.loginUser()
    }else {
        res.status(401).send("Not Allowed Method")
    }
}