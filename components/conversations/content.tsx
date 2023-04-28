import Message from "./message";

export default function Content():JSX.Element {
    return <div className="conversation_content">
        <Message type="incoming"/>
        <Message type="outgoing"/>
    </div>
}