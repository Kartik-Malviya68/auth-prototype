// src/utils/cookie.ts
import type { Response } from "express";
import { env } from "../config/env";

const IS_PROD = env.NODE_ENV === "production";
const DEV_HTTP = process.env.DEV_HTTP === "1"; // allow insecure cookie locally

// utils/cookie.ts
export function setAuthCookie(res: Response, token: string, maxAgeSec: number) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: true,           // API is HTTPS in prod
    sameSite: "none",       // cross-site from localhost
    partitioned: true as any,
    path: "/",
    maxAge: maxAgeSec * 1000,
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    partitioned: true as any,
    path: "/",
  });
}
