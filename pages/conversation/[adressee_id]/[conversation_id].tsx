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
    useContext, 
    useEffect, 
    useMemo, 
    useState } from "react"
import { ChosenReceiver, ConversationMessage, SetMessage } from "../../../types/conversation"
import Data from "../../../lib/data"
import axios, { AxiosError } from "axios"
import { Join } from "../../../types/Database"
import { CustomMessage } from "../../../types/ably"
import { useChannel } from "ably/react"
import { useCallAblyApi } from "../../../components/hooks"
import { RequestWithSession } from "../../../types/session"
import { NextResponse } from "next/server"


export type BlockUser = {
    success: boolean,
    error: Error | null
}

export default function UserConversation({create, user, setCreateConversation, animation, setBackwarded}: {
    create?: true,
    user: User,
    setCreateConversation?: Dispatch<SetStateAction<boolean>>,
    animation?: {className: string, set: Dispatch<SetStateAction<{receptionBox: string, conversation: string}>>},
    setBackwarded: Dispatch<SetStateAction<boolean>>
}): JSX.Element {
    const router = useRouter()

    const ids = useMemo(()=>{
        return {
            adressee_id: parseInt(router.query.adressee_id as string),
            conversation_id: parseInt(router.query.conversation_id as string)
        }
    }, [router]);

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
    ] = useState({success: false, error: null} as BlockUser);

    const [calledAblyApi, setCalledAblyApi] = useCallAblyApi();

    const {channel} = useChannel('chat_room', ()=>{
        console.log('use chat_room channel')
    });

    useEffect(()=>{
        document.title = "Conversation"
        
        const userConversation = document.querySelector('.user_conversation') as HTMLDivElement
        userConversation.offsetWidth
        
        const handleAblyConnection = async()=>{
            if(!calledAblyApi){
                try {
                    await axios.get("/api/ably");
                    setCalledAblyApi(true);
                }catch(e){
                    console.error(e);
                }
            }
            
            if(channel === null){
                return;
            }

            if(adressee && adressee.id){
                channel.publish("get_conversation_messages", JSON.stringify({
                    conversation_id: ids.conversation_id, 
                    adressee_id: adressee.id
                }));
    
                channel.subscribe('conversation_messages', (message: CustomMessage<ConversationMessage[]>) => {
                    setShowMessageIntoBubble(true)
                    setConversationMessages(message.data)
                });
            }
    
            channel.subscribe('conversation_messages_error', (error)=>{
                document.location.href = "/404"
            });
        }

        handleAblyConnection();
        
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
           
    }, [
        create, 
        disableButton, 
        adressee, 
        ids,
        chosenReceivers, 
        message, 
        blockUser,
        channel,
        calledAblyApi,
        setCalledAblyApi
    ]);


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
            channel?.publish("message", JSON.stringify({
                conversation_id: ids.conversation_id,
                message: message, 
                adressee_id: ids.adressee_id
            }))

            channel?.subscribe('conversation_messages', (message)=>{
                setShowMessageIntoBubble(true)

                setConversationMessages(message.data)

                setMessage(m => {
                    return {...m, texto: ""}
                })
            })
        }
    }

    const handleBackward: MouseEventHandler<SVGElement> = useCallback((e: SyntheticEvent)=>{
        e.preventDefault()
        
        if(create && setCreateConversation){
            setAnimate(false)
            setBackwarded(true)
            //setCreateConversation(false)
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

export async function getseServerSideProps({req, res}:{req:RequestWithSession, res: NextResponse}){
    const user = req.session?.user

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
}