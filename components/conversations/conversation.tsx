import Image from "next/image"
import ProfilPic from "../../public/20200823_120127_0.jpg"
import Link from "next/link"
import { AuthUser, ConversationOwners, User } from "../../types/user"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Conversation as UserConversation, Join } from "../../types/Database"
import { ConversationMessage, SetMessage } from "../../types/conversation"
import DateHelper from "../../lib/helpers/Date"
import { AppSocketState } from "../../types/utils"
import { UserIcon } from "../icons/UserIcon"
import useClassnameAnimator from "../../lib/hooks/useClassnameAnimator"
import path, { dirname } from "path"
import { profilePhotoPath } from "../../lib/func/path"

export default function Conversation({currentUser, conversation, socket}: {
    currentUser: User,
    conversation: UserConversation,
    socket: AppSocketState
}): JSX.Element {

    const [message, setMessage]: [
        message: Join<ConversationMessage, {sender: AuthUser}> | null,
        setMessage: SetMessage<{sender: AuthUser}>
    ] = useState(null as Join<ConversationMessage, {sender: AuthUser}> | null)

    const [conversationOwners, setConversationOwners]: [
        conversationOwners: ConversationOwners | null,
        setConversationOwners: Dispatch<SetStateAction<ConversationOwners | null>>
    ] = useState(null as ConversationOwners | null)

    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

    useEffect(()=>{
        if(socket){
            if(message === null){
                socket.emit("get_conversation_last_message", conversation.id)
                
                socket.on('conversation_last_message', (message)=>{
                    setMessage(message)
                })
            }
            
            if(conversationOwners === null){
                socket.emit('get_conversation_owners', conversation.initializer_id, conversation.adressee_id)

                socket.on('conversation_owners', owners=>{
                    setConversationOwners(owners)
                })
            } 
        }

        if(classnameForAnimation.length === 0){
            setClassnameForAnimation("active")
        }
        
    }, [
        setClassnameForAnimation, 
        setConversationOwners, 
        socket,
        classnameForAnimation,
        conversation,
        conversationOwners,
        message
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
            <div className="datetime">{(new DateHelper()).format(message.created_at as Date)}</div>
        </div>}
    </Link>
}