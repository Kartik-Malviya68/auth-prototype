import { Schema, model } from "mongoose";

type Purpose = "register" | "login";

export interface IOtp {
  email: string;
  otpHash: string;
  purpose: Purpose;
  expiresAt: Date;
  attempts: number;
}

const otpSchema = new Schema<IOtp>(
  {
    email:   { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["register", "login"], required: true, index: true },
    // ⬇️ remove `index: true` to avoid duplicate with the TTL index
    expiresAt:{ type: Date, required: true },
    attempts:{ type: Number, default: 0 },
  },
  { timestamps: true }
);

// TTL auto-delete at `expiresAt`
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expiresAt" });

export const Otp = model<IOtp>("Otp", otpSchema);
