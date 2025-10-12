import { Response } from "express";
import { env } from "../config/env";

export function setAuthCookie(res: Response, token: string) {
    const isProd = env.NODE_ENV === "production";
    res.cookie(env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd,                 // true on Vercel (HTTPS)
        sameSite: "lax",
        path: "/",
        maxAge: env.COOKIE_MAX_AGE * 1000,
        ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {})
    });
}

export function clearAuthCookie(res: Response) {
    res.clearCookie(env.COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        ...(env.COOKIE_DOMAIN ? { domain: env.COOKIE_DOMAIN } : {})
    });
}
