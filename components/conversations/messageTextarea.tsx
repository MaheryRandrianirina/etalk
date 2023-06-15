import { TextareaAttributes, TextareaEvents } from "../../types/textarea";

export default function MessageTextarea({attributes, events, disabled}: 
    {
        attributes: TextareaAttributes, 
        events: TextareaEvents,
        disabled?: true
}): JSX.Element {
    return <textarea name={attributes.name} className={attributes.className} 
        onChange={events.onChange} value={attributes.value} disabled={disabled}
    ></textarea>
}