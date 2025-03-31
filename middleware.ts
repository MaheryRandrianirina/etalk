import { getIronSession } from "iron-session";
import { MiddlewareConfig, NextResponse } from "next/server";
import { RequestWithSession, SessionData } from "./types/session";



export async function middleware(request: RequestWithSession) {
    const sessionOptions = {
        password: process.env.COOKIE_PASSWORD !== undefined ? process.env.COOKIE_PASSWORD : "cookie_name",
        cookieName: process.env.COOKIE_NAME !== undefined ? process.env.COOKIE_NAME : "cookie_password",
        
        cookieOptions: {
          secure: process.env.NODE_ENV === "production",
        },
    };
    const session = await getIronSession<SessionData>(request, NextResponse.next(), sessionOptions);
    request.session = session;

    return NextResponse.next({
        request
    });
}

export const config: MiddlewareConfig = {
    
}