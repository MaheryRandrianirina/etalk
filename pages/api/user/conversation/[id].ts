import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../backend/utilities/withSession";
import MessageTable from "../../../../backend/database/tables/MessageTable";
import {Conversation as UserConversation} from "../../../../backend/User/Conversation";
import { BlockedUsers, ConversationUser, Message } from "../../../../types/Database";
import ConversationTable from "../../../../backend/database/tables/ConversationTable";
import BlockedUsersTable from "../../../../backend/database/tables/BlockedUsers";
import UserTable from "../../../../backend/database/tables/UserTable";
import { User } from "../../../../types/user";

export default withSessionRoute(Conversation)

async function Conversation(req: NextApiRequest, res: NextApiResponse){
    const {user} = req.session

    if(req.method === "GET" && user){
        const {id, adressee_id} = req.query
        
        if(typeof id === "string" && adressee_id === undefined && user.id){
            await getLastMessage(parseInt(id), user.id, res)
        }else if(typeof adressee_id === "string" && user.id){
            await getConversationAdressee(adressee_id, user.id, res)
        }
    }else {
        res.status(403).redirect("/forbidden")
    }
}

async function getLastMessage(id: number, userId: number, res: NextApiResponse): Promise<void> {
    try {
        
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

async function getConversationAdressee(adressee_id: number | string, user_id: number, res: NextApiResponse){
    const id = typeof adressee_id === "string" ? parseInt(adressee_id) : adressee_id
    try {
        const userTable = new UserTable()
        const [foundUser] = await userTable.columns([
            "id", "name", "username", 
            "firstname", "email", "sex", 
            "image", "is_online"
        ]).find(id) as User[]

        const blockedUsersTable = new BlockedUsersTable()
        const [blocked_adressee] = await blockedUsersTable
            .columns<BlockedUsers, undefined>(['bu.*'])
            .join({
                "user": {
                    alias: "u",
                    on: "u.id = bu.blocked_user_id AND u.id = bu.user_id",
                    type: 'LEFT'
                }
            })
            .where({ "blocked_user_id": id, "user_id": user_id })
            .get() as BlockedUsers[]
        
        res.status(200).json({success: true, adressee: {...foundUser, blocked: id === blocked_adressee.blocked_user_id}})
    }catch(e){
        console.error(e)
    }
}