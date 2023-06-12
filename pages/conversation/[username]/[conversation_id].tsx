import { useRouter } from "next/router"
import ConversationHeader from "../../../components/conversations/header"
import ConversationFooter from "../../../components/conversations/footer"
import Content from "../../../components/conversations/content"
import { User } from "../../../types/user"
import { Dispatch, FormEvent, FormEventHandler, MouseEventHandler, SetStateAction, SyntheticEvent, TransitionEvent, TransitionEventHandler, useCallback, useEffect, useState } from "react"
import { ChosenReceiver, ConversationMessage, SetMessage } from "../../../types/conversation"
import Data from "../../../lib/data"

export default function UserConversation({create, user, setCreateConversation, animation, setBackwarded}: {
    create?: true,
    user: User,
    setCreateConversation?: Dispatch<SetStateAction<boolean>>,
    animation: {className: string, set: Dispatch<SetStateAction<{receptionBox: string, conversation: string}>>},
    setBackwarded: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    const router = useRouter()

    const [chosenReceivers, setChosenReceivers]: [
        chosenReceivers: ChosenReceiver[], 
        setChosenReceivers: Dispatch<SetStateAction<ChosenReceiver[]>>
    ] = useState([] as ChosenReceiver[])

    const [message, setMessage]: [
        message: ConversationMessage | null,
        setMessage: SetMessage<undefined>
    ] = useState(null as ConversationMessage | null)

    const [showMessageIntoBubble, setShowMessageIntoBubble]:[
        showMessageIntoBubble: boolean,
        setShowMessageIntoBubble: Dispatch<SetStateAction<boolean>>
    ] = useState(false)

    const [disableButton, setDisableButton]: [
        disableButton: boolean,
        setDisableButton: Dispatch<SetStateAction<boolean>>
    ] = useState(true)

    const [animate, setAnimate]: [
        animate: boolean,
        setAnimate: Dispatch<SetStateAction<boolean>>
    ] = useState(false)

    useEffect(()=>{
        document.title = "Conversation"

        const userConversation = document.querySelector('.user_conversation') as HTMLDivElement
        userConversation.offsetWidth

        setAnimate(true)

        if(message === null){
            return
        }
        
        if((message.texto !== undefined 
            && message.texto.length > 0 )
            && chosenReceivers.length > 0
            && disableButton
        ){
            setDisableButton(false)
        }else if((message.texto !== undefined 
            && message.texto.length === 0
            && !disableButton) || chosenReceivers.length === 0
        ){
            setDisableButton(true)
        }
    }, [chosenReceivers, message])

    const handleSubmitForm: FormEventHandler<HTMLFormElement> = (e:FormEvent<HTMLFormElement>)=>{
        e.preventDefault()

        if(create && chosenReceivers.length > 0 && message !== null){
            const data = new Data()

            chosenReceivers.forEach(chosenReceiver => {
                data.post(`/api/user/conversation/message/${chosenReceiver.id}`, message).then(res => {
                    setShowMessageIntoBubble(true)
                }).catch(e => {
                    console.error(e)
                })
            })
            
        }else if(!create){

        }
    }

    const handleBackward: MouseEventHandler<SVGElement> = useCallback((e: SyntheticEvent)=>{
        e.preventDefault()

        setAnimate(false)
        setBackwarded(true)
    }, [animate])

    const handleTransitionend: TransitionEventHandler<HTMLDivElement> = (e:TransitionEvent)=>{
        e.preventDefault()

        if(typeof setCreateConversation !== "undefined" && animate === false){
            
            animation.set(a => {
                return {...a, receptionBox: ""}
            })
            
            setCreateConversation(cc => cc === true ? false : cc)
        }
    }

    return <div className={"user_conversation " + (animate ? animation.className : "")} onTransitionEnd={handleTransitionend}>
        <ConversationHeader handleBackward={handleBackward} addReceiver={create} user={user} 
            chosenReceivers={chosenReceivers} setChosenReceivers={setChosenReceivers}
        />
        <Content showIntoBubble={showMessageIntoBubble} messages={message !== null ? [message] : []} user={user}/>
        <ConversationFooter sender_id={user.id} disableButton={disableButton} 
            submitForm={handleSubmitForm} message={message} 
            setMessage={setMessage}
        />
    </div>
}