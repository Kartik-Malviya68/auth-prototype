import type { VercelRequest, VercelResponse } from "@vercel/node";
import serverless from "serverless-http";
import app from "../src/app";
import { connectMongoCached } from "../src/config/mongo";

let handler: any;

export default async function (req: VercelRequest, res: VercelResponse) {
  await connectMongoCached();           // reuse Mongo connection across invocations
  handler = handler || serverless(app); // lazily create serverless handler
  return handler(req, res);
}
