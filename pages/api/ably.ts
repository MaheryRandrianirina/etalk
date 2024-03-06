import { NextApiRequest, NextApiResponse} from "next"
import { withSessionRoute } from "../../backend/utilities/withSession"
import ably from "ably";
import ConversationTable from "../../backend/database/tables/ConversationTable";
import { Conversation, ConversationUser, Message } from "../../types/Database";
import { GetAway } from "../../types/utils";
import { AuthUser, User } from "../../types/user";
import UserTable from "../../backend/database/tables/UserTable";
import MessageTable from "../../backend/database/tables/MessageTable";
import { Conversation as UserConversation } from "../../backend/User/Conversation"
import { CustomMessage } from "../../types/ably";
import { ConversationMessage } from "../../types/conversation";

export default withSessionRoute(Ably) 

async function Ably(req: NextApiRequest, res: NextApiResponse) {
    if(req.method === "GET"){
        let {user} = req.session;
        if(!user){
            res.status(403).json({success: false, forbidden: true})
            return
        }

        const u = user as GetAway<User, ["created_at", "updated_at", "email", "remember_token", "password"]>
        
        const userTable = new UserTable()
        const messageTable = new MessageTable()
        try {
            const realtime = new ably.Realtime.Promise({key: process.env.ABLY_API_KEY});
            await realtime.connection.once("connected");
            console.log("connected to Ably");

            const chatlist_channel = realtime.channels.get("chat_list");
            chatlist_channel.subscribe('get_conversations', async(message: CustomMessage<null>) => {
                console.log("get conversations")
                try {
                    const conversationTable = new ConversationTable<Conversation>()
                    const conversations = await conversationTable
                        .columns<ConversationUser, undefined>(['c.*'])
                        .join({'conversation_user': {alias: "cu", on: "c.id = cu.conversation_id"}})
                        .where<ConversationUser>({'cu.user_id': u.id})
                        .get() as Conversation[]
                    
                    chatlist_channel.publish('conversations', conversations)
                }catch(e){
                    console.error(e)
                }
            });

            const chatmessages_channel = realtime.channels.get("chat_messages");
            chatmessages_channel.subscribe('get_conversation_last_message', async(msg: CustomMessage<number>)=>{
                try {
                    const [message] = await messageTable.columns<ConversationUser, undefined>(['m.*'])
                    .join({
                        "conversation_user": {alias: "cu", on: "cu.user_id = m.sender_id"},
                        "user": {alias: "u", on: "u.id = cu.user_id"}
                    })
                    .where<ConversationUser>({
                        "m.conversation_id": msg.data, 
                        "OR": {"m.sender_id": u.id, "m.receiver_id": u.id}}
                    )
                    .orderBy("m.created_at", "DESC")
                    .limit(1)
                    .get() as Message[]
                    
                    const [user] = await userTable
                        .find(message.sender_id) as GetAway<
                                User, 
                                ["created_at", "updated_at", "remember_token", "password"]
                            >[]
                    
                            chatmessages_channel.publish('conversation_last_message', {...message, sender: user})
                }catch(e){
                    console.error(e)
                }
            });

            chatmessages_channel.subscribe('get_conversation_owners', async(message: CustomMessage<string>)=>{
                const {initializer_id, adressee_id} = JSON.parse(message.data) as {initializer_id: number, adressee_id: number};
                const [initializer] = await userTable.columns([
                        "id", "name", "username", 
                        "firstname", "email", "sex", 
                        "image", "is_online"
                    ]).find(initializer_id) as AuthUser[]

                const [adressee] = await userTable.find(adressee_id) as AuthUser[]

                chatmessages_channel.publish('conversation_owners', {
                    initializer: initializer, 
                    adressee: adressee
                })
            });

            const chatroom_channel = realtime.channels.get("chat_room");
            chatroom_channel.subscribe('get_conversation_messages', async (msg: CustomMessage<string>)=>{
                const {adressee_id, conversation_id} = JSON.parse(msg.data) as {
                    adressee_id: number,
                    conversation_id: number
                }
                if(adressee_id === u.id){
                    chatroom_channel.publish('conversation_messages_error', {status: 404, message: "Cette conversation n'existe pas"})
                    return
                }
                
                const userConversation = new UserConversation(req, conversation_id)
                const messages = await userConversation.messages()

                chatroom_channel.publish('conversation_messages', messages)
            })

            chatroom_channel.subscribe('message', async(msg: CustomMessage<string>)=>{
                const {conversation_id, messageData} = JSON.parse(msg.data) as {
                    conversation_id: number,
                    messageData: {message: ConversationMessage, adressee_id: number}
                }
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
                    chatroom_channel.publish('conversation_messages', messages)
                }catch(e){
                    console.error(e)
                }
            })

        }catch(e){
            console.error(e)
        }

        res.end();
    }
}