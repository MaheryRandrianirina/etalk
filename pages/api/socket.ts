import {Server as IOServer} from "socket.io"
import { Server as HTTPServer } from "http"
import {NextApiRequest, NextApiResponse} from "next"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../types/socket/utils"
import { withSessionRoute } from "../../backend/utilities/withSession"
import { Socket as NetSocket } from "net"
import axios from "axios"
import ConversationTable from "../../backend/database/tables/ConversationTable"
import { BlockedUsers, Conversation, ConversationUser, Message } from "../../types/Database"
import { GetAway } from "../../types/utils"
import { AuthUser, User } from "../../types/user"
import MessageTable from "../../backend/database/tables/MessageTable"
import UserTable from "../../backend/database/tables/UserTable"
import { Conversation as UserConversation } from "../../backend/User/Conversation"
import BlockedUsersTable from "../../backend/database/tables/BlockedUsers"
import { join } from "path"

interface SocketServer extends HTTPServer {
    io?: IOServer 
}

export interface SocketWithIO extends NetSocket {
    server: SocketServer
}

export default withSessionRoute(socketHandler)

function socketHandler (req: NextApiRequest, res: NextApiResponse){
    let {user} = req.session
    
    if(!user){
        res.status(403).json({success: false, forbidden: true})
        return
    }
    
    if(res.socket.server.io){
        console.log("socket already initialized")
        res.socket.server.io.disconnectSockets()
    }else {
        const io = new IOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData>(res.socket.server)

        res.socket.server.io = io

        const u = user as GetAway<User, ["created_at", "updated_at", "email", "remember_token", "password"]>

        const userTable = new UserTable()
        const messageTable = new MessageTable()

        io.on('connection', (socket)=>{
            socket.on('get_conversations', async()=>{
                console.log("get conversations")
                try {
                    const conversationTable = new ConversationTable<Conversation>()
                    const conversations = await conversationTable
                        .columns<ConversationUser, undefined>(['c.*'])
                        .join({'conversation_user': {alias: "cu", on: "c.id = cu.conversation_id"}})
                        .where<ConversationUser>({'cu.user_id': u.id})
                        .get() as Conversation[]

                    socket.broadcast.emit('conversations', conversations)
                    
                }catch(e){
                    console.error(e)
                }
            })

            socket.on('get_conversation_last_message', async(conversation_id)=>{
                try {
                    const [message] = await messageTable.columns<ConversationUser, undefined>(['m.*'])
                    .join({
                        "conversation_user": {alias: "cu", on: "cu.user_id = m.sender_id"},
                        "user": {alias: "u", on: "u.id = cu.user_id"}
                    })
                    .where<ConversationUser>({
                        "m.conversation_id": conversation_id, 
                        "OR": {"m.sender_id": u.id, "m.receiver_id": u.id}}
                    )
                    .orderBy("m.created_at", "DESC")
                    .limit(1)
                    .get() as Message[]
                    
                    const [user] = await userTable.find(message.sender_id) as GetAway<User, ["created_at", "updated_at", "remember_token", "password"]>[]
                    
                    socket.emit('conversation_last_message', {...message, sender: user})
                }catch(e){
                    console.error(e)
                }
            })

            socket.on('get_conversation_owners', async(initializer_id, adressee_id)=>{
                const [initializer] = await userTable.columns([
                        "id", "name", "username", 
                        "firstname", "email", "sex", 
                        "image", "is_online"
                    ]).find(initializer_id) as AuthUser[]

                const [adressee] = await userTable.find(adressee_id) as AuthUser[]

                socket.emit('conversation_owners', {
                    initializer: initializer, 
                    adressee: adressee
                })
            })

            socket.on('get_conversation_messages', async (conversation_id, adressee_id)=>{
                if(adressee_id === u.id){
                    socket.emit('conversation_messages_error', {status: 404, message: "Cette conversation n'existe pas"})
                    return
                }
                
                const userConversation = new UserConversation(req, conversation_id)
                const messages = await userConversation.messages()

                socket.emit('conversation_messages', messages)
            })

            socket.on('message', async(conversation_id, messageData)=>{
                
                try {
                    const conversationTable = new ConversationTable()
                    const conversation = await conversationTable.find(conversation_id)
                    const userConversation = new UserConversation(req, conversation_id)
                    
                    if(conversation.length === 0){
                        await userConversation.new(messageData.adressee_id, messageData.message)
                    }else {
                        await userConversation.message(messageData.message, conversation_id, messageData.adressee_id)
                    }
                    
                    const messages = await userConversation.messages()
                    socket.emit('conversation_messages', messages)
                }catch(e){
                    console.error(e)
                }
            })
        })
    }
    res.end()
}


