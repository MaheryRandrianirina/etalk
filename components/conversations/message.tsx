import { MessageType } from "../../types/messageType";
import Bubble from "./bubble";

export default function Message({type,last}: {type: MessageType, last: boolean}): JSX.Element {
    return <div className="message">
      <Bubble type={type}/>  
      <div className="datetime">
        <p className="day">Lun.</p>
        <div className="time">14:12</div>
        {last && <p className="status"></p> }
      </div>
    </div>
}