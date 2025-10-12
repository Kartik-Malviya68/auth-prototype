import { Request, Response } from "express";
import { Otp } from "../models/Otp";
import { generateOtp, hashOtp, verifyOtpHash, minutesFromNow } from "../lib/otp";
import { sendOtpEmail } from "../lib/mailer";
import { env } from "../config/env";
import { User } from "../models/User";
import { signJwt, verifyJwt } from "../lib/jwt";
import { clearAuthCookie, setAuthCookie } from "../lib/cookies";

/** Internal: create + email OTP */
async function createAndSendOtp(email: string, purpose: "register" | "login") {
  await Otp.deleteMany({ email, purpose });
  const code = generateOtp(6);
  const otpHash = await hashOtp(code);
  await Otp.create({ email, otpHash, purpose, expiresAt: minutesFromNow(10), attempts: 0 });
  await sendOtpEmail(email, code, purpose);
}

/** REGISTER FLOW */
export async function registerRequestOtp(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  const { name } = req.body as { name?: string };
  if (!email) return res.status(400).json({ error: "Email is required" });

  const exists = await User.exists({ email });
  if (exists) return res.status(409).json({ error: "User already exists. Please login." });

  await createAndSendOtp(email, "register");
  return res.json({ message: "Registration OTP sent" });
}

export async function registerVerifyOtp(req: Request, res: Response) {
  const { email, otp, name } = req.body as { email?: string; otp?: string; name?: string };
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  const exists = await User.exists({ email });
  if (exists) return res.status(409).json({ error: "User already exists. Please login." });

  const record = await Otp.findOne({ email, purpose: "register" }).sort({ createdAt: -1 });
  if (!record) return res.status(400).json({ error: "No registration OTP found" });
  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    return res.status(400).json({ error: "OTP expired" });
  }
  if (record.attempts >= 5) {
    await Otp.deleteOne({ _id: record._id });
    return res.status(429).json({ error: "Too many attempts" });
  }

  const ok = await verifyOtpHash(otp, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    return res.status(400).json({ error: "Invalid OTP" });
  }

  const user = await User.create({ email, ...(name ? { name } : {}) });
  await Otp.deleteMany({ email, purpose: "register" });

  const token = signJwt({ id: user._id.toString(), email: user.email });
  setAuthCookie(res, token);

  return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });
}

/** LOGIN FLOW */
export async function loginRequestOtp(req: Request, res: Response) {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "Email is required" });

  const exists = await User.exists({ email });
  if (!exists) return res.status(404).json({ error: "User not found. Please register." });

  await createAndSendOtp(email, "login");
  return res.json({ message: "Login OTP sent" });
}

export async function loginVerifyOtp(req: Request, res: Response) {
  const { email, otp } = req.body as { email?: string; otp?: string };
  if (!email || !otp) return res.status(400).json({ error: "Email and OTP are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found. Please register." });

  const record = await Otp.findOne({ email, purpose: "login" }).sort({ createdAt: -1 });
  if (!record) return res.status(400).json({ error: "No login OTP found" });
  if (record.expiresAt.getTime() < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    return res.status(400).json({ error: "OTP expired" });
  }
  if (record.attempts >= 5) {
    await Otp.deleteOne({ _id: record._id });
    return res.status(429).json({ error: "Too many attempts" });
  }

  const ok = await verifyOtpHash(otp, record.otpHash);
  if (!ok) {
    record.attempts += 1;
    await record.save();
    return res.status(400).json({ error: "Invalid OTP" });
  }

  await Otp.deleteMany({ email, purpose: "login" });

  const token = signJwt({ id: user._id.toString(), email: user.email });
  setAuthCookie(res, token);

  return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });
}

/** SESSION (soft check; never 401s) */
export async function session(req: Request, res: Response) {
  const token = req.cookies?.[env.COOKIE_NAME];
  if (!token) return res.json({ authenticated: false });

  const payload = verifyJwt<{ id: string; email: string }>(token);
  if (!payload?.id) return res.json({ authenticated: false });

  const user = await User.findById(payload.id).select("_id email name");
  if (!user) return res.json({ authenticated: false });

  return res.json({ authenticated: true, user: { id: user._id, email: user.email, name: user.name ?? null } });
}

/** Strict me (401 when unauthenticated; useful for debugging) */
export async function me(req: Request, res: Response) {
  return res.json({ user: (req as any).user });
}

/** LOGOUT */
export async function logout(_req: Request, res: Response) {
  clearAuthCookie(res);
  return res.json({ ok: true });
}
