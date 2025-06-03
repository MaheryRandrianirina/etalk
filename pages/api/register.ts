import { NextApiRequest, NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { getSession } from "@/lib/index"

export default async function Register(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession(req, res);
    const auth = new Auth(req, res, session);
    await auth.registerUser();
}