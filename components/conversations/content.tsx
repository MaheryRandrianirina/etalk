
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { ConversationMessage } from "../../types/conversation";
import { AuthUser } from "../../types/user";
import Message from "./message";

export default function Content({messages, showIntoBubble, user}: {
    messages: ConversationMessage[],
    showIntoBubble: boolean
    user: AuthUser
}):JSX.Element {
    const [animationClass, setAnimationClass]: [
        animationClass: string,
        setAnimationClass: Dispatch<SetStateAction<string>>
    ] = useState("")

    useEffect(()=>{
        setAnimationClass("show_bubble")
    })
    
    return <div className="conversation_content">
        {(messages.length > 0 && showIntoBubble) && 
            messages.map(message => {
                return <Message key={message.id} content={message} className={animationClass} type={user.id !== message.sender_id ? 
                    "incoming" : "outgoing"}
                />
        })}
    </div>
}