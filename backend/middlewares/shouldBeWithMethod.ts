import type { Method } from "axios";
import { type NextRequest, NextResponse } from "next/server";

export async function shouldBewithMethod(req: NextRequest, res: NextResponse, methods: Method[] = ["GET"]) {
    const reqMethod = req.method?.toLocaleLowerCase() as Method;

    if (methods.includes(reqMethod)) {
        return res
    }else {
        res = NextResponse.json(
            { success: false, message: 'Method not allowed' },
            { status: 405 }
          );
    }
    
    return res;
}