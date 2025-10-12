import mongoose from "mongoose";
import { env } from "./env";

let cached = (global as any)._mongooseCached as {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

if (!cached) {
  cached = (global as any)._mongooseCached = { conn: null, promise: null };
}

export async function connectMongoCached() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    if (!env.MONGO_URI) throw new Error("MONGO_URI missing");
    cached.promise = mongoose.connect(env.MONGO_URI).then((m) => m);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
