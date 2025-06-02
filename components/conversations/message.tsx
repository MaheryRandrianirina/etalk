import { Dispatch, SetStateAction, type TouchEvent, useEffect, useState } from "react";
import { DateHelper } from "@/lib/index";
import { ConversationMessage } from "../../types/conversation";
import { MessageType } from "../../types/messageType";
import Bubble from "./bubble";
import useClassnameAnimator from "../../hooks/useClassnameAnimator";
import { MessageMenu } from "../molecules/menu";

const touchDurationMs = 2000

export default function Message({type, className, content, clickBody, setClickBody}: {
  type: MessageType, 
  content: ConversationMessage,
  className?: string,
  clickBody: boolean,
  setClickBody: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
  const {classnameForAnimation, setClassnameForAnimation} = useClassnameAnimator("")
  const [showMenu, setShowMenu] = useState(false)
  const [touchEnd, setTouchEnd] = useState(false)

  useEffect(() => {
    if(className){
      setClassnameForAnimation(className)
    }

    if(clickBody) {
      if(showMenu) setShowMenu(false)
    }

    return () => setClickBody(false)
  }, [showMenu, clickBody])
  
  const showMessageMenu = (e: React.MouseEvent<HTMLDivElement>|TouchEvent) => {
    if(e.type === "touchstart") {
      setTimeout(()=>{
        if(!touchEnd && !showMenu) { setShowMenu(true) }
      }, touchDurationMs)
    }else {
      e.preventDefault()
      if (!showMenu) { setShowMenu(true) }
    }    
  }

  const handleTouchEnd = ()=>{
    setTouchEnd(true)
  }

  return <div className={"message " + type + " " + classnameForAnimation} onTouchStart={showMessageMenu} onTouchEnd={handleTouchEnd} onContextMenu={showMessageMenu}>
      <Bubble content={className ? content : undefined} isPending={content.pending}/>  
      <div className="datetime">
        {content.created_at ? `${(new DateHelper()).format(content.created_at)}` : ""}
      </div>
      { content.pending && <p className="is-pending">envoi...</p> }
      { showMenu && <MessageMenu /> }
  </div>
}