import { IronSession } from "iron-session";
import { AuthUser } from "./user";
import { NextRequest } from "next/server";

type SessionData = {
    user?: AuthUser,
    userId?: number
}

interface RequestWithSession extends NextRequest {
    session?: IronSession<SessionData>
    body: any
    
}

export type {
    SessionData,
    RequestWithSession
}
