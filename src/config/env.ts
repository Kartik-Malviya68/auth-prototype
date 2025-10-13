import { createRequire } from "node:module";
const req = createRequire(import.meta.url);

// Load .env only for local/dev. On Vercel, envs come from dashboard.
if (!process.env.VERCEL && process.env.NODE_ENV !== "production") {
  try { req("dotenv").config(); } catch {}
}

export const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT ?? 4000),
  FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
  MONGO_URI: process.env.MONGO_URI ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "",
  COOKIE_NAME: process.env.COOKIE_NAME ?? "bravo_token",
  COOKIE_MAX_AGE: Number(process.env.COOKIE_MAX_AGE ?? 2592000),
  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "",
  BREVO: {
    API_KEY: process.env.BREVO_API_KEY ?? "",
    FROM_EMAIL: process.env.BREVO_FROM_EMAIL ?? "no-reply@example.com",
    FROM_NAME: process.env.BREVO_FROM_NAME ?? "Bravo",
  },
};
