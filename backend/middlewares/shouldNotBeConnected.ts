import { getSession } from "@/lib";
import { NextResponse, type NextRequest } from "next/server";

export async function shouldNotBeConnected(req: NextRequest) {
    const res = new NextResponse();
    const session = await getSession(req, res);
    
    if (session.user && req.method?.toLocaleLowerCase() === "get") {
        return NextResponse.redirect(new URL("/", req.url));
    }

    return NextResponse.next();
}