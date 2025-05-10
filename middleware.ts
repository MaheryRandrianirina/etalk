import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { Routes } from "./types/enums/routes";
import { shouldBeConnected } from "./backend/middlewares/shouldbeConnected";
import { shouldNotBeConnected } from "./backend/middlewares/shouldNotBeConnected";


export async function middleware(request: NextRequest) {
    const route = request.nextUrl.pathname;
    
    if (route !== Routes.login && route !== Routes.register) {
        return shouldBeConnected(request)
    }else if (route === Routes.login || route === Routes.register) {
        return shouldNotBeConnected(request);
    }

    return NextResponse.next();
}

export const config: MiddlewareConfig = {
    matcher: ["/((?!_next).*)"]
}