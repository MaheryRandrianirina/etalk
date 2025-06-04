import { getIronSession } from "iron-session";
import { SessionData } from "../../types/session";
import type { NextApiRequest, NextApiResponse } from "next";
import type { NextRequest, NextResponse } from "next/server";
import { IncomingMessage } from "http";

const sessionOptions = {
    password: process.env.COOKIE_PASSWORD !== undefined ? process.env.COOKIE_PASSWORD : "cookie_name",
    cookieName: process.env.COOKIE_NAME !== undefined ? process.env.COOKIE_NAME : "cookie_password",
    
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
};

async function getSession(req: NextApiRequest|NextRequest|IncomingMessage, res: NextApiResponse|NextResponse){
    return await getIronSession<SessionData>(req, res, sessionOptions)
}


export default getSession;