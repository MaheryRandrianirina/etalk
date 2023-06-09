import DateHelper from "../../backend/Helpers/Date";
import { ConversationMessage } from "../../types/conversation";
import { MessageType } from "../../types/messageType";
import Bubble from "./bubble";

export default function Message({type, last, className, content}: {
  type: MessageType, 
  content: ConversationMessage
  last?: boolean,
  className?: string
}): JSX.Element {
  
    return <div className={"message " + type + " " + (className ? className : "")} key={content.id}>
      <Bubble content={className ? content : undefined}/>  
      <div className="datetime">
        {content.created_at ? `${(new DateHelper()).format(content.created_at)}` : ""}
      </div>
      {last && <p className="status"></p> }
    </div>
}