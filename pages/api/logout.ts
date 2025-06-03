import { getSession } from "@/lib/index";
import { NextApiRequest, NextApiResponse } from "next"

export default async function Logout(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession(req, res);
    session.destroy();
        
    res.status(200).json({success: true});
}