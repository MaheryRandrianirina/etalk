import {Server as IOServer} from "socket.io"
import { Server as HTTPServer } from "http"
import {NextApiRequest, NextApiResponse} from "next"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../types/socket/utils"
import { withSessionRoute } from "../../backend/utilities/withSession"
import { Socket as NetSocket } from "net"
import axios from "axios"
import ConversationTable from "../../backend/database/tables/ConversationTable"
import { Conversation, ConversationUser, Message } from "../../types/Database"
import { GetAway } from "../../types/utils"
import { User } from "../../types/user"
import MessageTable from "../../backend/database/tables/MessageTable"
import UserTable from "../../backend/database/tables/UserTable"

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

        io.on('connection', (socket)=>{
            socket.on('get_conversations', async()=>{
                try {
                    const conversationTable = new ConversationTable<Conversation>()
                    const conversations = await conversationTable
                        .columns<ConversationUser, undefined>(['c.*'])
                        .join({'conversation_user': {alias: "cu", on: "c.id = cu.conversation_id"}})
                        .where<ConversationUser>({'cu.user_id': u.id})
                        .get() as Conversation[]

                    socket.broadcast.emit('conversations', conversations)
                    res.status(200).end()
                    
                }catch(e){
                    res.status(500).json({success: false})
                }
            })

            socket.on('get_conversation_last_message', async(conversation_id)=>{
                const messageTable = new MessageTable()
                const [message] = await messageTable.columns<ConversationUser, undefined>(['m.*'])
                    .join({
                        "conversation_user": {alias: "cu", on: "cu.user_id = m.sender_id"},
                        "user": {alias: "u", on: "u.id = cu.user_id"}
                    })
                    .where<ConversationUser>({"m.conversation_id": conversation_id, "m.sender_id": u.id})
                    .orderBy("m.created_at", "DESC")
                    .limit(1)
                    .get() as Message[]
                
                const userTable = new UserTable()
                const [user] = await userTable.find(message.sender_id) as GetAway<User, ["created_at", "updated_at", "email", "remember_token", "password"]>[]
                
                socket.emit('conversation_last_message', {...message, sender: user})
            })
        })
    }
    res.end()
}


