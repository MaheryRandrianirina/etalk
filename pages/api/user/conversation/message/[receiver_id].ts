import {Conversation} from "../../../../../backend/User/Conversation";
import {  withSessionRoute } from "../../../../../backend/utilities/withSession";
import {NextApiRequest, NextApiResponse} from "next"
import { Message } from "../../../../../types/Database";

export default withSessionRoute(Message)

async function Message(req: NextApiRequest, res:NextApiResponse){
    const {user} = req.session
    if(user){
        if(req.method?.toLocaleLowerCase() === "post"){
            const {receiver_id} = req.query
            const r_id = parseInt(receiver_id as string)
            const message = req.body as Message

            try {
                const conversation = new Conversation(req)
                await conversation.new(r_id, message)
                
                res.status(200).json({success: true})
            }catch(e){
                res.status(500).json({success: false, error: e})
            }
        }
    }else {
        res.status(403).json({forbidden: true})
    }
    
}