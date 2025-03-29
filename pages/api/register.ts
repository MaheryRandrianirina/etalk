import { NextApiResponse} from "next"
import Auth from "../../backend/User/Auth"
import { RequestWithSession } from "../../types/session"

export default async function Register(req: RequestWithSession, res: NextApiResponse) {
    if(req.method === "POST"){
        try {
            const auth = new Auth(req, res)
            await auth.registerUser()
        }catch(e){
            console.error(e)
        }
    }
}