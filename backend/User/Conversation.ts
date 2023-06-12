import { IronSession } from "iron-session"
import ConversationTable from "../database/tables/ConversationTable"
import { withIronSession } from "../utilities/withSession"
import { Message } from "../../types/Database"
import MessageTable from "../database/tables/MessageTable"
import { NextRequest, NextResponse } from "next/server"
import { request } from "http"
import { NextApiRequest } from "next"
import { AuthUser } from "../../types/user"
import ConversationUserTable from "../database/tables/ConversationUserTable"

export default class Conversation {

    private authUser: AuthUser | null = null

    constructor(req: NextApiRequest){
        if(this.authUser === null){
            this.authUser = req.session.user !== undefined ? req.session.user : null
        }
        
    }

    async new(receiverId: number, message: Message): Promise<number> {
        const conversationTable = new ConversationTable()
        const conversationId = await conversationTable.new({initializer_id:this.authUser?.id, adressee_id: receiverId})
        
        await this.message(message, conversationId, receiverId)
        return await this.conversationUser(conversationId)
    }

    async message(message: Message, conversationId: number, receiverId: number): Promise<number> {
        const messageTable = new MessageTable()
        return await messageTable.new({...message,conversation_id: conversationId, sender_id:this.authUser?.id, receiver_id:receiverId})
    }

    async conversationUser(conversationId: number): Promise<number> {
        const conversationUserTable = new ConversationUserTable()
        return await conversationUserTable.new({"conversation_id": conversationId, "user_id": this.authUser?.id})
    }
}