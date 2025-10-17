import * as __WEBPACK_EXTERNAL_MODULE__getbrevo_brevo_6c173df0__ from "@getbrevo/brevo";
import * as __WEBPACK_EXTERNAL_MODULE_bcryptjs__ from "bcryptjs";
import * as __WEBPACK_EXTERNAL_MODULE_cookie_parser_591162dd__ from "cookie-parser";
import * as __WEBPACK_EXTERNAL_MODULE_cors__ from "cors";
import * as __WEBPACK_EXTERNAL_MODULE_dotenv__ from "dotenv";
import * as __WEBPACK_EXTERNAL_MODULE_express__ from "express";
import * as __WEBPACK_EXTERNAL_MODULE_jsonwebtoken__ from "jsonwebtoken";
import * as __WEBPACK_EXTERNAL_MODULE_mongoose__ from "mongoose";
/******/ var __webpack_modules__ = ({

/***/ "./src/config/env.ts":
/*!***************************!*\
  !*** ./src/config/env.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   env: () => (/* binding */ env)
/* harmony export */ });
/* harmony import */ var dotenv__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! dotenv */ "dotenv");
// src/config/env.ts

// Load .env locally (Vercel sets env from dashboard)
if (!process.env.VERCEL && "development" !== "production") {
    dotenv__WEBPACK_IMPORTED_MODULE_0__["default"].config();
}
const env = {
    NODE_ENV: "development" ?? 0,
    FRONTEND_URL: process.env.FRONTEND_URL ?? "http://localhost:3000",
    MONGO_URI: process.env.MONGO_URI ?? "",
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    COOKIE_NAME: process.env.COOKIE_NAME ?? "bravo_token",
    COOKIE_MAX_AGE: Number(process.env.COOKIE_MAX_AGE ?? 2592000),
    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? "",
    BREVO: {
        API_KEY: process.env.BREVO_API_KEY ?? "",
        FROM_EMAIL: process.env.BREVO_FROM_EMAIL ?? "no-reply@example.com",
        FROM_NAME: process.env.BREVO_FROM_NAME ?? "Bravo"
    }
};


/***/ }),

/***/ "./src/config/mongo.ts":
/*!*****************************!*\
  !*** ./src/config/mongo.ts ***!
  \*****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   connectMongoCached: () => (/* binding */ connectMongoCached)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ "mongoose");
/* harmony import */ var _env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./env */ "./src/config/env.ts");


let cached = global._mongooseCached;
if (!cached) {
    cached = global._mongooseCached = { conn: null, promise: null };
}
async function connectMongoCached() {
    if (cached.conn)
        return cached.conn;
    if (!cached.promise) {
        if (!_env__WEBPACK_IMPORTED_MODULE_1__.env.MONGO_URI)
            throw new Error("MONGO_URI missing");
        cached.promise = mongoose__WEBPACK_IMPORTED_MODULE_0__["default"].connect(_env__WEBPACK_IMPORTED_MODULE_1__.env.MONGO_URI).then((m) => m);
    }
    cached.conn = await cached.promise;
    return cached.conn;
}


/***/ }),

/***/ "./src/controllers/auth.controller.ts":
/*!********************************************!*\
  !*** ./src/controllers/auth.controller.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   loginRequestOtp: () => (/* binding */ loginRequestOtp),
/* harmony export */   loginVerifyOtp: () => (/* binding */ loginVerifyOtp),
/* harmony export */   logout: () => (/* binding */ logout),
/* harmony export */   me: () => (/* binding */ me),
/* harmony export */   registerRequestOtp: () => (/* binding */ registerRequestOtp),
/* harmony export */   registerVerifyOtp: () => (/* binding */ registerVerifyOtp),
/* harmony export */   session: () => (/* binding */ session)
/* harmony export */ });
/* harmony import */ var _models_Otp__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../models/Otp */ "./src/models/Otp.ts");
/* harmony import */ var _lib_otp__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/otp */ "./src/lib/otp.ts");
/* harmony import */ var _lib_mailer__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../lib/mailer */ "./src/lib/mailer.ts");
/* harmony import */ var _models_User__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../models/User */ "./src/models/User.ts");
/* harmony import */ var _lib_jwt__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../lib/jwt */ "./src/lib/jwt.ts");
/* harmony import */ var _lib_cookies__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../lib/cookies */ "./src/lib/cookies.ts");
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../config/env */ "./src/config/env.ts");







/** Internal: create + email OTP */
async function createAndSendOtp(email, purpose) {
    await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteMany({ email, purpose });
    const code = (0,_lib_otp__WEBPACK_IMPORTED_MODULE_1__.generateOtp)(6);
    const otpHash = await (0,_lib_otp__WEBPACK_IMPORTED_MODULE_1__.hashOtp)(code);
    await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.create({ email, otpHash, purpose, expiresAt: (0,_lib_otp__WEBPACK_IMPORTED_MODULE_1__.minutesFromNow)(10), attempts: 0 });
    await (0,_lib_mailer__WEBPACK_IMPORTED_MODULE_2__.sendOtpEmail)(email, code, purpose);
}
/** REGISTER FLOW */
async function registerRequestOtp(req, res) {
    const { email } = req.body;
    const { name } = req.body;
    if (!email)
        return res.status(400).json({ error: "Email is required" });
    const exists = await _models_User__WEBPACK_IMPORTED_MODULE_3__.User.exists({ email });
    if (exists)
        return res.status(409).json({ error: "User already exists. Please login." });
    await createAndSendOtp(email, "register");
    return res.json({ message: "Registration OTP sent" });
}
async function registerVerifyOtp(req, res) {
    const { email, otp, name } = req.body;
    if (!email || !otp)
        return res.status(400).json({ error: "Email and OTP are required" });
    const exists = await _models_User__WEBPACK_IMPORTED_MODULE_3__.User.exists({ email });
    if (exists)
        return res.status(409).json({ error: "User already exists. Please login." });
    const record = await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.findOne({ email, purpose: "register" }).sort({ createdAt: -1 });
    if (!record)
        return res.status(400).json({ error: "No registration OTP found" });
    if (record.expiresAt.getTime() < Date.now()) {
        await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ error: "OTP expired" });
    }
    if (record.attempts >= 5) {
        await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteOne({ _id: record._id });
        return res.status(429).json({ error: "Too many attempts" });
    }
    const ok = await (0,_lib_otp__WEBPACK_IMPORTED_MODULE_1__.verifyOtpHash)(otp, record.otpHash);
    if (!ok) {
        record.attempts += 1;
        await record.save();
        return res.status(400).json({ error: "Invalid OTP" });
    }
    const user = await _models_User__WEBPACK_IMPORTED_MODULE_3__.User.create({ email, ...(name ? { name } : {}) });
    await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteMany({ email, purpose: "register" });
    const token = (0,_lib_jwt__WEBPACK_IMPORTED_MODULE_4__.signJwt)({ id: user._id.toString(), email: user.email });
    (0,_lib_cookies__WEBPACK_IMPORTED_MODULE_5__.setAuthCookie)(res, token);
    return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });
}
/** LOGIN FLOW */
async function loginRequestOtp(req, res) {
    const { email } = req.body;
    if (!email)
        return res.status(400).json({ error: "Email is required" });
    const exists = await _models_User__WEBPACK_IMPORTED_MODULE_3__.User.exists({ email });
    if (!exists)
        return res.status(404).json({ error: "User not found. Please register." });
    await createAndSendOtp(email, "login");
    return res.json({ message: "Login OTP sent" });
}
async function loginVerifyOtp(req, res) {
    const { email, otp } = req.body;
    if (!email || !otp)
        return res.status(400).json({ error: "Email and OTP are required" });
    const user = await _models_User__WEBPACK_IMPORTED_MODULE_3__.User.findOne({ email });
    if (!user)
        return res.status(404).json({ error: "User not found. Please register." });
    const record = await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.findOne({ email, purpose: "login" }).sort({ createdAt: -1 });
    if (!record)
        return res.status(400).json({ error: "No login OTP found" });
    if (record.expiresAt.getTime() < Date.now()) {
        await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteOne({ _id: record._id });
        return res.status(400).json({ error: "OTP expired" });
    }
    if (record.attempts >= 5) {
        await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteOne({ _id: record._id });
        return res.status(429).json({ error: "Too many attempts" });
    }
    const ok = await (0,_lib_otp__WEBPACK_IMPORTED_MODULE_1__.verifyOtpHash)(otp, record.otpHash);
    if (!ok) {
        record.attempts += 1;
        await record.save();
        return res.status(400).json({ error: "Invalid OTP" });
    }
    await _models_Otp__WEBPACK_IMPORTED_MODULE_0__.Otp.deleteMany({ email, purpose: "login" });
    const token = (0,_lib_jwt__WEBPACK_IMPORTED_MODULE_4__.signJwt)({ id: user._id.toString(), email: user.email });
    (0,_lib_cookies__WEBPACK_IMPORTED_MODULE_5__.setAuthCookie)(res, token);
    return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });
}
/** SESSION (soft check; never 401s) */
async function session(req, res) {
    const token = req.cookies?.[_config_env__WEBPACK_IMPORTED_MODULE_6__.env.COOKIE_NAME];
    if (!token)
        return res.json({ authenticated: false });
    const payload = (0,_lib_jwt__WEBPACK_IMPORTED_MODULE_4__.verifyJwt)(token);
    if (!payload?.id)
        return res.json({ authenticated: false });
    const user = await _models_User__WEBPACK_IMPORTED_MODULE_3__.User.findById(payload.id).select("_id email name");
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
    (0,_lib_cookies__WEBPACK_IMPORTED_MODULE_5__.clearAuthCookie)(res);
    return res.json({ ok: true });
}


/***/ }),

/***/ "./src/lib/cookies.ts":
/*!****************************!*\
  !*** ./src/lib/cookies.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   clearAuthCookie: () => (/* binding */ clearAuthCookie),
/* harmony export */   setAuthCookie: () => (/* binding */ setAuthCookie)
/* harmony export */ });
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/env */ "./src/config/env.ts");

/** Only return a safe cookie domain. Omit for localhost/IP/blank/underscore. */
function sanitizeCookieDomain(raw) {
    if (!raw)
        return undefined;
    const v = raw.trim();
    if (!v || v === "_")
        return undefined;
    // don't set domain for localhost or IPs (host-only cookie is correct)
    if (v === "localhost" || /^\d{1,3}(\.\d{1,3}){3}$/.test(v))
        return undefined;
    // must contain a dot to be a registrable domain
    if (!v.includes("."))
        return undefined;
    // normalize to leading dot so it works across subdomains
    return v.startsWith(".") ? v : `.${v}`;
}
function setAuthCookie(res, token) {
    const isProd = _config_env__WEBPACK_IMPORTED_MODULE_0__.env.NODE_ENV === "production";
    const domain = sanitizeCookieDomain(_config_env__WEBPACK_IMPORTED_MODULE_0__.env.COOKIE_DOMAIN);
    res.cookie(_config_env__WEBPACK_IMPORTED_MODULE_0__.env.COOKIE_NAME, token, {
        httpOnly: true,
        secure: isProd, // true in HTTPS
        sameSite: "lax",
        path: "/",
        maxAge: _config_env__WEBPACK_IMPORTED_MODULE_0__.env.COOKIE_MAX_AGE * 1000,
        ...(domain ? { domain } : {})
    });
}
function clearAuthCookie(res) {
    const domain = sanitizeCookieDomain(_config_env__WEBPACK_IMPORTED_MODULE_0__.env.COOKIE_DOMAIN);
    res.clearCookie(_config_env__WEBPACK_IMPORTED_MODULE_0__.env.COOKIE_NAME, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        ...(domain ? { domain } : {})
    });
}


/***/ }),

/***/ "./src/lib/jwt.ts":
/*!************************!*\
  !*** ./src/lib/jwt.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   signJwt: () => (/* binding */ signJwt),
/* harmony export */   verifyJwt: () => (/* binding */ verifyJwt)
/* harmony export */ });
/* harmony import */ var jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config/env */ "./src/config/env.ts");


function signJwt(payload) {
    return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__["default"].sign(payload, _config_env__WEBPACK_IMPORTED_MODULE_1__.env.JWT_SECRET, { expiresIn: "30d" });
}
function verifyJwt(token) {
    try {
        return jsonwebtoken__WEBPACK_IMPORTED_MODULE_0__["default"].verify(token, _config_env__WEBPACK_IMPORTED_MODULE_1__.env.JWT_SECRET);
    }
    catch {
        return null;
    }
}


/***/ }),

/***/ "./src/lib/mailer.ts":
/*!***************************!*\
  !*** ./src/lib/mailer.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   sendOtpEmail: () => (/* binding */ sendOtpEmail)
/* harmony export */ });
/* harmony import */ var _getbrevo_brevo__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @getbrevo/brevo */ "@getbrevo/brevo");
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../config/env */ "./src/config/env.ts");
// src/lib/mailer.ts


function normalizeSenderEmail(raw) {
    if (!raw)
        return raw;
    const m = raw.match(/<([^>]+)>/); // "Name <you@x.com>" -> "you@x.com"
    return (m ? m[1] : raw).trim();
}
function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
async function sendOtpEmail(to, code, purpose) {
    if (!_config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.API_KEY) {
        console.warn("⚠️ BREVO_API_KEY missing — DEV OTP:", code);
        return;
    }
    const senderEmail = normalizeSenderEmail(_config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.FROM_EMAIL);
    if (!senderEmail || !isEmail(senderEmail)) {
        console.error("❌ BREVO_FROM_EMAIL invalid. Use a plain verified address like you@domain.com (no < >).");
        return;
    }
    const api = new _getbrevo_brevo__WEBPACK_IMPORTED_MODULE_0__.TransactionalEmailsApi();
    if (typeof api.setApiKey === "function") {
        // older v2 builds
        api.setApiKey(_getbrevo_brevo__WEBPACK_IMPORTED_MODULE_0__.TransactionalEmailsApiApiKeys.apiKey, _config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.API_KEY);
    }
    else if (api?.authentications?.apiKey) {
        // newer v2 builds
        api.authentications.apiKey.apiKey = _config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.API_KEY;
    }
    else {
        throw new Error("Brevo API key binding failed — SDK shape not recognized.");
    }
    const subject = `${_config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.FROM_NAME} ${purpose === "register" ? "Registration" : "Login"} Code`;
    const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#222">
      <h2>${subject}</h2>
      <div style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</div>
      <p>Expires in 10 minutes.</p>
    </div>`;
    const email = new _getbrevo_brevo__WEBPACK_IMPORTED_MODULE_0__.SendSmtpEmail();
    email.subject = subject;
    email.htmlContent = html;
    email.sender = { name: _config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.FROM_NAME, email: senderEmail }; // MUST be verified in Brevo
    email.replyTo = { name: _config_env__WEBPACK_IMPORTED_MODULE_1__.env.BREVO.FROM_NAME, email: senderEmail };
    email.to = [{ email: to }];
    try {
        await api.sendTransacEmail(email);
        console.log(`📨 OTP email sent to ${to}`);
    }
    catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data ?? err?.response?.text ?? err?.message;
        console.error("❌ Brevo sendTransacEmail failed", { status, data });
        throw err;
    }
}


/***/ }),

/***/ "./src/lib/otp.ts":
/*!************************!*\
  !*** ./src/lib/otp.ts ***!
  \************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generateOtp: () => (/* binding */ generateOtp),
/* harmony export */   hashOtp: () => (/* binding */ hashOtp),
/* harmony export */   minutesFromNow: () => (/* binding */ minutesFromNow),
/* harmony export */   verifyOtpHash: () => (/* binding */ verifyOtpHash)
/* harmony export */ });
/* harmony import */ var bcryptjs__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! bcryptjs */ "bcryptjs");

function generateOtp(length = 6) {
    return Math.floor(Math.random() * 10 ** length)
        .toString()
        .padStart(length, "0");
}
async function hashOtp(otp) {
    const salt = await bcryptjs__WEBPACK_IMPORTED_MODULE_0__["default"].genSalt(10);
    return bcryptjs__WEBPACK_IMPORTED_MODULE_0__["default"].hash(otp, salt);
}
async function verifyOtpHash(otp, hash) {
    return bcryptjs__WEBPACK_IMPORTED_MODULE_0__["default"].compare(otp, hash);
}
function minutesFromNow(min) {
    const d = new Date();
    d.setMinutes(d.getMinutes() + min);
    return d;
}


/***/ }),

/***/ "./src/middlewares/auth.ts":
/*!*********************************!*\
  !*** ./src/middlewares/auth.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   authMiddleware: () => (/* binding */ authMiddleware)
/* harmony export */ });
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../config/env */ "./src/config/env.ts");
/* harmony import */ var _lib_jwt__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../lib/jwt */ "./src/lib/jwt.ts");


function authMiddleware(req, res, next) {
    const token = req.cookies?.[_config_env__WEBPACK_IMPORTED_MODULE_0__.env.COOKIE_NAME];
    if (!token)
        return res.status(401).json({ error: "Unauthorized" });
    const payload = (0,_lib_jwt__WEBPACK_IMPORTED_MODULE_1__.verifyJwt)(token);
    if (!payload)
        return res.status(401).json({ error: "Invalid token" });
    req.user = payload;
    next();
}


/***/ }),

/***/ "./src/models/Otp.ts":
/*!***************************!*\
  !*** ./src/models/Otp.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Otp: () => (/* binding */ Otp)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ "mongoose");

const otpSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({
    email: { type: String, required: true, index: true },
    otpHash: { type: String, required: true },
    purpose: { type: String, enum: ["register", "login"], required: true, index: true },
    // ⬇️ remove `index: true` to avoid duplicate with the TTL index
    expiresAt: { type: Date, required: true },
    attempts: { type: Number, default: 0 },
}, { timestamps: true });
// TTL auto-delete at `expiresAt`
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0, name: "ttl_expiresAt" });
const Otp = (0,mongoose__WEBPACK_IMPORTED_MODULE_0__.model)("Otp", otpSchema);


/***/ }),

/***/ "./src/models/User.ts":
/*!****************************!*\
  !*** ./src/models/User.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   User: () => (/* binding */ User)
/* harmony export */ });
/* harmony import */ var mongoose__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! mongoose */ "mongoose");

const userSchema = new mongoose__WEBPACK_IMPORTED_MODULE_0__.Schema({
    email: { type: String, required: true, unique: true, index: true },
    name: { type: String }
}, { timestamps: true });
const User = (0,mongoose__WEBPACK_IMPORTED_MODULE_0__.model)("User", userSchema);


/***/ }),

/***/ "./src/routes/auth.route.ts":
/*!**********************************!*\
  !*** ./src/routes/auth.route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../controllers/auth.controller */ "./src/controllers/auth.controller.ts");
/* harmony import */ var _middlewares_auth_js__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../middlewares/auth.js */ "./src/middlewares/auth.ts");



const router = (0,express__WEBPACK_IMPORTED_MODULE_0__.Router)();
router.post("/register/request-otp", _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.registerRequestOtp);
router.post("/register/verify-otp", _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.registerVerifyOtp);
router.post("/login/request-otp", _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.loginRequestOtp);
router.post("/login/verify-otp", _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.loginVerifyOtp);
router.get("/session", _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.session);
router.get("/me", _middlewares_auth_js__WEBPACK_IMPORTED_MODULE_2__.authMiddleware, _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.me);
router.post("/logout", _controllers_auth_controller__WEBPACK_IMPORTED_MODULE_1__.logout);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (router); // ✅


/***/ }),

/***/ "@getbrevo/brevo":
/*!**********************************!*\
  !*** external "@getbrevo/brevo" ***!
  \**********************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__getbrevo_brevo_6c173df0__;

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_bcryptjs__;

/***/ }),

/***/ "cookie-parser":
/*!********************************!*\
  !*** external "cookie-parser" ***!
  \********************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_cookie_parser_591162dd__;

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_cors__;

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_dotenv__;

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_express__;

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_jsonwebtoken__;

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE_mongoose__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/define property getters */
/******/ (() => {
/******/ 	// define getter functions for harmony exports
/******/ 	__webpack_require__.d = (exports, definition) => {
/******/ 		for(var key in definition) {
/******/ 			if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 				Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 			}
/******/ 		}
/******/ 	};
/******/ })();
/******/ 
/******/ /* webpack/runtime/hasOwnProperty shorthand */
/******/ (() => {
/******/ 	__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ })();
/******/ 
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!**********************!*\
  !*** ./src/index.ts ***!
  \**********************/
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var express__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! express */ "express");
/* harmony import */ var cors__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! cors */ "cors");
/* harmony import */ var cookie_parser__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! cookie-parser */ "cookie-parser");
/* harmony import */ var _config_env__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./config/env */ "./src/config/env.ts");
/* harmony import */ var _config_mongo__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./config/mongo */ "./src/config/mongo.ts");
/* harmony import */ var _routes_auth_route__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./routes/auth.route */ "./src/routes/auth.route.ts");
// src/index.ts

// Cope with CJS or ESM builds of express at runtime:
const express = express__WEBPACK_IMPORTED_MODULE_0__["default"] ?? express__WEBPACK_IMPORTED_MODULE_0__;





// …keep the rest exactly the same…
const app = express();
app.use((0,cors__WEBPACK_IMPORTED_MODULE_1__["default"])({ origin: _config_env__WEBPACK_IMPORTED_MODULE_3__.env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use((0,cookie_parser__WEBPACK_IMPORTED_MODULE_2__["default"])());
app.get("/", (_req, res) => res.json({ ok: true, service: "auth" }));
app.get("/auth/health", (_req, res) => res.json({ ok: true, db: "connected" }));
app.use("/auth", async (_req, res, next) => {
    try {
        await (0,_config_mongo__WEBPACK_IMPORTED_MODULE_4__.connectMongoCached)();
        next();
    }
    catch (e) {
        console.error("Mongo connect failed:", e);
        res.status(500).json({ error: "DB connection failed" });
    }
});
app.use((err, _req, res, _next) => {
    console.error("UNCAUGHT ERROR:", err);
    res.status(500).json({ error: "Internal error", detail: String(err?.message || err) });
});
app.use("/auth", _routes_auth_route__WEBPACK_IMPORTED_MODULE_5__["default"]);
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (app); // keep export for serverless/tests
// ✅ Local-only HTTP server (no server.mjs, no import.meta)
if (process.env.RUN_LOCAL === "1") {
    const port = Number(process.env.PORT || 3001);
    app.listen(port, () => console.log(`Auth API listening on http://localhost:${port}`));
}

})();

const __webpack_exports__default = __webpack_exports__["default"];
export { __webpack_exports__default as default };

//# sourceMappingURL=index.js.map