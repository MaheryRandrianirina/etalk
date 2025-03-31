import { useEffect } from "react";
import { DateHelper } from "@/lib/index";
import { ConversationMessage } from "../../types/conversation";
import { MessageType } from "../../types/messageType";
import Bubble from "./bubble";
import useClassnameAnimator from "../../hooks/useClassnameAnimator";

export default function Message({type, last, className, content}: {
  type: MessageType, 
  content: ConversationMessage
  last?: boolean,
  className?: string
}): JSX.Element {
  const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

  useEffect(() => {
    if(className){
      setClassnameForAnimation(className)
    }
  })
  
    return <div className={"message " + type + " " + classnameForAnimation}>
      <Bubble content={className ? content : undefined}/>  
      <div className="datetime">
        {content.created_at ? `${(new DateHelper()).format(content.created_at)}` : ""}
      </div>
      {last && <p className="status"></p> }
    </div>
}