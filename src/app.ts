import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env";
import authRoutes from "./routes/auth.route";

const app = express();

app.use(
  cors({
    origin: env.FRONTEND_URL, // e.g. https://app.yourdomain.com
    credentials: true
  })
);
app.use(express.json());
app.use(cookieParser());

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// auth routes
app.use("/auth", authRoutes);

export default app;
