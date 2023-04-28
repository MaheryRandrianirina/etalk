import { MessageType } from "../../types/messageType";

export default function Bubble({type}: {type: MessageType}):JSX.Element {
    return <div className={"bubble " + type}>salut mec</div>
}