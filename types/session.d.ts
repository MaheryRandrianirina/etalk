import * as IronSession from "iron-session"

declare module "iron-session" {
    interface IronSessionData {
        user?: {
            id: number,
            name: string,
            firstname: string,
            username: string,
            sex: 'man' | 'woman',
            is_online: boolean,
            image: string
        };
        userId?: number
    }
}