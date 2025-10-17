// src/index.ts
import * as expressNS from "express";
const express = (expressNS as any).default ?? (expressNS as any);
import cors from "cors";
import cookieParser from "cookie-parser";
import router from "./routes/auth.route";
import { connectMongoCached } from "./config/mongo";
import { env } from "./config/env";

const app = express();

const ALLOWED = [
  env.FRONTEND_URL,              // https://auth-prototype-front.vercel.app
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => cb(null, !origin || ALLOWED.includes(origin)),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get("/", (_req : any, res:any) => res.json({ ok: true, service: "auth" }));
app.get("/auth/health", (_req : any, res:any) => res.json({ ok: true, db: "connected" }));

app.use("/auth", async (_req : any, res:any, next:any) => {
  try { await connectMongoCached(); next(); }
  catch (e) { console.error(e); res.status(500).json({ error: "DB connection failed" }); }
});

app.use("/auth", router);

// error handler last
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error("UNCAUGHT ERROR:", err);
  res.status(500).json({ error: "Internal error", detail: String(err?.message || err) });
});

export default app;

if (process.env.RUN_LOCAL === "1") {
  const port = Number(process.env.PORT || 4114);
  app.listen(port, () => console.log(`Auth API listening on http://localhost:${port}`));
}
