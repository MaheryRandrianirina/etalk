import { withSessionRoute } from "../../backend/utilities/withSession";
import { NextApiRequest, NextApiResponse } from "next"

export default withSessionRoute(Logout)

async function Logout(req: NextApiRequest, res: NextApiResponse) {
    const session = req.session
    console.log(req.body)
    if(session.user && req.method?.toLocaleLowerCase() === "post"){
        session.destroy()

        res.status(200).json({success: true})
    }else {
        res.status(301).json({success: false, forbidden: true})
    }
}