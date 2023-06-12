import { Dispatch, Key, SetStateAction, useEffect, useState } from "react";
import DateHelper from "../../backend/Helpers/Date";
import { ConversationMessage } from "../../types/conversation";
import { MessageType } from "../../types/messageType";
import Bubble from "./bubble";

export default function Message({type, last, className, content, key}: {
  type: MessageType, 
  content: ConversationMessage
  last?: boolean,
  className?: string,
  key?: Key
}): JSX.Element {
  const [classnameForAnimation, setClassname]: [
    classnameForAnimation: string, 
    setClassname: Dispatch<SetStateAction<string>>
  ] = useState("")

  useEffect(() => {
    if(className){
      setClassname(className)
    }
  })
  
    return <div className={"message " + type + " " + classnameForAnimation} key={key}>
      <Bubble content={className ? content : undefined}/>  
      <div className="datetime">
        {content.created_at ? `${(new DateHelper()).format(new Date(content.created_at))}` : ""}
      </div>
      {last && <p className="status"></p> }
    </div>
}