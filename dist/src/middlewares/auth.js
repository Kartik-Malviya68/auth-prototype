"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = authMiddleware;
const jwt_1 = require("../lib/jwt");
const env_1 = require("../config/env");
function authMiddleware(req, res, next) {
    const token = req.cookies?.[env_1.env.COOKIE_NAME];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    const payload = (0, jwt_1.verifyJwt)(token);
    if (!payload)
        return res.status(401).json({ error: "Invalid token" });
    req.user = payload;
    next();
}
