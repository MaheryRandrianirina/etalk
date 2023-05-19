import { NextApiRequest, NextApiResponse} from "next"
import { withSessionRoute } from "../../backend/utilities/withSession"
import Auth from "../../backend/User/Auth"

export default withSessionRoute(Register) 

function Register(req: NextApiRequest, res: NextApiResponse) {
    
    if(req.method === "POST"){
        const auth = new Auth(req, res)
        try {
            auth.registerUser()
        }catch(e){
            console.error(e)
        }
        
    }
}
