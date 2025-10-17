// src/utils/cookie.ts
import type { Response } from "express";
import { env } from "../config/env";

const IS_PROD = env.NODE_ENV === "production";
const DEV_HTTP = process.env.DEV_HTTP === "1"; // allow insecure cookie locally

export function setAuthCookie(res: Response, token: string) {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: IS_PROD && !DEV_HTTP,         // true in prod (HTTPS)
    sameSite: IS_PROD ? "none" : "lax",   // cross-site in prod
    // Keep 3P cookie alive across reloads in Chromium (CHIPS)
    ...(IS_PROD ? { partitioned: true as any } : {}),
    path: "/",
    maxAge: env.COOKIE_MAX_AGE * 1000,
    // IMPORTANT: do NOT set `domain` for cross-site; host-only is correct
  });
}

export function clearAuthCookie(res: Response) {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: IS_PROD && !DEV_HTTP,
    sameSite: IS_PROD ? "none" : "lax",
    ...(IS_PROD ? { partitioned: true as any } : {}),
    path: "/",
  });
}
