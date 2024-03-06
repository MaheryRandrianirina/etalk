import { Types } from "ably";
import { Context, createContext } from "react";

const AblyChannelContext: Context<Types.RealtimeChannelPromise|null> = createContext<Types.RealtimeChannelPromise|null>(null)

export { AblyChannelContext }