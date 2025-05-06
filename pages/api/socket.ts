import {Server as IOServer} from "socket.io"
import { Server as HTTPServer } from "http"
import type { NextApiRequest, NextApiResponse} from "next"
import { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from "../../types/socket/utils"
import { Socket as NetSocket } from "net"
import ConversationTable from "../../backend/database/tables/ConversationTable"
import { Conversation, ConversationUser, Message } from "../../types/Database"
import { GetAway } from "../../types/utils"
import { User } from "../../types/user"
import MessageTable from "../../backend/database/tables/MessageTable"
import UserTable from "../../backend/database/tables/UserTable"
import { Conversation as UserConversation } from "../../backend/User/Conversation"
import { getSession } from "@/lib/index"

interface SocketServer extends HTTPServer {
    io?: IOServer 
}

export interface SocketWithIO extends NetSocket {
    server: SocketServer
}

export interface ResponseWithSocket<T> extends NextApiResponse<T>{
    socket: SocketWithIO
}

export default async function socketHandler (req: NextApiRequest, res: ResponseWithSocket<any>){
    const session = await getSession(req, res);
    const user = session.user;
    if(!user){
        res.status(403).json({success: false, forbidden: true});
        return;
    }
    
    if(res.socket.server.io){
        console.log("socket already initialized")
        res.socket.server.io.disconnectSockets()
    }else {
        const io = new IOServer<
        ClientToServerEvents,
        ServerToClientEvents,
        InterServerEvents,
        SocketData>(res.socket.server, {
            pingInterval: 25000, // Send a ping every 25 seconds
            pingTimeout: 60000,  // Wait 60 seconds for a pong before disconnecting
        })

        res.socket.server.io = io

        const u = user as Omit<User, "created_at" | "updated_at" | "email" | "remember_token" | "password">;

        const userTable = new UserTable();
        const messageTable = new MessageTable();

        io.on('connection', (socket)=>{
            socket.on('disconnect', (reason) => {
                console.log(`Disconnected: ${reason}`);
            });

            socket.on('get_conversations', async()=>{
                console.log("get conversationssss")
                try {
                    const conversationTable = new ConversationTable<Conversation>()
                    const conversations = await conversationTable
                        .columns<ConversationUser, undefined>(['c.*'])
                        .join({ 'conversations_users': { alias: "cu", on: "c.id = cu.conversation_id" } })
                        .where<ConversationUser>({ 'cu.user_id': u.id })
                        .orderBy("c.created_at", "DESC")
                        .get() as Conversation[];

                    socket.emit('conversations', conversations);
                } catch (e) {
                    console.error(e)
                }
            })

            socket.on('get_conversation_last_message', async(conversation_id)=>{
                console.log("get_conversation_last_message server", conversation_id)

                try {
                    const [message] = await messageTable.raw(`
                            SELECT * FROM message
                            WHERE conversation_id = ?
                            AND (sender_id = ? OR receiver_id = ?)
                            ORDER BY created_at DESC
                            LIMIT 1
                        `, [conversation_id, u.id, u.id]);
                    
                    const [user] = await userTable
                        .find(message.sender_id) as GetAway<
                                User, 
                                ["created_at", "updated_at", "remember_token", "password"]
                            >[]
                    
                    console.log("sending conversation last message", conversation_id, message.id)
                    socket.emit(`${conversation_id}.conversation_last_message`, {...message, sender: user})
                }catch(e){
                    console.error(e)
                }
            })

            socket.on('get_conversation_messages', async (conversation_id, adressee_id)=>{                
                const userConversation = new UserConversation(req, session, conversation_id)
                const messages = await userConversation.messages()

                console.log("send messages fron get_conversation_messages")
                socket.emit('conversation_messages', messages)
            })

            socket.on('message', async(conversation_id, messageData)=>{
                
                try {
                    const conversationTable = new ConversationTable()
                    const conversation = await conversationTable.find(conversation_id)
                    const userConversation = new UserConversation(req, session, conversation_id)
                    
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


