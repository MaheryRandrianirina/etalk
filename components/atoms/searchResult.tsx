import Image from "next/image"
import { GetAway } from "../../types/utils"
import { User } from "../../types/user"
import { MouseEvent, MouseEventHandler, SyntheticEvent } from "react"
import { SearchResultHandler } from "../../types/input"
import { UserIcon } from "../atoms/icons/UserIcon"

export default function SearchResult({user, clickResultHandler, choseReceiver}: {
    user: GetAway<User, ["password"]>,
    clickResultHandler: SearchResultHandler,
    choseReceiver?: true
}): JSX.Element {
    
    const handleClickResult: MouseEventHandler<HTMLDivElement> = (e: MouseEvent)=>{
        if(choseReceiver){
            clickResultHandler(e, {id:user.id, username:user.username})
        }else {
            const handler = clickResultHandler as (e:SyntheticEvent)=>void
            handler(e)
        }
        
    }

    return <div className="search_result" onClick={handleClickResult}>
        {user.image ?
            <Image src={user.image} alt="profile picture of searched person" className="profile_pic"/>
            : <UserIcon/>
        }
        
        <p className="username">{user.username}</p>
        {user.is_online && <div className="status_online"></div>}
    </div>
}