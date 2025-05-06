import { useEffect } from "react";
import { DateHelper } from "@/lib/index";
import { ConversationMessage } from "../../types/conversation";
import { MessageType } from "../../types/messageType";
import Bubble from "./bubble";
import useClassnameAnimator from "../../hooks/useClassnameAnimator";

export default function Message({type, className, content}: {
  type: MessageType, 
  content: ConversationMessage,
  className?: string,
}): JSX.Element {
  const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

  useEffect(() => {
    if(className){
      setClassnameForAnimation(className)
    }
  })
  
    return <div className={"message " + type + " " + classnameForAnimation}>
      <Bubble content={className ? content : undefined} isPending={content.pending}/>  
      <div className="datetime">
        {content.created_at ? `${(new DateHelper()).format(content.created_at)}` : ""}
      </div>
      {content.pending && <p className="is-pending">envoi...</p> }
    </div>
}