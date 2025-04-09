import { NextApiRequest, NextApiResponse } from "next";
import { withSessionRoute } from "../../../../backend/utilities/withSession";
import MessageTable from "../../../../backend/database/tables/MessageTable";
import { BlockedUsers, ConversationUser, Message } from "../../../../types/Database";
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
        }else if(typeof adressee_id === "string" && user.id && typeof id === "string"){
            await getConversationAdressee(adressee_id, id, user.id, res)
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
                "conversations_users": {alias: "cu", on: "cu.user_id = m.sender_id"},
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

async function getConversationAdressee(
    adressee_id: number | string,
    conversation_id: number | string, 
    user_id: number, 
    res: NextApiResponse
){
    const nb_adressee_id = typeof adressee_id === "string" ? parseInt(adressee_id) : adressee_id
    const nb_conversation_id = typeof conversation_id === "string" ? parseInt(conversation_id) : conversation_id
    try {
        const userTable = new UserTable()
        let foundUser: User

        if(nb_adressee_id === user_id){
            [foundUser] = await userTable.columns<ConversationUser, undefined>(["u.*"])
                .join({"conversations_users": {
                    alias: "cu",
                    on: "u.id = cu.user_id"
                }, 
                    "conversation": {alias: "c", on: "cu.conversation_id = c.id"}
                }).where<ConversationUser>(
                    ["cu.user_id !=", "cu.conversation_id"],
                    [nb_adressee_id, nb_conversation_id]
                ).get() as User[]
        }else {
            [foundUser] = await userTable.columns([
                "id", "name", "username", 
                "firstname", "email", "sex", 
                "image", "is_online"
            ]).find(nb_adressee_id) as User[]
        }
        
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
            .where<User>({"bu.blocked_user_id": nb_adressee_id, "bu.user_id": user_id})
            .get() as BlockedUsers[]
        
        res.status(200).json({success: true, adressee: {...foundUser, blocked: (
            blocked_adressee ? nb_adressee_id === blocked_adressee.blocked_user_id : false
        )}})
    }catch(e){
        console.error(e)
    }
}