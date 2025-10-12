import { Request, Response, NextFunction } from "express";
import { verifyJwt } from "../lib/jwt";
import { env } from "../config/env";

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.[env.COOKIE_NAME];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const payload = verifyJwt<{ id: string; email: string }>(token);
    if (!payload) return res.status(401).json({ error: "Invalid token" });

    (req as any).user = payload;
    next();
}

