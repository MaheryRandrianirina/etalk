import BlockedUsersTable from "../../../backend/database/tables/BlockedUsers";
import { withSessionRoute } from "../../../backend/utilities/withSession";
import {NextApiRequest, NextApiResponse} from "next"

export default withSessionRoute(Block)

async function Block(req: NextApiRequest, res: NextApiResponse) {
    const {user} = req.session

    if(!user){
        res.redirect("/forbidden")
        return
    }

    const blockedUsersTable = new BlockedUsersTable()

    if(req.method === "POST"){
        const {adressee_id} = req.body as {adressee_id: number}
        if(adressee_id && typeof adressee_id === "number"){
            try {
                await blockedUsersTable
                    .new({"user_id": user.id, "blocked_user_id": adressee_id})
                res.status(200).json({success: true})
            }catch(e){
                res.status(500).json({success: false, error: e})
            }
        }else {
            res.status(415).json({success: false, message: "Format de donnée non supporté !"})
        }
    }
}