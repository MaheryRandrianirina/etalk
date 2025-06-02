import { Dispatch, MouseEvent, MouseEventHandler, SetStateAction, TransitionEvent, TransitionEventHandler, useCallback, useEffect, useState } from "react"
import BackIcon from "../atoms/icons/backIcon"
import { ModalData } from "../../types/modal"
import { createPortal } from "react-dom"
import { ButtonContext } from "../contexts/ButtonContext"
import ConfirmationModal from "./modals/confirmationModal"
import useClassnameAnimator from "../../hooks/useClassnameAnimator"
import axios from "axios"
import msgStyle from "@/styles/sass/modules/messageMenu.module.scss"

export default function Menu({
    className,
    setShowMenu
}: {
    className: string,
    setShowMenu: Dispatch<SetStateAction<boolean>>
}): JSX.Element {

    const [modal, setModal]: [
        modal: ModalData<"confirmation">,
        setModal: Dispatch<SetStateAction<ModalData<"confirmation">>>
    ] = useState({
        show: false, 
        type: "confirmation", 
        data: "", 
        className: ""
    } as ModalData<"confirmation">)

    const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator('')

    const handleBodyClick = useCallback(()=>{
        document.body.addEventListener('click', (e) => {
          e.preventDefault()
    
          if (classnameForAnimation.length > 0) {
            setClassnameForAnimation("")
          }
        })
      }, [classnameForAnimation, setClassnameForAnimation])

    useEffect(() => {
        handleBodyClick()
    }, [classnameForAnimation, handleBodyClick])


    const handleClickItem: MouseEventHandler<HTMLLIElement> = (e: MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const itemClasslist = e.currentTarget.classList
        if(itemClasslist.contains('logout')){
            setModal({
                show: true, 
                type: "confirmation", 
                data: `Vous êtes sûr de vouloir vous déconnecter ?`,
                className: "logout_modal"
            });

            setClassnameForAnimation('visible');
        }
    }

    const handleClickBackFromMenu: MouseEventHandler<SVGElement> = (e:MouseEvent) => {
        e.preventDefault()

        setShowMenu(false)
    }

    const handleClickModalButtons: MouseEventHandler<HTMLButtonElement> = useCallback(async (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        
        switch(modal.type) {
          case "confirmation":
            if(e.currentTarget.classList.contains('ok')){
                try {
                    const res = await axios.post("/api/logout")
                    
                    if(res.data.success){
                        document.location.reload()
                    }

                }catch(e){
                    console.error(e)
                }
                
            }else {
                setClassnameForAnimation("")
            }
    
            break
        }
    }, [modal.type, setClassnameForAnimation])

    const handleModalTransitionend: TransitionEventHandler = (e:TransitionEvent) => {
        e.preventDefault()
        
        if(classnameForAnimation.length === 0){
            setModal(m => {
                return {...m, show: false}
            })
        }
    }

    const handleClickCloseButton: MouseEventHandler<SVGElement> = (e: MouseEvent) => {
        e.preventDefault()

        setClassnameForAnimation('')
    }

    return <div className={"menu " + className}>
        <BackIcon onClickBack={handleClickBackFromMenu}/>
        <ul>
            <li className="item user-profile" onClick={handleClickItem}>Profil</li>
            <li className="item logout" onClick={handleClickItem}>Déconnexion</li>
        </ul>
        
        {(modal.show && modal.type === "confirmation") && 
          createPortal(
          <ButtonContext.Provider value={handleClickModalButtons}>
            <ConfirmationModal transitionendHandler={handleModalTransitionend} 
              className={ (modal.className ? modal.className + " " : " ") + classnameForAnimation } data={modal.data}
              onClickCloseButton={handleClickCloseButton}
            />
          </ButtonContext.Provider>, 
          document.querySelector('main') as HTMLElement)
        }
    </div>
}

export const MessageMenu = () => {
    const [visible, setVisible] = useState(false)

    useEffect(()=>{
        setVisible(true)

        return () => setVisible(false)
    }, [])

    return <div className={msgStyle.menu + (visible ? " "+msgStyle.visible : "")}>
        <p>supprimer</p>
    </div>
}