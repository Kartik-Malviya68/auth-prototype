// src/index.ts
import * as expressNS from "express";
// Cope with CJS or ESM builds of express at runtime:
const express = (expressNS as any).default ?? (expressNS as any);

import cors from "cors";
import cookieParser from "cookie-parser";

import { env } from "./config/env";
import { connectMongoCached } from "./config/mongo";
import router from "./routes/auth.route";

// …keep the rest exactly the same…
const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req:any, res:any) => res.json({ ok: true, service: "auth" }));
app.get("/auth/health", (_req:any, res:any) => res.json({ ok: true, db: "connected" }));

app.use("/auth", async (_req:any, res:any, next:any) => {
  try {
    await connectMongoCached();
    next();
  } catch (e) {
    console.error("Mongo connect failed:", e);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("UNCAUGHT ERROR:", err);
  res.status(500).json({ error: "Internal error", detail: String(err?.message || err) });
});

app.use("/auth", router);

export default app; // keep export for serverless/tests

// ✅ Local-only HTTP server (no server.mjs, no import.meta)
if (process.env.RUN_LOCAL === "1") {
  const port = Number(process.env.PORT || 3001);
  app.listen(port, () => console.log(`Auth API listening on http://localhost:${port}`));
}
