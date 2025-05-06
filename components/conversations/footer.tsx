import { ChangeEvent, ChangeEventHandler, Dispatch, MouseEventHandler, SetStateAction, useEffect } from "react";
import MessageTextarea from "./messageTextarea";
import { ConversationMessage } from "../../types/conversation";
import { formatDate } from "date-fns";

export default function ConversationFooter({submitForm, message, setMessage, disableButton, sender_id, blockedAdressee}: {
    submitForm: MouseEventHandler<HTMLButtonElement>,
    message: ConversationMessage | null,
    setMessage: Dispatch<SetStateAction<ConversationMessage | null>>
    disableButton: boolean,
    sender_id: number,
    blockedAdressee: boolean
}): JSX.Element {

    const handleTextoChange: ChangeEventHandler = (event: ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(m => {
            const message = {texto: event.target.value, created_at: formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss'), sender_id: sender_id, pending: true} as ConversationMessage
            if(m === null){
                return message
            }else {
                return {...m, ...message}
            }
        })
    }

    return <div className="conversation_footer">
        <form action="" method="post">
            <div className="actions_buttons">
                <div className="uploads">
                    <svg viewBox="0 0 384 512" className="add_image_button">
                        <path d="M369.9 97.9L286 14C277 5 264.8-.1 252.1-.1H48C21.5 0 0 21.5 0 48v416c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48V131.9c0-12.7-5.1-25-14.1-34zM332.1 128H256V51.9l76.1 76.1zM48 464V48h160v104c0 13.3 10.7 24 24 24h104v288H48zm32-48h224V288l-23.5-23.5c-4.7-4.7-12.3-4.7-17 0L176 352l-39.5-39.5c-4.7-4.7-12.3-4.7-17 0L80 352v64zm48-240c-26.5 0-48 21.5-48 48s21.5 48 48 48 48-21.5 48-48-21.5-48-48-48z"/>
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="add_file_button">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline>
                        <line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line>
                    </svg>
                </div>
                <div className="peers">
                    <svg viewBox="0 0 352 512" className="microphone_button">
                        <path d="M176 352c53.02 0 96-42.98 96-96V96c0-53.02-42.98-96-96-96S80 42.98 80 96v160c0 53.02 42.98 96 96 96zm160-160h-16c-8.84 0-16 7.16-16 16v48c0 74.8-64.49 134.82-140.79 127.38C96.71 376.89 48 317.11 48 250.3V208c0-8.84-7.16-16-16-16H16c-8.84 0-16 7.16-16 16v40.16c0 89.64 63.97 169.55 152 181.69V464H96c-8.84 0-16 7.16-16 16v16c0 8.84 7.16 16 16 16h160c8.84 0 16-7.16 16-16v-16c0-8.84-7.16-16-16-16h-56v-33.77C285.71 418.47 352 344.9 352 256v-48c0-8.84-7.16-16-16-16z"/>
                    </svg>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="video_call_button">
                        <polygon points="23 7 16 12 23 17 23 7"></polygon>
                        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                    </svg>
                </div>
            </div>
            <MessageTextarea events={{onChange: handleTextoChange}} 
                attributes={{
                    className: "message_textarea", 
                    name: "texto_content", 
                    value: message !== null ? message.texto : ""
                }}
                disabled={blockedAdressee ? blockedAdressee : undefined}
            />
            <button type="submit" className="send_button" disabled={disableButton || blockedAdressee} onClick={submitForm}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={"send_icon " + (disableButton ? "disabled" : "")}>
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
            </button>
        </form>
    </div>
}