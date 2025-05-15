import { NextApiRequest, NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { getSession } from "@/lib/index";
import { NextRequest } from "next/server";

export default async function Login(req: NextRequest|NextApiRequest, res: NextApiResponse) {
    const session = await getSession(req as NextApiRequest, res)
    const auth = new Auth(req as NextApiRequest, res, session)
    await auth.loginUser()
}