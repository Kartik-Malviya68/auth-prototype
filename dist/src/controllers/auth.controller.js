"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRequestOtp = registerRequestOtp;
exports.registerVerifyOtp = registerVerifyOtp;
exports.loginRequestOtp = loginRequestOtp;
exports.loginVerifyOtp = loginVerifyOtp;
exports.session = session;
exports.me = me;
exports.logout = logout;
const Otp_1 = require("../models/Otp");
const otp_1 = require("../lib/otp");
const mailer_1 = require("../lib/mailer");
const env_1 = require("../config/env");
const User_1 = require("../models/User");
const jwt_1 = require("../lib/jwt");
const cookies_1 = require("../lib/cookies");
/** Internal: create + email OTP */
async function createAndSendOtp(email, purpose) {
    await Otp_1.Otp.deleteMany({ email, purpose });
    const code = (0, otp_1.generateOtp)(6);
    const otpHash = await (0, otp_1.hashOtp)(code);
    await Otp_1.Otp.create({ email, otpHash, purpose, expiresAt: (0, otp_1.minutesFromNow)(10), attempts: 0 });
    await (0, mailer_1.sendOtpEmail)(email, code, purpose);
}
/** REGISTER FLOW */
async function registerRequestOtp(req, res) {
    const { email } = req.body;
    const { name } = req.body;
    if (!email)
        return res.status(400).json({ error: "Email is required" });
    const exists = await User_1.User.exists({ email });
    if (exists)
        return res.status(409).json({ error: "User already exists. Please login." });
    await createAndSendOtp(email, "register");
    return res.json({ message: "Registration OTP sent" });
}
async function registerVerifyOtp(req, res) {
    const { email, otp, name } = req.body;
    if (!email || !otp)
        return res.status(400).json({ error: "Email and OTP are required" });
    const exists = await User_1.User.exists({ email });
    if (exists)
        return res.status(409).json({ error: "User already exists. Please login." });
    const record = await Otp_1.Otp.findOne({ email, purpose: "register" }).sort({ createdAt: -1 });
    if (!record)
        return res.status(400).json({ error: "No registration OTP found" });
    if (record.expiresAt.getTime() < Date.now()) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ error: "OTP expired" });
    }
    if (record.attempts >= 5) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        return res.status(429).json({ error: "Too many attempts" });
    }
    const ok = await (0, otp_1.verifyOtpHash)(otp, record.otpHash);
    if (!ok) {
        record.attempts += 1;
        await record.save();
        return res.status(400).json({ error: "Invalid OTP" });
    }
    const user = await User_1.User.create({ email, ...(name ? { name } : {}) });
    await Otp_1.Otp.deleteMany({ email, purpose: "register" });
    const token = (0, jwt_1.signJwt)({ id: user._id.toString(), email: user.email });
    (0, cookies_1.setAuthCookie)(res, token);
    return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });
}
/** LOGIN FLOW */
async function loginRequestOtp(req, res) {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: "Email is required" });
    const exists = await User_1.User.exists({ email });
    if (!exists)
        return res.status(404).json({ error: "User not found. Please register." });
    await createAndSendOtp(email, "login");
    return res.json({ message: "Login OTP sent" });
}
async function loginVerifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({ error: "Email and OTP are required" });
    const user = await User_1.User.findOne({ email });
    if (!user)
        return res.status(404).json({ error: "User not found. Please register." });
    const record = await Otp_1.Otp.findOne({ email, purpose: "login" }).sort({ createdAt: -1 });
    if (!record)
        return res.status(400).json({ error: "No login OTP found" });
    if (record.expiresAt.getTime() < Date.now()) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ error: "OTP expired" });
    }
    if (record.attempts >= 5) {
        await Otp_1.Otp.deleteOne({ _id: record._id });
        return res.status(429).json({ error: "Too many attempts" });
    }
    const ok = await (0, otp_1.verifyOtpHash)(otp, record.otpHash);
    if (!ok) {
        record.attempts += 1;
        await record.save();
        return res.status(400).json({ error: "Invalid OTP" });
    }
    await Otp_1.Otp.deleteMany({ email, purpose: "login" });
    const token = (0, jwt_1.signJwt)({ id: user._id.toString(), email: user.email });
    (0, cookies_1.setAuthCookie)(res, token);
    return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });
}
/** SESSION (soft check; never 401s) */
async function session(req, res) {
    const token = req.cookies?.[env_1.env.COOKIE_NAME];
    if (!token)
        return res.json({ authenticated: false });
    const payload = (0, jwt_1.verifyJwt)(token);
    if (!payload?.id)
        return res.json({ authenticated: false });
    const user = await User_1.User.findById(payload.id).select("_id email name");
    if (!user)
        return res.json({ authenticated: false });
    return res.json({ authenticated: true, user: { id: user._id, email: user.email, name: user.name ?? null } });
}
/** Strict me (401 when unauthenticated; useful for debugging) */
async function me(req, res) {
    return res.json({ user: req.user });
}
/** LOGOUT */
async function logout(_req, res) {
    (0, cookies_1.clearAuthCookie)(res);
    return res.json({ ok: true });
}
