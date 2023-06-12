import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../backend/utilities/withSession";
import MessageTable from "../../../../backend/database/tables/MessageTable";
import user from "..";
import { ConversationUser, Message } from "../../../../types/Database";

export default withSessionRoute(Conversation)

async function Conversation(req: NextApiRequest, res: NextApiResponse){
    const {user} = req.session

    if(req.method === "GET" && user){
        const {id} = req.query
        if(typeof id === "string"){
            await getLastMessage(parseInt(id), user.id, res)
        }
    }else {
        res.status(403).redirect("/forbidden")
    }
}

async function getLastMessage(id: number, userId: number, res: NextApiResponse): Promise<void> {
    try {
        console.log(id, userId)
        const messageTable = new MessageTable()
        const [message] = await messageTable.columns<ConversationUser, undefined>(['m.*'])
            .join({
                "conversation_user": {alias: "cu", on: "cu.user_id = m.sender_id"},
                "user": {alias: "u", on: "u.id = cu.user_id"}
            })
            .where<ConversationUser>({"m.conversation_id": id, "m.sender_id": userId})
            .orderBy("m.created_at", "DESC")
            .limit(1)
            .get() as Message[]
        
        res.status(200).json({success: true, message: message})
    }catch(e){
        res.status(500).json({success: false, errors: e})
    }
}