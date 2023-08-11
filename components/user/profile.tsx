import { FC, MouseEventHandler, TransitionEventHandler, memo, useEffect } from "react";
import useClassnameAnimator from "../../lib/hooks/useClassnameAnimator";
import CloseIcon from "../icons/closeIcon";
import { AuthUser } from "../../types/user";
import { UserIcon } from "../icons/UserIcon";
import ProfilePic from "../profilePic";
import { SecondaryButton } from "../widgets/button";
import { Join } from "../../types/Database";

const Profile: FC<{
    adressee: Join<AuthUser, {blocked: boolean}>,
    blockUserSuccess: boolean,
    transitionendHandler: TransitionEventHandler<HTMLDivElement>,
    className: string,
    onClickCloseButton: MouseEventHandler<SVGElement>
}> = memo(({
    adressee, 
    blockUserSuccess,
    transitionendHandler, 
    className, 
    onClickCloseButton
}): JSX.Element => {
    
    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")

    useEffect(()=>{
        setClassnameForAnimation(className)
    })

    return <div className={"profile " + classnameForAnimation} onTransitionEnd={transitionendHandler} onClick={e => e.stopPropagation()}>
        <CloseIcon onClick={onClickCloseButton}/>
        
        {adressee.image ? <ProfilePic imagePath={adressee.image}/> : <div className='profile_pic'>
            <UserIcon/>
        </div>}
        <div className="infos_container">
            <div className="infos">
                <div className="name">
                    <span className="key">Nom : </span><span className="value">{adressee.name}</span>
                </div>
                <div className="firstname">
                    <span className="key">Prénom : </span><span className="value">{adressee.firstname}</span>
                </div>
                <div className="username">
                    <span className="key">Pseudo : </span><span className="value">{adressee.username}</span>
                </div>
                <div className="sex">
                    <span className="key">Sexe : </span><span className="value">{adressee.sex === "man" ? "Homme" : "Femme"}</span>
                </div>
                <div className="mail">
                    <span className="key">Adresse mail : </span><span className="value">{adressee.email}</span>
                </div>
                <SecondaryButton>{ adressee.blocked ? "Débloquer cette personne" : "Bloquer cette personne"}</SecondaryButton>
            </div>
            
        </div>
    </div>
})

export default Profile