import { NextApiResponse } from "next"
import { RequestWithSession } from "../../types/session";

export default async function Logout(req: RequestWithSession, res: NextApiResponse) {
    const session = req.session
    if(session?.user && req.method?.toLocaleLowerCase() === "post"){
        session.destroy();

        res.status(200).json({success: true});
    }else {
        res.status(301).json({success: false, forbidden: true});
    }
}