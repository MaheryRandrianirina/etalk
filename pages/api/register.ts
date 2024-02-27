import { NextApiRequest, NextApiResponse} from "next"
import { withSessionRoute } from "../../backend/utilities/withSession"
import Auth from "../../backend/User/Auth"
import { RouteHandler } from "next/dist/server/future/route-handlers/route-handler"

export default withSessionRoute(Register) 

async function Register(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST"){
        try {
            const auth = new Auth(req, res)
            await auth.registerUser()
        }catch(e){
            console.error(e)
        }
    }
}