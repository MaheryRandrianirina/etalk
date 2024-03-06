import Conversation from "./conversation"
import { Conversation as userConversation} from "../../types/Database"
import { User } from "../../types/user"

export default function ListConversations({conversations, user}: {
    conversations: userConversation[],
    user: User
}): JSX.Element {
    
    return <div className="list_conversations">
        {conversations.map(conversation => {
            return <Conversation
                conversation={conversation} 
                key={conversation.id} 
                currentUser={user}
            />
        })}
    </div>
}