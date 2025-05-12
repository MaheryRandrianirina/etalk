import { MiddlewareConfig, NextRequest, NextResponse } from "next/server";
import { Routes } from "./types/enums/routes";
import { shouldBeConnected } from "./backend/middlewares/shouldbeConnected";
import { shouldNotBeConnected } from "./backend/middlewares/shouldNotBeConnected";


export async function middleware(request: NextRequest) {
    const route = request.nextUrl.pathname;
    
    const shouldNotBeConnectedRoutes: string[] = [
        Routes.login,
        Routes.register,
        Routes.apiLogin,
        Routes.apiRegister,
    ];

    let res = NextResponse.next();

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