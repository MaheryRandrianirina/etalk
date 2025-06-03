import { getSession } from "@/lib";
import { NextResponse, type NextRequest } from "next/server";

export async function shouldBeConnected(req: NextRequest, res: NextResponse) {
    const session = await getSession(req, res);

    return !session.user ? NextResponse.redirect(new URL("/login", req.url)) : res;
}