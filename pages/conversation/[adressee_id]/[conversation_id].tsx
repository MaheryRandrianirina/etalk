import { useRouter } from "next/router"
import ConversationHeader from "../../../components/conversations/header"
import ConversationFooter from "../../../components/conversations/footer"
import Content from "../../../components/conversations/content"
import { AuthUser, User } from "../../../types/user"
import { Dispatch, 
    FormEvent, 
    MouseEventHandler, 
    SetStateAction, 
    SyntheticEvent, 
    TransitionEvent, 
    TransitionEventHandler, 
    useCallback, 
    useEffect, 
    useState } from "react"
import { ChosenReceiver, ConversationMessage, SetMessage } from "../../../types/conversation"
import Data from "../../../lib/data"
import { withSessionSsr } from "../../../backend/utilities/withSession"
import { AppSocketState } from "../../../types/utils"
import {io} from "socket.io-client"
import axios, { AxiosError } from "axios"
import { Join } from "../../../types/Database"


export type BlockUser = {
    success: boolean,
    error: Error | null
}

let socket: AppSocketState

export default function UserConversation({create, user, setCreateConversation, animation, setBackwarded}: {
    create?: true,
    user: User,
    setCreateConversation?: Dispatch<SetStateAction<boolean>>,
    animation?: {className: string, set: Dispatch<SetStateAction<{receptionBox: string, conversation: string}>>},
    setBackwarded: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    const router = useRouter()

    const ids = {
        adressee_id: parseInt(router.query.adressee_id as string),
        conversation_id: parseInt(router.query.conversation_id as string)
    }

    const [chosenReceivers, setChosenReceivers]: [
        chosenReceivers: ChosenReceiver[], 
        setChosenReceivers: Dispatch<SetStateAction<ChosenReceiver[]>>
    ] = useState([] as ChosenReceiver[])

    const [message, setMessage]: [
        message: ConversationMessage | null,
        setMessage: SetMessage<undefined>
    ] = useState(null as ConversationMessage | null)

    const [conversationMessages, setConversationMessages]:[
        conversationMessages: ConversationMessage[], 
        setConversationMessages: Dispatch<SetStateAction<ConversationMessage[]>>
    ] = useState([] as ConversationMessage[])

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

    const [userFromRouter, setUserFromRouter]: [
        userFromRouter: AuthUser | null,
        setUserFromRouter: Dispatch<SetStateAction<AuthUser | null>>
    ] = useState(null as AuthUser | null)

    const [adressee, setAdressee]: [
        adressee: Join<AuthUser, {blocked: boolean}> | null,
        setAdresse: Dispatch<SetStateAction<Join<AuthUser, {blocked: boolean}> | null>>
    ] = useState(null as Join<AuthUser, {blocked: boolean}> | null)

    
    const [blockUser, setBlockUser]: [
        blockUser: BlockUser, 
        setBlockUser: Dispatch<SetStateAction<BlockUser>>
    ] = useState({success: false, error: null} as BlockUser)

    useEffect(()=>{
        document.title = "Conversation"
        
        const userConversation = document.querySelector('.user_conversation') as HTMLDivElement
        userConversation.offsetWidth
        
        if(create){
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
        }else {
            handleSocket()

            axios.get(`/api/user/conversation/${ids.conversation_id}?adressee_id=${ids.adressee_id}`).then(res => {
                
                if(res.statusText === "OK"){
                    setAdressee(res.data.adressee)
                }
            }).catch(e => {
                const error = e as AxiosError<{success: boolean, message?: string}>
                const errorData = error.response && error.response.data
                if(errorData && !errorData.success && errorData.message){
                    document.location.href = "/404"
                }
            })

            if(!message){
                return
            }

            if(message.texto && 
                message.texto.length > 0 && 
                disableButton
            ){
                setDisableButton(false)
            }else if(message.texto &&
                message.texto.length === 0 &&
                !disableButton
            ){
                setDisableButton(true)
            }
        }
           
    }, [chosenReceivers, message])

    const handleSocket = async()=>{
        await axios.get("/api/socket")

        socket = io()

        socket.on('connect', () => {
            console.log("socket connected")
        })
        
        socket.emit("get_conversation_messages", ids.conversation_id, ids.adressee_id)

        socket.on('conversation_messages', (messages) => {
            setShowMessageIntoBubble(true)
            setConversationMessages(messages)
        })

        socket.on('conversation_messages_error', (error)=>{
            document.location.href = "/404"
        })
    }

    const handleSubmitForm: MouseEventHandler<HTMLButtonElement> = (e:FormEvent<HTMLButtonElement>)=>{
        e.preventDefault()

        const data = new Data()

        if(create && chosenReceivers.length > 0 && message){
            chosenReceivers.forEach(chosenReceiver => {
                data.post(`/api/user/conversation/message/${chosenReceiver.id}`, message).then(res => {
                    setShowMessageIntoBubble(true)
                }).catch(e => {
                    console.error(e)
                })
            })
            
        }else if(!create && message){
            socket?.emit("message", ids.conversation_id, {message: message, adressee_id: ids.adressee_id})

            socket?.on('conversation_messages', (messages)=>{
                setShowMessageIntoBubble(true)
                setConversationMessages(messages)
            })
        }
    }

    const handleBackward: MouseEventHandler<SVGElement> = useCallback((e: SyntheticEvent)=>{
        e.preventDefault()
        
        if(create && setCreateConversation){
            setAnimate(false)
            setBackwarded(true)
            console.log('back', animate, create, animation)
            //setCreateConversation(false)
        }else {
            document.location.href = "/"
        }

    }, [animate])

    const handleTransitionend: TransitionEventHandler<HTMLDivElement> = (e:TransitionEvent)=>{
        e.preventDefault()

        if(typeof setCreateConversation !== "undefined" 
            && animate === false
            && animation
        ){
            animation.set(a => {
                return {...a, receptionBox: ""}
            })
            
            setCreateConversation(cc => cc === true ? false : cc)
        }
    }
    
    return <div className={"user_conversation " + (blockUser.success || adressee?.blocked ? "blocked " : "") + (animate && animation ? animation.className : (!animate && animation ? "" : "flip"))} onTransitionEnd={handleTransitionend}>
        <ConversationHeader blockUser={{
            state: blockUser,
            set: setBlockUser
        }} user={user} handleBackward={handleBackward} addReceiver={create} adressee={adressee ? adressee : undefined} 
            chosenReceivers={chosenReceivers} setChosenReceivers={setChosenReceivers}
            conversation_id={ids.conversation_id}
        />

        <Content showIntoBubble={showMessageIntoBubble} messages={create && message ? [message] : conversationMessages} user={user}/>
        
        <ConversationFooter blockedAdressee={blockUser.success ? blockUser.success : (adressee ? adressee.blocked : false)} sender_id={user.id} disableButton={disableButton} 
            submitForm={handleSubmitForm} message={message} 
            setMessage={setMessage}
        />
    </div>
}

export const getServerSideProps = withSessionSsr(async function getServerSideProps({req, res}){
    const {user} = req.session

    if(!user){
        return {
            redirect: {
                permanent: false,
                destination: "/login",
                basePath: false
              }
        }
    }

    return {
        props: {
            user: user
        }
    }
})