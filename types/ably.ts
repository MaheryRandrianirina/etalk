import { Types } from "ably";

export interface CustomMessage<T extends unknown> extends Types.Message {
    data: T;
}