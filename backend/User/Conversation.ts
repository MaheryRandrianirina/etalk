
import ConversationTable from "../database/tables/ConversationTable"
import MessageTable from "../database/tables/MessageTable"
import { AuthUser } from "../../types/user"
import ConversationUserTable from "../database/tables/ConversationUserTable"
import { ConversationMessage } from "../../types/conversation"
import { BlockedUsers, ColumnsToFill, ConversationUser, Message } from "../../types/Database"
import { Conversation as ConversationType } from "../../types/Database"
import UserFriends from "../database/tables/UserFriends"
import BlockedUsersTable from "../database/tables/BlockedUsers"
import { NextApiRequest } from "next"
import { IronSession } from "iron-session"
import { SessionData } from "../../types/session"

export class Conversation {

    private authUser: AuthUser | null = null

    private conversationTable = new ConversationTable()
    private messageTable = new MessageTable()
    private userFriends = new UserFriends()

    constructor(req: NextApiRequest, session: IronSession<SessionData>, private id?: number){
        if(this.authUser === null){
            this.authUser = session?.user !== undefined ? session.user : null
        }
        
    }

    async new(receiver_id: number, message: ConversationMessage): Promise<void> {
        if(this.authUser){
            const conversationId = await this.conversationTable.new({
                initializer_id:this.authUser?.id, 
                adressee_id: receiver_id} as ColumnsToFill<ConversationType>
            )
        
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
        await conversationUserTable.new({"conversation_id": conversationId, "user_id": this.authUser?.id} as ColumnsToFill<ConversationType>)
        await conversationUserTable.new({"conversation_id": conversationId, "user_id": receiverId} as ColumnsToFill<ConversationType>)
    }

    async messages(): Promise<Message[]>{
        if(this.id && this.authUser){
            const messages = await this.messageTable.columns<ConversationUser, undefined>(['m.*'])
                .join({
                'conversations_users': {alias: "cu", on: "cu.conversation_id = m.conversation_id"},
                'users': {alias: 'u', on: "u.id = cu.user_id"}
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
                .new({"user_id": this.authUser.id, "friend_id": receiver_id} as ColumnsToFill<ConversationType>)
            return createdUserFriend
        }else {
            throw new Error("Vous n'êtes pas connecté!")
        }
    }
}