import { getSession } from "@/lib";
import { NextResponse, type NextRequest } from "next/server";

export async function shouldBeConnected(req: NextRequest) {
    const res = NextResponse.next();
    const session = await getSession(req, res);
    
    if (!session.user && req.method?.toLocaleLowerCase() === "get") {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    return res;
}