import Image from "next/image"
import Link from "next/link"
import { AuthUser, ConversationOwners, User } from "../../types/user"
import { Dispatch, SetStateAction, useEffect, useState } from "react"
import { Conversation as UserConversation, Join } from "../../types/Database"
import { ConversationMessage, SetMessage } from "../../types/conversation"
<<<<<<< HEAD
import { UserIcon } from "../icons/UserIcon"
=======
import { UserIcon } from "../atoms/icons/UserIcon"
>>>>>>> feat/progressBarOnForms
import useClassnameAnimator from "../../hooks/useClassnameAnimator"
import { profilePhotoPath } from "@/lib/index"
import { useChannel } from "ably/react"
import axios from "axios"
import { CustomMessage } from "../../types/ably"
import { useCallAblyApi } from "@/hooks/useCallAbly"
import { formatDistanceToNow } from "date-fns"; 
import { fr } from "date-fns/locale"

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

    const [calledAblyApi, setCalledAblyApi] = useCallAblyApi();

    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

    const {channel} = useChannel('chat_messages', "conversation_last_message", message => {
        setMessage(message.data)
    });

    useEffect(()=>{
        const handleAblyConnexion = async()=>{
            if(!calledAblyApi){
                try {
                    await axios.get("/api/ably");
                    setCalledAblyApi(true);
                }catch(e){
                    console.error(e)
                }
                
            }

            if(message === null){
                channel.publish("get_conversation_last_message", `${conversation.id}`)
            }
            
            if(conversationOwners === null){
                try {
                    channel.publish('get_conversation_owners', JSON.stringify({
                        initializer_id : conversation.initializer_id, 
                        adressee_id :conversation.adressee_id
                    }))
        
                    channel.subscribe('conversation_owners', (message: CustomMessage<ConversationOwners|null>) =>{
                        setConversationOwners(message.data)
                    })
                }catch(e){
                    console.error(e)
                }
                
            }
        }
        handleAblyConnexion();

        if(classnameForAnimation.length === 0){
            setClassnameForAnimation("active")
        }
        
    }, [
        setClassnameForAnimation, 
        setConversationOwners, 
        message,
        classnameForAnimation,
        conversation,
        conversationOwners,
        channel,
        calledAblyApi,
        setCalledAblyApi
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