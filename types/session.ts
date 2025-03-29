import { IronSession } from "iron-session";
import { AuthUser } from "./user";
import { NextRequest } from "next/server";

type SessionData = {
    user?: AuthUser,
    userId?: number
}

export type {
    SessionData
}
