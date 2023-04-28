import { TextareaAttributes, TextareaEvents } from "../../types/textarea";

export default function MessageTextarea({attributes, events}: {attributes: TextareaAttributes, events: TextareaEvents}): JSX.Element {
    return <textarea name={attributes.name} className={attributes.className} onChange={events.onChange} value={attributes.value}></textarea>
}