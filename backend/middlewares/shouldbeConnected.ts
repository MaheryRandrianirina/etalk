import { getSession } from "@/lib";
import { NextResponse, type NextRequest } from "next/server";

export async function shouldBeConnected(req: NextRequest) {
    const res = NextResponse.next();
    const session = await getSession(req, res);

    if (!session.user) {
        return Response.json(
            { success: false, message: 'You must be logged in to access this page' },
            { status: 204, statusText: 'Unauthenticated' }
          )
    }

    return res;
}