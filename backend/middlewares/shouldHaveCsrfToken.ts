import { getSession } from "@/lib";
import { type NextRequest, NextResponse } from "next/server";

export async function shouldHaveCsrfToken(req: NextRequest, res: NextResponse) {
    const session = await getSession(req, res)
    const expectedToken = session._token
    const _csrf = req.cookies.get("_csrf")
    console.log(expectedToken, _csrf?.value)
    if (!_csrf ||  !expectedToken) {
        return NextResponse.json(
            { success: false, message: 'Token required' },
            { status: 400 }
        )
    }else if(expectedToken !== _csrf.value) {
        req.cookies.delete("_csrf")
        
        return NextResponse.json(
            { success: false, error: 'Invalid token', type:'csrf-error' },
            { status: 403 }
        )
    }

    req.cookies.delete("_csrf")
    res.cookies.delete("_csrf")

    const randomBytes = new Uint8Array(24)
    crypto.getRandomValues(randomBytes)
    const token = btoa(String.fromCharCode(...randomBytes)).replace(/[^a-zA-Z0-9]/g, '').slice(0, 32)
    session._token = token

    await session.save()

    // Use NextResponse's cookies API to set the cookie
    const csrfCookie = `_csrf=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=${60 * 5}`;
    const existingCookies = res.headers.get("Set-Cookie") || "";
    const cookies = existingCookies ? existingCookies.split(",") : [];
    res.headers.set("Set-Cookie", [...cookies, csrfCookie].join(","));

    return res
}