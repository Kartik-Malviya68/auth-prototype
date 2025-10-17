// src/utils/cookie.ts
import type { Response } from "express";
import { env } from "../config/env";

// Minimal “are these different sites?” check: compare eTLD+1
function getETLDPlusOne(host: string) {
  const parts = host.split(".").filter(Boolean);
  if (parts.length <= 2) return host;           // localhost or simple domain
  return parts.slice(-2).join(".");             // example.com, vercel.app, etc.
}

function isCrossSite(apiHost?: string, frontendUrl?: string) {
  try {
    if (!apiHost || !frontendUrl) return false;
    const fe = new URL(frontendUrl).hostname;
    return getETLDPlusOne(apiHost) !== getETLDPlusOne(fe);
  } catch { return false; }
}

export function setAuthCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === "production";
  const apiHost = res.req?.headers?.host; // e.g. api.example.com or IP
  const crossSite = isCrossSite(apiHost, env.FRONTEND_URL);

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    // In prod: Secure must be true. For local HTTP, allow turning it off with DEV_HTTP=1
    secure: isProd && process.env.DEV_HTTP !== "1",
    sameSite: crossSite ? "none" : "lax",
    path: "/",
    maxAge: env.COOKIE_MAX_AGE * 1000,
    // IMPORTANT: omit domain when cross-site (host-only cookie is safest)
    // ...(env.COOKIE_DOMAIN && !crossSite ? { domain: normalizeDomain(env.COOKIE_DOMAIN) } : {})
  });
}

export function clearAuthCookie(res: Response) {
  const isProd = env.NODE_ENV === "production";
  const apiHost = res.req?.headers?.host;
  const crossSite = isCrossSite(apiHost, env.FRONTEND_URL);

  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd && process.env.DEV_HTTP !== "1",
    sameSite: crossSite ? "none" : "lax",
    path: "/",
  });
}
