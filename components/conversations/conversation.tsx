import Image from "next/image"
import ProfilPic from "../../public/20200823_120127_0.jpg"
import Link from "next/link"
import { User } from "../../types/user"
import { useEffect } from "react"
import axios from "axios"
import { Conversation as UserConversation } from "../../types/Database"

export default function Conversation({currentUser, conversation}: {
    currentUser: User,
    conversation: UserConversation
}): JSX.Element {

    useEffect(()=>{
        console.log(conversation)
        try {
            axios.get(`/api/user/conversation/${conversation.id}`).then(res => {
                if(res.statusText === "OK"){

                }
            })
        }catch(e){
            console.error(e)
        }
        
    })

    return <Link href={{
        pathname: "/conversation/[username]/[conversation_id]",
        query: { username: currentUser.username, conversation_id: currentUser.id}
    }}>
        <div className="conversation">
            <div className="adressee">
                <Image src={ProfilPic} alt="profile pic" className="profile_pic"/>
                <p className="username">Yami San</p>
            </div>
            <div className="last_message">
                <span className="sender">Vous :</span><span className="content"> Salut</span>
            </div>
            <div className="datetime">10:01</div>
        </div>
    </Link>
}