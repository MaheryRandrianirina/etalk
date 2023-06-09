import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../backend/utilities/withSession";
import MessageTable from "../../../../backend/database/tables/MessageTable";
import user from "..";

export default withSessionRoute(Conversation)

async function Conversation(req: NextApiRequest, res: NextApiResponse){
    const {user} = req.session
    if(req.method === "GET" && user){
        const {id} = req.query
        if(typeof id === "string"){
            const messageTable = new MessageTable()
            messageTable.get(['m.*'], {"m.conversation_id": parseInt(id), "m.receiver_id": user.id})
        }
    }else {
        res.status(403).redirect("/forbidden")
    }
}