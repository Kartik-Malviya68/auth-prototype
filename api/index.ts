import serverless from "serverless-http";
import app from "../src/app";

let handler: any;

export default async function (req: any, res: any) {
  try {
    handler = handler || serverless(app);
    return handler(req, res);
  } catch (err) {
    console.error("Boot error:", err);
    res.statusCode = 500;
    res.setHeader("content-type", "application/json");
    res.end(JSON.stringify({ error: "Boot failure", detail: String(err) }));
  }
}
