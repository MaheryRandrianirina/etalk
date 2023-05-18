import { NextApiRequest, NextApiResponse} from "next"
import { withSessionRoute } from "../../backend/utilities/withSession"
import Auth from "../../backend/User/Auth"

export default withSessionRoute(Login)

function Login(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "POST"){
        const auth = new Auth(req, res)
        auth.loginUser()
    }
}