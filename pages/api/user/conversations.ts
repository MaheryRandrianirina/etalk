import { NextApiRequest, NextApiResponse} from "next"
import ConversationTable from "../../../backend/database/tables/ConversationTable"
import { Conversation as ConversationType, ConversationUser } from "../../../types/Database"
import { getSession } from "@/lib"


export default async function Conversation(req: NextApiRequest, res: NextApiResponse) {
    const session = await getSession(req, res);
    const user = session.user;

    if(user){
        try {
            const conversationTable = new ConversationTable<ConversationType>()
            const conversations = await conversationTable
                .columns<ConversationUser, undefined>(["c.*"])
                .join({'conversations_users': {alias: "cu", on: "c.id = cu.conversation_id"}})
                .where<ConversationUser>({"cu.user_id": user.id}).get()
            
            res.status(200).json({success: true, conversations: conversations})
        }catch(e){
            res.status(500).json({success: false})
        }
    }else {

    }

}