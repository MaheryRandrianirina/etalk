import { IronSession } from "iron-session";
import { AuthUser } from "./user";
import { NextRequest } from "next/server";

type SessionData = {
    user?: AuthUser,
    userId?: number,
    registrationStepOneData: {
        name: string,
        firstname: string,
        username: string,
        sex: "man"|"woman"
    }
}

export type {
    SessionData
}
