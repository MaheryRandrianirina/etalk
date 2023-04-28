import { useRouter } from "next/router"
import ConversationHeader from "../../../components/conversations/header"
import ConversationFooter from "../../../components/conversations/footer"
import Content from "../../../components/conversations/content"

export default function UserConversation(): JSX.Element {
    const router = useRouter()
    console.log(router)
    return <div className="user_conversation">
        <ConversationHeader/>
        <Content/>
        <ConversationFooter/>
    </div>
}