import Image from "next/image"
import profilePic from "../../public/20200823_120127_0.jpg"

export default function SearchResult(): JSX.Element {
    return <div className="search_result">
        <Image src={profilePic} alt="profile picture of searched person" className="profile_pic"/>
        <p className="username">Mahery San</p>
        <div className="status_online"></div>
    </div>
}