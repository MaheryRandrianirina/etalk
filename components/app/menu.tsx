import { Dispatch, MouseEvent, MouseEventHandler, SetStateAction, useEffect } from "react"
import CloseIcon from "../icons/closeIcon"
import BackIcon from "../icons/backIcon"

export default function Menu({
    className,
    setShowMenu
}: {
    className: string,
    setShowMenu: Dispatch<SetStateAction<boolean>>
}): JSX.Element {


    const handleClickItem: MouseEventHandler<HTMLLIElement> = (e: MouseEvent) => {
        e.preventDefault()

        const itemClasslist = e.currentTarget.classList
        if(itemClasslist.contains('logout')){
            console.log("logout")
        }
    }

    const handleClickBackFromMenu: MouseEventHandler<SVGElement> = (e:MouseEvent) => {
        e.preventDefault()

        setShowMenu(false)
    }

    return <div className={"menu " + className}>
        <BackIcon onClickBack={handleClickBackFromMenu}/>
        <ul>
            <li className="item user-profile" onClick={handleClickItem}>Profil</li>
            <li className="item logout" onClick={handleClickItem}>Déconnexion</li>
        </ul>
    </div>
}