// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.route"; // ✅ correct path (NOT "./router")

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// quick health & root to avoid favicon crashes
app.get("/", (_req, res) => res.json({ ok: true, service: "auth" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes); // ✅ mount the real router

export default app;
