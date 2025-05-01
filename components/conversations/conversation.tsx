import Image from "next/image"
import Link from "next/link"
import { AuthUser, ConversationOwners, User } from "../../types/user"
import { Dispatch, memo, SetStateAction, useContext, useEffect, useState } from "react"
import { Conversation as UserConversation, Join } from "../../types/Database"
import { ConversationMessage, SetMessage } from "../../types/conversation"
import { UserIcon } from "../atoms/icons/UserIcon"
import useClassnameAnimator from "../../hooks/useClassnameAnimator"
import { profilePhotoPath } from "@/lib/index"
import { formatDistanceToNow } from "date-fns"; 
import { fr } from "date-fns/locale"
import { SocketContext } from "../contexts/SocketContext"
import axios from "axios"

export default (Conversation)

function Conversation({currentUser, conversation}: {
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

    if(message === null && socketValue){
        console.log("message = null", `${conversation.id}.conversation_last_message`)
        socketValue.socket.emit("get_conversation_last_message", `${conversation.id}`)

        socketValue?.socket.on(`${conversation.id}.conversation_last_message`, (message: Join<ConversationMessage, {sender: AuthUser}>) => {
            setMessage(message)
        })
    }

    const conversationOwnersDefined = conversationOwners != null

    useEffect(()=>{
        
        if(!conversationOwnersDefined){
            axios.get(`/api/user?initializer_id=${conversation.initializer_id}&adressee_id=${conversation.adressee_id}`)
                .then(res => {
                    setConversationOwners(res.data.owners)
                })
                .catch(err => {
                    // gerer erreur
                })
        }

        if(classnameForAnimation.length === 0){
            setClassnameForAnimation("active")
        }

    }, [classnameForAnimation, conversationOwnersDefined])

    const profilPic = conversationOwners?.adressee?.id !== currentUser.id ? 
        conversationOwners?.adressee.image : conversationOwners.initializer.image
    console.log("conversation", conversation.id, message)
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