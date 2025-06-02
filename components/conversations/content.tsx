
import { useEffect, useState } from "react";
import { ConversationMessage } from "../../types/conversation";
import { AuthUser } from "../../types/user";
import Message from "./message";
import useClassnameAnimator from "../../hooks/useClassnameAnimator";

export default function Content({messages, showIntoBubble, user}: {
    messages: ConversationMessage[],
    showIntoBubble: boolean
    user: AuthUser
}):JSX.Element {
    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")
    const [clickBody, setClickBody] = useState(false)

    useEffect(()=>{
        const conversationContent = document.querySelector('.conversation_content') as HTMLDivElement
        const messagesContainer = document.querySelector('.messages_container') as HTMLDivElement
        conversationContent.scrollTop = messagesContainer.offsetHeight

        if(classnameForAnimation.length === 0){
            setClassnameForAnimation("show_bubble") 
        }

        const handleClickBody = ()=> {
            console.log("clickeee")
            setClickBody(true)
        }

        document.body.addEventListener("click", handleClickBody)

        return ()=>{
            document.body.removeEventListener("click", handleClickBody)
        }
    }, [classnameForAnimation, messages, setClassnameForAnimation])
    
    return <div className={"conversation_content"}>
        <div className='messages_container'>
            {(messages.length > 0 && showIntoBubble) && 
                messages.map(message => {
                    return <Message setClickBody={setClickBody} clickBody={clickBody} key={String(message.id)} content={message} className={classnameForAnimation} type={user.id !== message.sender_id ? 
                        "incoming" : "outgoing"}
                    />
            })}
        </div>
    </div>
}