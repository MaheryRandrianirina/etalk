import { getSession } from "@/lib";
import { type NextRequest, NextResponse } from "next/server";

export async function shouldHaveCsrfToken(req: NextRequest, res: NextResponse) {
    const session = await getSession(req, res)
    const expectedToken = session._csrf
    const _token = req.cookies.get("_csrf")
    console.log("expectedToken", session, _token)
    if (!_token ||  !expectedToken) {
        return NextResponse.json(
            { success: false, message: 'Token required' },
            { status: 400 }
        )
    }else if(expectedToken !== _token.value) {
        res.cookies.delete("_csrf")

        return NextResponse.json(
            { success: false, error: 'Invalid token', type:'csrf-error' },
            { status: 403 }
        )
    }

    return res
}