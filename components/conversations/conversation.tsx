import Image from "next/image"
import ProfilPic from "../../public/20200823_120127_0.jpg"
import Link from "next/link"
import { AuthUser, User } from "../../types/user"
import { useEffect, useState } from "react"
import axios from "axios"
import { Conversation as UserConversation, Message, Join } from "../../types/Database"
import { ConversationMessage, SetMessage } from "../../types/conversation"
import DateHelper from "../../backend/Helpers/Date"
import { AppSocketState } from "../../types/utils"

export default function Conversation({currentUser, conversation, socket}: {
    currentUser: User,
    conversation: UserConversation,
    socket: AppSocketState
}): JSX.Element {

    const [message, setMessage]: [
        message: Join<ConversationMessage, {sender: AuthUser}> | null,
        setMessage: SetMessage<{sender: AuthUser}>
    ] = useState(null as Join<ConversationMessage, {sender: AuthUser}> | null)

    useEffect(()=>{
        console.log(conversation)
        if(socket){
            socket.emit("get_conversation_last_message", conversation.id)

            socket.on('conversation_last_message', (message)=>{
                setMessage(message)
            }) 
        }
        
    }, [])

    return <Link href={{
        pathname: "/conversation/[username]/[conversation_id]",
        query: { username: currentUser.username, conversation_id: currentUser.id}
    }}>
        {message !== null && <div className="conversation">
            <div className="adressee">
                <Image src={ProfilPic} alt="profile pic" className="profile_pic"/>
                <p className="username">{currentUser.username}</p>
            </div>
            <div className="last_message">
                <span className="sender">{message.sender_id === currentUser.id ? "Vous " : 
                    (message.sender.sex === "man" ? "Lui " : "Elle :")} 
                    : </span><span className="content">{message.texto}
                </span>
            </div>
            <div className="datetime">{(new DateHelper()).format(message.created_at as Date)}</div>
        </div>}
    </Link>
}