import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.route";
import { connectMongoCached } from "./config/mongo";

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/", (_req, res) => res.json({ ok: true, service: "auth" }));
app.get('/auth/health', (_req, res) => res.json({ ok: true, db: 'connected' }));

app.use("/auth", async (_req, res, next) => {
  try {
    await connectMongoCached();
    next();
  } catch (e) {
    console.error("Mongo connect failed:", e);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error('UNCAUGHT ERROR:', err);
  res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) });
});

app.use("/auth", authRoutes);

export default app;  // <— IMPORTANT: no app.listen()
