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
        email: { type: String, required: true, index: true },
        otpHash: { type: String, required: true },
        purpose: { type: String, enum: ["register", "login"], required: true, index: true },
        expiresAt: { type: Date, required: true, index: true },
        attempts: { type: Number, default: 0 }
    },
    { timestamps: true }
);

// TTL auto-delete after expiresAt
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = model<IOtp>("Otp", otpSchema);
