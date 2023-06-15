import { NextApiRequest, NextApiResponse} from "next"
import { withSessionRoute } from "../../../backend/utilities/withSession"
import ConversationTable from "../../../backend/database/tables/ConversationTable"
import { Conversation, ConversationUser } from "../../../types/Database"

export default withSessionRoute(Conversation)

async function Conversation(req: NextApiRequest, res: NextApiResponse) {
    const user = req.session.user
    console.log('conversation api')
    if(user){
        try {
            const conversationTable = new ConversationTable<Conversation>()
            const conversations = await conversationTable
                .columns<ConversationUser, undefined>(["c.*"])
                .join({'conversation_user': {alias: "cu", on: "c.id = cu.conversation_id"}})
                .where<ConversationUser>({"cu.user_id": user.id}).get()
            
            res.status(200).json({success: true, conversations: conversations})
        }catch(e){
            res.status(500).json({success: false})
        }
        
    }else {

    }

}