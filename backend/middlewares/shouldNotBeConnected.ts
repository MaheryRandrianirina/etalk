import { getSession } from "@/lib";
import { NextResponse, type NextRequest } from "next/server";

export async function shouldNotBeConnected(req: NextRequest) {
    const res = new NextResponse();
    const session = await getSession(req, res);
    
    if (session.user) {
        return NextResponse.rewrite(new URL("/", req.url));
    }

    return NextResponse.next();
}