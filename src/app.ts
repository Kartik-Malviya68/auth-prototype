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


app.get("/debug/env", (_req, res) => {
  res.json({
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGO_URI,
    hasJwt: !!process.env.JWT_SECRET,
    hasBrevo: !!process.env.BREVO_API_KEY,
    frontendUrl: process.env.FRONTEND_URL
  });
});

app.get("/debug/mongo", async (_req, res) => {
  try {
    const { default: mongoose } = await import("mongoose");
    const state = mongoose.connection.readyState; // 1 = connected
    res.json({ connected: state === 1, state });
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

// health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// auth routes
app.use("/auth", authRoutes);

export default app;
