import { type NextRequest, NextResponse } from "next/server";

export async function shouldHaveCsrfToken(req: NextRequest, res: NextResponse) {
    const _token = req.headers.get('X-CSRF-Token')
    if (!_token) {
        return NextResponse.json(
            { success: false, message: 'Token required' },
            { status: 400 }
        )
    }else if(csrfTokenhasExpired() || res.cookies.get("_csrf")?.value !== _token) {
        res.cookies.delete("_csrf")

        return NextResponse.json(
            { success: false, error: 'Invalid token' },
            { status: 403 }
        )
    }

    function csrfTokenhasExpired() {
        const csrfToken = res.cookies.get("_csrf")?.value
        if (!csrfToken) {
            return true
        }

        return false;
    }

    return res
}