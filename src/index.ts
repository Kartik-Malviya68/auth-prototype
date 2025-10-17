// src/index.ts
import * as expressNS from "express";
const express = (expressNS as any).default ?? (expressNS as any);

import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import { connectMongoCached } from "./config/mongo";
import router from "./routes/auth.route";

const app = express();

// Allow your Vercel app (and localhost in dev) — no "*"
const ALLOWED_ORIGINS = [
  env.FRONTEND_URL,                 // "https://auth-prototype-front.vercel.app"
  "http://localhost:3000",         // dev
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED_ORIGINS.includes(origin)),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// Health
app.get("/", (_req : any, res : any) => res.json({ ok: true, service: "auth" }));
app.get("/auth/health", (_req : any, res:any) => res.json({ ok: true, db: "connected" }));

// DB gate for /auth/*
app.use("/auth", async (_req : any, res:any, next:any) => {
  try { await connectMongoCached(); next(); }
  catch (e) { console.error("Mongo connect failed:", e); res.status(500).json({ error: "DB connection failed" }); }
});

// ⚠️ Register routes BEFORE the error handler
app.use("/auth", router);

// Error handler last
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("UNCAUGHT ERROR:", err);
  res.status(500).json({ error: "Internal error", detail: String(err?.message || err) });
});

export default app;

if (process.env.RUN_LOCAL === "1") {
  const port = Number(process.env.PORT || 4114);
  app.listen(port, () => console.log(`Auth API listening on http://localhost:${port}`));
}
