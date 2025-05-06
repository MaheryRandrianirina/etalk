import { ConversationMessage } from "../../types/conversation";

export default function Bubble({content, isPending}: {content?: ConversationMessage, isPending?: boolean}):JSX.Element {
    return <div className={`bubble ${isPending ? "pending" : ""}`}>{content ? content.texto : ""}</div>
}