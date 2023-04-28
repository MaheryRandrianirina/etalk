import ProfilePic from "../profilePic";
import profilePic from "../../public/20200823_120127_0.jpg"

export default function ConversationHeader(): JSX.Element {
    return <div className="conversation_header">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="go_back_button">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
        </svg>
        <div className="adressee">
            <p className="username">Mahery San</p>
            <p className="status_online"></p>
            <ProfilePic imagePath={profilePic}/>
        </div>
    </div>
}