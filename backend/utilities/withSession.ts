import { getIronSession } from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
  NextApiRequest,
} from "next";
import { NextHandler } from "next-connect";
import { RouteHandler } from "next/dist/server/future/route-handlers/route-handler";
import type { NextRequest, NextResponse } from "next/server";
import { ResponseWithSocket } from "../../pages/api/socket";

const sessionOptions = {
  password: process.env.COOKIE_PASSWORD !== undefined ? process.env.COOKIE_PASSWORD : "cookie_name",
  cookieName: process.env.COOKIE_NAME !== undefined ? process.env.COOKIE_NAME : "cookie_password",
  
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

type CustomApiHandler<T> = (req: NextApiRequest, res: ResponseWithSocket<T>) => unknown | Promise<unknown>

export function withSessionRoute(handler: CustomApiHandler<any>) {
  return withIronSessionApiRoute(handler as NextApiHandler, sessionOptions);
}

export function withSessionSsr<
  P extends { [key: string]: unknown } = { [key: string]: unknown },
>(
  handler: (
    context: GetServerSidePropsContext,
  ) => GetServerSidePropsResult<P> | Promise<GetServerSidePropsResult<P>>,
) {
  return withIronSessionSsr(handler, sessionOptions);
}

export async function withIronSession(req: NextRequest, res: NextResponse) {
  return await getIronSession(req, res, sessionOptions)
}
