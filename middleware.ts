import { MiddlewareConfig, NextRequest } from "next/server";
import { Routes } from "./types/enums/routes";
import { shouldBeConnected } from "./backend/middlewares/shouldbeConnected";
import { shouldNotBeConnected } from "./backend/middlewares/shouldNotBeConnected";


export async function middleware(request: NextRequest) {
    const route = request.nextUrl.pathname;
    if (route !== Routes.login && route != Routes.register) {
        return shouldBeConnected(request)
    }

    return shouldNotBeConnected(request);
}

export const config: MiddlewareConfig = {
    
}