import {Server as IOServer} from "socket.io"
import { Server as HTTPServer } from "http"
import {NextApiRequest, NextApiResponse} from "next"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../types/socket/utils"
import { withSessionRoute } from "../../backend/utilities/withSession"
import { Socket as NetSocket } from "net"
import axios from "axios"
import ConversationTable from "../../backend/database/tables/ConversationTable"
import { Conversation, ConversationUser } from "../../types/Database"
import { GetAway } from "../../types/utils"
import { User } from "../../types/user"

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

        io.on('connection', (socket)=>{
            socket.on('get_conversations', async()=>{
                try {
                    const u = user as GetAway<User, ["created_at", "updated_at", "email", "remember_token", "password"]>
                    const conversationTable = new ConversationTable<Conversation>()
                    const conversations = await conversationTable.get<ConversationUser, undefined>(
                        ["c.*"], {"cu.user_id": u.id}, 
                        [], 
                        {'conversation_user': {alias: "cu", on: "c.id = cu.conversation_id"}
                    }) as Conversation[]

                    socket.broadcast.emit('conversations', conversations)
                    res.status(200).end()
                    
                }catch(e){
                    res.status(500).json({success: false})
                }
            })
        })
    }
    res.end()
}


