"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setAuthCookie = setAuthCookie;
exports.clearAuthCookie = clearAuthCookie;
const env_1 = require("../config/env");
function setAuthCookie(res, token) {
    const isProd = env_1.env.NODE_ENV === "production";
    res.cookie(env_1.env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd, // true on Vercel (HTTPS)
        sameSite: "lax",
        path: "/",
        maxAge: env_1.env.COOKIE_MAX_AGE * 1000,
        ...(env_1.env.COOKIE_DOMAIN ? { domain: env_1.env.COOKIE_DOMAIN } : {})
    });
}
function clearAuthCookie(res) {
    res.clearCookie(env_1.env.COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        ...(env_1.env.COOKIE_DOMAIN ? { domain: env_1.env.COOKIE_DOMAIN } : {})
    });
}
