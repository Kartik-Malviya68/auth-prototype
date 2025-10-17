import { Response } from "express";
import { env } from "../config/env";

/** Only return a safe cookie domain. Omit for localhost/IP/blank/underscore. */
function sanitizeCookieDomain(raw?: string) {
  if (!raw) return undefined;
  const v = raw.trim();
  if (!v || v === "_") return undefined;

  // don't set domain for localhost or IPs (host-only cookie is correct)
  if (v === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(v)) return undefined;

  // must contain a dot to be a registrable domain
  if (!v.includes(".")) return undefined;

  // normalize to leading dot so it works across subdomains
  return v.startsWith(".") ? v : `.${v}`;
}

export function setAuthCookie(res: Response, token: string) {
  const isProd = env.NODE_ENV === "production";
  const domain = sanitizeCookieDomain(env.COOKIE_DOMAIN);

  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd,     // true in HTTPS
    sameSite: "lax",
    path: "/",
    maxAge: env.COOKIE_MAX_AGE * 1000,
    ...(domain ? { domain } : {})
  });
}

export function clearAuthCookie(res: Response) {
  const domain = sanitizeCookieDomain(env.COOKIE_DOMAIN);

  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    ...(domain ? { domain } : {})
  });
}
