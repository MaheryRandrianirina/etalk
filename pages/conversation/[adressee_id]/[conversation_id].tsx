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
import { CustomMessage } from "@/types/ably"
import { useChannel, useConnectionStateListener } from "ably/react"
import type { NextApiRequest, NextApiResponse } from "next"
import { getSession } from "@/lib/index"


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
    const [blockUser, setBlockUser] = useState<BlockUser>({success: false, error: null} as BlockUser);
    const [connectedToAbly, setConnectedToAbly] = useState(create) // following value of create prop because it doen't load when user click on the create conversation button

    useConnectionStateListener('connected', () => console.log('Connected to Ably!'));
    const {channel, ably} = useChannel('chat_room');

    const chosenReceiversLength = chosenReceivers.length
    const texto = message?.texto
    const connectionState = ably.connection.state;

    useEffect(()=>{
        document.title = "Conversation"
        
        
        const userConversation = document.querySelector('.user_conversation') as HTMLDivElement
        userConversation.offsetWidth
        
        const handleAblyConnection = ()=>{
            if (!connectedToAbly) {
                axios.get(`/api/ably`).catch(console.error)

                setConnectedToAbly(true)

                return
            }

            if(adressee_id){
                channel.publish("get_conversation_messages", JSON.stringify({
                    conversation_id: conversation_id, 
                    adressee_id: adressee_id
                }));
                console.log("mess")
                channel.subscribe('conversation_messages', (message: CustomMessage<ConversationMessage[]>) => {
                    setShowMessageIntoBubble(true)
                    setConversationMessages(message.data)
                });
            }
    
            channel.subscribe('conversation_messages_error', (error)=>{
                document.location.href = "/404"
            });
        }

        handleAblyConnection()

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
         
        return () => channel.unsubscribe()
    }, [
        disableButton,
        adressee_id,
        chosenReceiversLength, 
        texto,
        connectedToAbly,
        showMessageIntoBubble
    ]);


    const handleSubmitForm: MouseEventHandler<HTMLButtonElement> = (e:FormEvent<HTMLButtonElement>)=>{
        e.preventDefault()
        
        if(create && chosenReceivers.length > 0 && message){
            chosenReceivers.forEach(chosenReceiver => {
                axios.post(`/api/user/conversation/message/${chosenReceiver.id}`, message).then(res => {
                    setShowMessageIntoBubble(true)
                }).catch(e => {
                    console.error(e)
                })
            })
            
        }else if(!create && message){
            channel?.publish("message", {
                conversation_id: conversation_id,
                message: message, 
                adressee_id: adressee_id
            })

            setMessage(m => {
                return {...m, texto: ""}
            })
        }
    }

    const handleBackward: MouseEventHandler<SVGElement> = useCallback((e: SyntheticEvent)=>{
        e.preventDefault()
        
        if(create && setCreateConversation){
            setAnimate(false)
            setBackwarded(true)
        }else {
            document.location.href = "/"
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
        <ConversationHeader blockUser={{
            state: blockUser,
            set: setBlockUser
        }} user={user} handleBackward={handleBackward} addReceiver={create} adressee={adressee ? adressee : undefined} 
            chosenReceivers={chosenReceivers} setChosenReceivers={setChosenReceivers}
        />

        <Content showIntoBubble={showMessageIntoBubble} messages={create && message ? [message] : conversationMessages} user={user}/>
        
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