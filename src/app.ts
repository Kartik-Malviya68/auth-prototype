// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.route";
import { connectMongoCached } from "./config/mongo";

// ❌ delete this line:
// const dotenv = require("dotenv");

const app = express();

app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// cheap root + health
app.get("/", (_req, res) => res.json({ ok: true, service: "auth" }));
app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/auth", async (_req, res, next) => {
  try {
    await connectMongoCached();
    next();
  } catch (e) {
    console.error("Mongo connect failed:", e);
    res.status(500).json({ error: "DB connection failed" });
  }
});

app.use("/auth", authRoutes);

export default app;
