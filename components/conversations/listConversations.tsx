import { MouseEventHandler, useContext, useEffect } from "react"
import Conversation from "./conversation"
import { Conversation as userConversation} from "../../types/Database"
import { User } from "../../types/user"
import { SocketContext } from "../../pages"

export default function ListConversations({conversations, user}: {
    conversations: userConversation[],
    user: User
}): JSX.Element {

    const socket = useContext(SocketContext)
    
    return <div className="list_conversations">
        {conversations.map(conversation => {
            return <Conversation socket={socket} 
                conversation={conversation} 
                key={conversation.id} 
                currentUser={user}
            />
        })}
    </div>
}