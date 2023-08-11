import { getIronSession } from "iron-session";
import { withIronSessionApiRoute, withIronSessionSsr } from "iron-session/next";

import {
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiHandler,
} from "next";
import type { NextRequest, NextResponse } from "next/server";

const sessionOptions = {
  password: process.env.COOKIE_PASSWORD !== undefined ? process.env.COOKIE_PASSWORD : "cookie_name",
  cookieName: process.env.COOKIE_NAME !== undefined ? process.env.COOKIE_NAME : "cookie_password",
  
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export function withSessionRoute(handler: NextApiHandler) {
  return withIronSessionApiRoute(handler, sessionOptions);
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