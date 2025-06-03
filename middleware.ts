import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { Routes } from "./types/enums/routes";
import { shouldBeConnected } from "./backend/middlewares/shouldbeConnected";
import { shouldNotBeConnected } from "./backend/middlewares/shouldNotBeConnected";
import { shouldBewithMethod } from "./backend/middlewares/shouldBeWithMethod";
import { shouldHaveCsrfToken } from "./backend/middlewares/shouldHaveCsrfToken";
import { cors } from "./backend/middlewares/cors";


export async function middleware(request: NextRequest) {
    const route = request.nextUrl.pathname;
    const shouldNotBeConnectedRoutes: string[] = [
        Routes.login,
        Routes.register,
        Routes.apiLogin,
        Routes.apiRegister,
    ];
    const shouldBeGetRoutes: string[] = [
        Routes.login,
        Routes.register,
        Routes.home,
        Routes.apiSocket,
        Routes.apiConversations,
        Routes.apiUser,
    ];
    const shouldBePostRoutes: string[] = [
        Routes.apiLogin,
        Routes.apiLogout,
        Routes.apiRegister,
        Routes.apiUpload,
        Routes.apiUser,
        Routes.apiUserBlock,
    ];

    let res = NextResponse.next();

    //enable cors
    res = cors(res)

    // protect routes for specific methods
    if(
        shouldBeGetRoutes.includes(route)&& 
        !shouldBePostRoutes.includes(route) || 
        route.startsWith(Routes.conversation) ||
        route.match(/\/api\/user\/conversation\/\d+/)
    ) {
        res = await shouldBewithMethod(request, res, ["get"])
    }else if(
        shouldBePostRoutes.includes(route) && 
        !shouldBeGetRoutes.includes(route) ||
        route.match(/\/api\/user\/conversation\/message\/\d+/)
    ) {
        res = await shouldBewithMethod(request, res, ["post"])
    }

    if(shouldBeGetRoutes.includes(route) && shouldBePostRoutes.includes(route)) {
        res = await shouldBewithMethod(request, res, ["get", "post"])
    }
    
    // require csrf token for post requests
    if((request.method.toLowerCase() === "post" || request.method.toLowerCase() === "delete") && route !== Routes.apiLogin && route !== Routes.apiRegister) {
        res = await shouldHaveCsrfToken(request, res)
    }

    // protect routes for authentication
    if (shouldNotBeConnectedRoutes.includes(route)) {
        res = await shouldNotBeConnected(request, res);
    }else if(!shouldNotBeConnectedRoutes.includes(route)){        
        res = await shouldBeConnected(request, res);
    }

    return res;
}

export const config: MiddlewareConfig = {
    matcher: ["/((?!_next).*)"]
}