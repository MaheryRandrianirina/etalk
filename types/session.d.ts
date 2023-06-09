import * as IronSession from "iron-session"
import { AuthUser } from "./user";

declare module "iron-session" {
    interface IronSessionData {
        user?: AuthUser;
        userId?: number
    }
}