<<<<<<< HEAD
import { NextApiRequest, NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { getSession } from "@/lib/index"

export default async function Register(req: NextApiRequest, res: NextApiResponse) {
=======
import { NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { RequestWithSession } from "../../types/session"

export default async function Register(req: RequestWithSession, res: NextApiResponse) {
>>>>>>> 929a86fddfdd0fe7cf92aaf12ba32d67f3fdb2d2
    if(req.method === "POST"){
        const session = await getSession(req, res);
        const auth = new Auth(req, res, session);
        await auth.registerUser();
    }
}