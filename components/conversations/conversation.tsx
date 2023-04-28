import Image from "next/image"
import ProfilPic from "../../public/20200823_120127_0.jpg"
import Link from "next/link"

export default function Conversation({currentUser}: {
    currentUser: User
}): JSX.Element {
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