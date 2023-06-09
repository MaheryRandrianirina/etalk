import { ConversationMessage } from "../../types/conversation";

export default function Bubble({content}: {content?: ConversationMessage}):JSX.Element {
    return <div className="bubble">{content ? content.texto : ""}</div>
}