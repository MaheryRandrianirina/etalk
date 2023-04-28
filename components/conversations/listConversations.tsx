import { MouseEventHandler } from "react"
import Conversation from "./conversation"

export default function ListConversations(): JSX.Element {
    const user: User = {
        id: 1,
        name: "RANDRIANIRINA",
        firstname: "Mahery",
        username: "mahery san",
        password: "password",
        sex: "man",
        image: "image.png",
        email: "mahery@gmail.com",
        created_at: new Date(),
        updated_at: new Date(),
        is_online: true,
        remember_token: "token"
    }
    return <div className="list_conversations">
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
        <Conversation currentUser={user}/>
    </div>
}