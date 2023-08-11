
import ConversationTable from "../database/tables/ConversationTable"
import MessageTable from "../database/tables/MessageTable"
import { NextApiRequest } from "next"
import { AuthUser } from "../../types/user"
import ConversationUserTable from "../database/tables/ConversationUserTable"
import { ConversationMessage } from "../../types/conversation"
import { BlockedUsers, ConversationUser, Message } from "../../types/Database"
import { Conversation as ConversationType } from "../../types/Database"
import UserFriends from "../database/tables/UserFriends"
import BlockedUsersTable from "../database/tables/BlockedUsers"

export class Conversation {

    private authUser: AuthUser | null = null

    private conversationTable = new ConversationTable()
    private messageTable = new MessageTable()
    private userFriends = new UserFriends()

    constructor(req: NextApiRequest, private id?: number){
        if(this.authUser === null){
            this.authUser = req.session.user !== undefined ? req.session.user : null
        }
        
    }

    async new(receiver_id: number, message: ConversationMessage): Promise<void> {
        if(this.authUser){
            const conversationId = await this.conversationTable.new({initializer_id:this.authUser?.id, adressee_id: receiver_id})
        
            const blockedUsersTable = new BlockedUsersTable();
            const [blockedReceiver] = await blockedUsersTable
                .where<undefined>(["blocked_user_id", "user_id"], [receiver_id, this.authUser.id])
                .get() as BlockedUsers[];
            
            if(blockedReceiver){
                throw new Error("Cet utilisateur est bloqué")
            }

            await this.message(message, conversationId, receiver_id)
            await this.conversationUser(conversationId, receiver_id)
            await this.createNewFriend(receiver_id)
        }
    }

    async message(message: ConversationMessage, conversationId: number, receiverId: number): Promise<number> {
        return await this.messageTable.new({...message,conversation_id: conversationId, sender_id:this.authUser?.id, receiver_id:receiverId})
    }

    async conversationUser(conversationId: number, receiverId: number): Promise<void> {
        const conversationUserTable = new ConversationUserTable()
        await conversationUserTable.new({"conversation_id": conversationId, "user_id": this.authUser?.id})
        await conversationUserTable.new({"conversation_id": conversationId, "user_id": receiverId})
    }

    async messages(): Promise<Message[]>{
        if(this.id && this.authUser){
            const messages = await this.messageTable.columns<ConversationUser, undefined>(['m.*'])
                .join({
                'conversation_user': {alias: "cu", on: "cu.conversation_id = m.conversation_id"},
                'user': {alias: 'u', on: "u.id = cu.user_id"}
            })
                .where<ConversationUser>({
                "cu.conversation_id" : this.id,
                "cu.user_id" : this.authUser.id
            }).get() as Message[]

            return messages
        }else {
            throw new Error("La propriété id est undefined")
        }
    } 

    async createNewFriend(receiver_id: number): Promise<number> {
        if(this.authUser){
            const createdUserFriend = await this.userFriends
                .new({"user_id": this.authUser.id, "friend_id": receiver_id})
            return createdUserFriend
        }else {
            throw new Error("Vous n'êtes pas connecté!")
        }
    }
}