import Image from "next/image"
import Link from "next/link"
import { AuthUser, ConversationOwners, User } from "../../types/user"
import { Dispatch, SetStateAction, useContext, useEffect, useState } from "react"
import { Conversation as UserConversation, Join } from "../../types/Database"
import { ConversationMessage, SetMessage } from "../../types/conversation"
import { UserIcon } from "../atoms/icons/UserIcon"
import useClassnameAnimator from "../../hooks/useClassnameAnimator"
import { profilePhotoPath } from "@/lib/index"
import { CustomMessage } from "../../types/ably"
import { formatDistanceToNow } from "date-fns"; 
import { fr } from "date-fns/locale"
import { SocketContext } from "../contexts/SocketContext"

export default function Conversation({currentUser, conversation}: {
    currentUser: User,
    conversation: UserConversation
}): JSX.Element {
    const [message, setMessage]: [
        message: Join<ConversationMessage, {sender: AuthUser}> | null,
        setMessage: SetMessage<{sender: AuthUser}>
    ] = useState(null as Join<ConversationMessage, {sender: AuthUser}> | null)

    const [conversationOwners, setConversationOwners]: [
        conversationOwners: ConversationOwners | null,
        setConversationOwners: Dispatch<SetStateAction<ConversationOwners | null>>
    ] = useState(null as ConversationOwners | null);

    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

    const socketValue= useContext(SocketContext);

    useEffect(()=>{
        socketValue?.socket.on("conversation_last_message", (message: Join<ConversationMessage, {sender: AuthUser}>) => {
            console.log("yoh")
            setMessage(message)
        })

        socketValue?.socket.on('conversation_owners', (message: ConversationOwners) =>{
            setConversationOwners(message)
        })

        if(message === null){
            socketValue?.socket.emit("get_conversation_last_message", `${conversation.id}`)
        }
        
        if(conversationOwners === null){
            try {
                socketValue?.socket.emit('get_conversation_owners', conversation.initializer_id, conversation.adressee_id)
            }catch(e){
                console.error(e)
            }
            
        }

        if(classnameForAnimation.length === 0){
            setClassnameForAnimation("active")
        }
        
    }, [
        message,
        classnameForAnimation,
        conversation,
        conversationOwners
    ])

    const profilPic = conversationOwners?.adressee?.id !== currentUser.id ? 
        conversationOwners?.adressee.image : conversationOwners.initializer.image
    
    return <Link href={{
        pathname: "/conversation/[adressee_id]/[conversation_id]",
        query: { adressee_id: conversationOwners?.adressee.id, conversation_id: conversation.id}
    }}>
        {message !== null && <div className={"conversation " + classnameForAnimation}>
            <div className="adressee">
                {profilPic && profilPic.length > 0 ? 
                    <Image width={30} height={30} src={profilePhotoPath(profilPic)} alt="profile pic" className="profile_pic"/> :
                    <UserIcon/>
                }
                
                <p className="username">{conversationOwners?.adressee?.id !== currentUser.id ? 
                    conversationOwners?.adressee.username : conversationOwners.initializer.username}
                </p>
            </div>
            <div className="last_message">
                <span className="sender">{message.sender_id === currentUser.id ? "Vous " : 
                    (message.sender.sex === "man" ? "Lui " : "Elle :")} 
                    : </span><span className="content">{message.texto}
                </span>
            </div>
            <div className="datetime">{(formatDistanceToNow(new Date(conversation.created_at), {
                addSuffix: false,
                locale: fr
            }))}</div>
        </div>}
    </Link>
}