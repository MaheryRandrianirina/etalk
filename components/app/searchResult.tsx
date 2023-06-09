import Image from "next/image"
import { GetAway } from "../../types/utils"
import { User } from "../../types/user"
import { MouseEventHandler, SyntheticEvent } from "react"
import { SearchResultHandler } from "../../types/input"

export default function SearchResult({user, clickResultHandler, choseReceiver}: {
    user: GetAway<User, "password">,
    clickResultHandler: SearchResultHandler,
    choseReceiver?: true
}): JSX.Element {
    
    const handleClickResult: MouseEventHandler<HTMLDivElement> = (e: SyntheticEvent)=>{
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
            : <svg viewBox="0 0 512 512" className="no_profile_pic">
                <path d="M256 288c79.5 0 144-64.5 144-144S335.5 0 256 0 112 64.5 112 144s64.5 144 144 144zm128 32h-55.1c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16H128C57.3 320 0 377.3 0 448v16c0 26.5 21.5 48 48 48h416c26.5 0 48-21.5 48-48v-16c0-70.7-57.3-128-128-128z"/>
            </svg>
        }
        
        <p className="username">{user.username}</p>
        {user.is_online && <div className="status_online"></div>}
    </div>
}