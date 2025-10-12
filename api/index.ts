// api/index.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/app";
import { connectMongoCached } from "../src/config/mongo";

let handler: any;

export default async function (req: VercelRequest, res: VercelResponse) {
  try {
    await connectMongoCached();
    handler = handler || serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error("Boot error:", err);
    res.status(500).json({ error: "Boot failure", detail: String(err) });
  }
}
