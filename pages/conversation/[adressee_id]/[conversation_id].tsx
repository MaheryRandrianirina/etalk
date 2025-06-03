import { useRouter } from "next/router"
import ConversationHeader from "@/components/conversations/header"
import ConversationFooter from "@/components/conversations/footer"
import Content from "@/components/conversations/content"
import { AuthUser, User } from "@/types/user"
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
import { ChosenReceiver, ConversationMessage } from "@/types/conversation"
import axios, { AxiosError } from "axios"
import { Join } from "@/types/Database"
import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "@/lib/index"
import { useConnectionStateListener } from "@/lib/socket"
import { handleCsrfTokenError } from "@/lib/utils/errorHandlers"


export type BlockUser = {
    success: boolean,
    error: Error | null
}

export default function UserConversation({user, create, setCreateConversation, animation, setBackwarded}: {
    create?: true,
    user: User,
    setCreateConversation?: Dispatch<SetStateAction<boolean>>,
    animation?: {className: string, set: Dispatch<SetStateAction<{receptionBox: string, conversation: string}>>},
    setBackwarded: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    const router = useRouter()

    const adressee_id = parseInt(router.query.adressee_id as string)
    const conversation_id = parseInt(router.query.conversation_id as string)

    const [chosenReceivers, setChosenReceivers]: [
        chosenReceivers: ChosenReceiver[], 
        setChosenReceivers: Dispatch<SetStateAction<ChosenReceiver[]>>
    ] = useState([] as ChosenReceiver[])

    const [message, setMessage] = useState<ConversationMessage | null>(null as ConversationMessage | null)
    const [conversationMessages, setConversationMessages] = useState<ConversationMessage[]>([] as ConversationMessage[])
    const [showMessageIntoBubble, setShowMessageIntoBubble] = useState<boolean>(false)
    const [disableButton, setDisableButton] = useState<boolean>(true)
    const [animate, setAnimate] = useState<boolean>(false)
    const [adressee, setAdressee] = useState<Join<AuthUser, {blocked: boolean}> | null>(null as Join<AuthUser, {blocked: boolean}> | null) 
    
    const { socket } = useConnectionStateListener('connect');

    const chosenReceiversLength = chosenReceivers.length;
    const texto = message?.texto;
    const socketIsDefined = socket !== null;

    useEffect(()=>{
        document.title = "Conversation"
        
        const userConversation = document.querySelector('.user_conversation') as HTMLDivElement
        userConversation.offsetWidth

        if(create){
            setAnimate(true)

            if(message === null){
                return
            }

            if((texto
                && texto.length > 0 )
                && chosenReceiversLength > 0
                && disableButton
            ){
                setDisableButton(false)
            }else if((texto
                && texto.length === 0
                && !disableButton) || chosenReceiversLength === 0
            ){
                setDisableButton(true)
            }
        }else { 
            socket?.emit("get_conversation_messages", conversation_id, adressee_id);
    
            socket?.on('conversation_messages', (message: ConversationMessage[]) => {
                setShowMessageIntoBubble(true)
                setConversationMessages(message)
            });

            socket?.on('conversation_messages_error', (error)=>{
                if (error.status === 404) {
                    document.location.href = "/404"
                }
            });
            
            if(!adressee) {
                axios.get(`/api/user/conversation/${conversation_id}?adressee_id=${adressee_id}`).then(res => {
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
            }

            if(!message){
                return
            }

            if(texto && 
                texto.length > 0 && 
                disableButton
            ){
                setDisableButton(false)
            }else if(texto &&
                texto.length === 0 &&
                !disableButton
            ){
                setDisableButton(true)
            }
        }

        return () => {
            socket?.off('conversation_messages')
            socket?.off('conversation_messages_error')
        }
         
    }, [
        create,
        disableButton,
        chosenReceiversLength, 
        texto,
        socketIsDefined,
        showMessageIntoBubble
    ]);


    const handleSubmitForm: MouseEventHandler<HTMLButtonElement> = (e:FormEvent<HTMLButtonElement>)=>{
        e.preventDefault()
        
        if(create && chosenReceivers.length > 0 && message){
            const {pending, ...toSendMessage} = message

            const postMessage = (receiver_id: number)=>{
                return axios.post(`/api/user/conversation/message/${receiver_id}`, toSendMessage).then(res => {
                    setShowMessageIntoBubble(true)
                    setMessage(m => {
                        return {...m, texto: ""}
                    })
                })
            }

            chosenReceivers.forEach(chosenReceiver => {
                postMessage(chosenReceiver.id)
                    .catch(e => {
                        handleCsrfTokenError(e as AxiosError, ()=>{
                            // resend the message with the new updated csrf token
                            postMessage(chosenReceiver.id)
                        })
                    })
            })
            
        }else if(!create && message){
            const {pending, ...toSendMessage} = message
            
            socket?.emit(`message`, conversation_id, {
                message: toSendMessage, 
                adressee_id: adressee_id
            })

            setMessage(m => {
                return {...m, texto: ""}
            })

            setConversationMessages(msg => {
                return [...msg, {id: msg.length, ...message}]
            })
        }
    }

    const handleBackward: MouseEventHandler<SVGElement> = useCallback((e: SyntheticEvent)=>{
        e.preventDefault()
        
        if(create && setCreateConversation){
            setAnimate(false)
            setBackwarded(true)
        }else {
            window.history.back();
        }

    }, [setAnimate, setBackwarded, create, setCreateConversation])

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
    
    return <div className={"user_conversation " + (adressee?.blocked ? "blocked " : "") + (animate && animation ? animation.className : (!animate && animation ? "" : "flip"))} onTransitionEnd={handleTransitionend}>
        <ConversationHeader setAdressee={setAdressee} user={user} handleBackward={handleBackward} addReceiver={create} adressee={adressee ? adressee : undefined} 
            chosenReceivers={chosenReceivers} setChosenReceivers={setChosenReceivers}
        />

        <Content setConversationMessages={setConversationMessages} showIntoBubble={showMessageIntoBubble} messages={create && message ? [message] : conversationMessages} user={user}/>
        
        <ConversationFooter blockedAdressee={ adressee ? adressee.blocked : false } sender_id={user.id} disableButton={disableButton} 
            submitForm={handleSubmitForm} message={message} 
            setMessage={setMessage}
        />
    </div>
}

export async function getServerSideProps({req, res}:{req:NextApiRequest, res: NextApiResponse}){
    const session = await getSession(req, res);
    const user = session.user;
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
            user
        }
    }
}