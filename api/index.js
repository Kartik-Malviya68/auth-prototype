/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ var __webpack_modules__ = ({

/***/ "./src/app.ts":
/*!********************!*\
  !*** ./src/app.ts ***!
  \********************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst express_1 = __importDefault(__webpack_require__(/*! express */ \"express\"));\nconst cors_1 = __importDefault(__webpack_require__(/*! cors */ \"cors\"));\nconst cookie_parser_1 = __importDefault(__webpack_require__(/*! cookie-parser */ \"cookie-parser\"));\nconst env_1 = __webpack_require__(/*! ./config/env */ \"./src/config/env.ts\");\nconst auth_route_1 = __importDefault(__webpack_require__(/*! ./routes/auth.route */ \"./src/routes/auth.route.ts\"));\nconst mongo_1 = __webpack_require__(/*! ./config/mongo */ \"./src/config/mongo.ts\");\nconst app = (0, express_1.default)();\napp.use((0, cors_1.default)({ origin: env_1.env.FRONTEND_URL, credentials: true }));\napp.use(express_1.default.json());\napp.use((0, cookie_parser_1.default)());\napp.get(\"/\", (_req, res) => res.json({ ok: true, service: \"auth\" }));\napp.get('/auth/health', (_req, res) => res.json({ ok: true, db: 'connected' }));\napp.use(\"/auth\", async (_req, res, next) => {\n    try {\n        await (0, mongo_1.connectMongoCached)();\n        next();\n    }\n    catch (e) {\n        console.error(\"Mongo connect failed:\", e);\n        res.status(500).json({ error: \"DB connection failed\" });\n    }\n});\napp.use((err, _req, res, _next) => {\n    console.error('UNCAUGHT ERROR:', err);\n    res.status(500).json({ error: 'Internal error', detail: String(err?.message || err) });\n});\napp.use(\"/auth\", auth_route_1.default);\nexports[\"default\"] = app; // <— IMPORTANT: no app.listen()\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/app.ts?\n}");

/***/ }),

/***/ "./src/config/env.ts":
/*!***************************!*\
  !*** ./src/config/env.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.env = void 0;\n// Load .env only locally. On Vercel, values come from dashboard.\nif (!process.env.VERCEL && \"development\" !== 'production') {\n    try {\n        (__webpack_require__(/*! dotenv */ \"dotenv\").config)();\n    }\n    catch { }\n}\nexports.env = {\n    NODE_ENV: \"development\" ?? 0,\n    FRONTEND_URL: process.env.FRONTEND_URL ?? 'http://localhost:3000',\n    MONGO_URI: process.env.MONGO_URI ?? '',\n    JWT_SECRET: process.env.JWT_SECRET ?? '',\n    COOKIE_NAME: process.env.COOKIE_NAME ?? 'bravo_token',\n    COOKIE_MAX_AGE: Number(process.env.COOKIE_MAX_AGE ?? 2592000),\n    COOKIE_DOMAIN: process.env.COOKIE_DOMAIN ?? '',\n    BREVO: {\n        API_KEY: process.env.BREVO_API_KEY ?? '',\n        FROM_EMAIL: process.env.BREVO_FROM_EMAIL ?? 'no-reply@example.com',\n        FROM_NAME: process.env.BREVO_FROM_NAME ?? 'Bravo',\n    },\n};\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/config/env.ts?\n}");

/***/ }),

/***/ "./src/config/mongo.ts":
/*!*****************************!*\
  !*** ./src/config/mongo.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.connectMongoCached = connectMongoCached;\nconst mongoose_1 = __importDefault(__webpack_require__(/*! mongoose */ \"mongoose\"));\nconst env_1 = __webpack_require__(/*! ./env */ \"./src/config/env.ts\");\nlet cached = global._mongooseCached;\nif (!cached) {\n    cached = global._mongooseCached = { conn: null, promise: null };\n}\nasync function connectMongoCached() {\n    if (cached.conn)\n        return cached.conn;\n    if (!cached.promise) {\n        if (!env_1.env.MONGO_URI)\n            throw new Error(\"MONGO_URI missing\");\n        cached.promise = mongoose_1.default.connect(env_1.env.MONGO_URI).then((m) => m);\n    }\n    cached.conn = await cached.promise;\n    return cached.conn;\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/config/mongo.ts?\n}");

/***/ }),

/***/ "./src/controllers/auth.controller.ts":
/*!********************************************!*\
  !*** ./src/controllers/auth.controller.ts ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.registerRequestOtp = registerRequestOtp;\nexports.registerVerifyOtp = registerVerifyOtp;\nexports.loginRequestOtp = loginRequestOtp;\nexports.loginVerifyOtp = loginVerifyOtp;\nexports.session = session;\nexports.me = me;\nexports.logout = logout;\nconst Otp_1 = __webpack_require__(/*! ../models/Otp */ \"./src/models/Otp.ts\");\nconst otp_1 = __webpack_require__(/*! ../lib/otp */ \"./src/lib/otp.ts\");\nconst mailer_1 = __webpack_require__(/*! ../lib/mailer */ \"./src/lib/mailer.ts\");\nconst env_1 = __webpack_require__(/*! ../config/env */ \"./src/config/env.ts\");\nconst User_1 = __webpack_require__(/*! ../models/User */ \"./src/models/User.ts\");\nconst jwt_1 = __webpack_require__(/*! ../lib/jwt */ \"./src/lib/jwt.ts\");\nconst cookies_1 = __webpack_require__(/*! ../lib/cookies */ \"./src/lib/cookies.ts\");\n/** Internal: create + email OTP */\nasync function createAndSendOtp(email, purpose) {\n    await Otp_1.Otp.deleteMany({ email, purpose });\n    const code = (0, otp_1.generateOtp)(6);\n    const otpHash = await (0, otp_1.hashOtp)(code);\n    await Otp_1.Otp.create({ email, otpHash, purpose, expiresAt: (0, otp_1.minutesFromNow)(10), attempts: 0 });\n    await (0, mailer_1.sendOtpEmail)(email, code, purpose);\n}\n/** REGISTER FLOW */\nasync function registerRequestOtp(req, res) {\n    const { email } = req.body;\n    const { name } = req.body;\n    if (!email)\n        return res.status(400).json({ error: \"Email is required\" });\n    const exists = await User_1.User.exists({ email });\n    if (exists)\n        return res.status(409).json({ error: \"User already exists. Please login.\" });\n    await createAndSendOtp(email, \"register\");\n    return res.json({ message: \"Registration OTP sent\" });\n}\nasync function registerVerifyOtp(req, res) {\n    const { email, otp, name } = req.body;\n    if (!email || !otp)\n        return res.status(400).json({ error: \"Email and OTP are required\" });\n    const exists = await User_1.User.exists({ email });\n    if (exists)\n        return res.status(409).json({ error: \"User already exists. Please login.\" });\n    const record = await Otp_1.Otp.findOne({ email, purpose: \"register\" }).sort({ createdAt: -1 });\n    if (!record)\n        return res.status(400).json({ error: \"No registration OTP found\" });\n    if (record.expiresAt.getTime() < Date.now()) {\n        await Otp_1.Otp.deleteOne({ _id: record._id });\n        return res.status(400).json({ error: \"OTP expired\" });\n    }\n    if (record.attempts >= 5) {\n        await Otp_1.Otp.deleteOne({ _id: record._id });\n        return res.status(429).json({ error: \"Too many attempts\" });\n    }\n    const ok = await (0, otp_1.verifyOtpHash)(otp, record.otpHash);\n    if (!ok) {\n        record.attempts += 1;\n        await record.save();\n        return res.status(400).json({ error: \"Invalid OTP\" });\n    }\n    const user = await User_1.User.create({ email, ...(name ? { name } : {}) });\n    await Otp_1.Otp.deleteMany({ email, purpose: \"register\" });\n    const token = (0, jwt_1.signJwt)({ id: user._id.toString(), email: user.email });\n    (0, cookies_1.setAuthCookie)(res, token);\n    return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });\n}\n/** LOGIN FLOW */\nasync function loginRequestOtp(req, res) {\n    const { email } = req.body;\n    if (!email)\n        return res.status(400).json({ error: \"Email is required\" });\n    const exists = await User_1.User.exists({ email });\n    if (!exists)\n        return res.status(404).json({ error: \"User not found. Please register.\" });\n    await createAndSendOtp(email, \"login\");\n    return res.json({ message: \"Login OTP sent\" });\n}\nasync function loginVerifyOtp(req, res) {\n    const { email, otp } = req.body;\n    if (!email || !otp)\n        return res.status(400).json({ error: \"Email and OTP are required\" });\n    const user = await User_1.User.findOne({ email });\n    if (!user)\n        return res.status(404).json({ error: \"User not found. Please register.\" });\n    const record = await Otp_1.Otp.findOne({ email, purpose: \"login\" }).sort({ createdAt: -1 });\n    if (!record)\n        return res.status(400).json({ error: \"No login OTP found\" });\n    if (record.expiresAt.getTime() < Date.now()) {\n        await Otp_1.Otp.deleteOne({ _id: record._id });\n        return res.status(400).json({ error: \"OTP expired\" });\n    }\n    if (record.attempts >= 5) {\n        await Otp_1.Otp.deleteOne({ _id: record._id });\n        return res.status(429).json({ error: \"Too many attempts\" });\n    }\n    const ok = await (0, otp_1.verifyOtpHash)(otp, record.otpHash);\n    if (!ok) {\n        record.attempts += 1;\n        await record.save();\n        return res.status(400).json({ error: \"Invalid OTP\" });\n    }\n    await Otp_1.Otp.deleteMany({ email, purpose: \"login\" });\n    const token = (0, jwt_1.signJwt)({ id: user._id.toString(), email: user.email });\n    (0, cookies_1.setAuthCookie)(res, token);\n    return res.json({ user: { id: user._id, email: user.email, name: user.name ?? null } });\n}\n/** SESSION (soft check; never 401s) */\nasync function session(req, res) {\n    const token = req.cookies?.[env_1.env.COOKIE_NAME];\n    if (!token)\n        return res.json({ authenticated: false });\n    const payload = (0, jwt_1.verifyJwt)(token);\n    if (!payload?.id)\n        return res.json({ authenticated: false });\n    const user = await User_1.User.findById(payload.id).select(\"_id email name\");\n    if (!user)\n        return res.json({ authenticated: false });\n    return res.json({ authenticated: true, user: { id: user._id, email: user.email, name: user.name ?? null } });\n}\n/** Strict me (401 when unauthenticated; useful for debugging) */\nasync function me(req, res) {\n    return res.json({ user: req.user });\n}\n/** LOGOUT */\nasync function logout(_req, res) {\n    (0, cookies_1.clearAuthCookie)(res);\n    return res.json({ ok: true });\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/controllers/auth.controller.ts?\n}");

/***/ }),

/***/ "./src/handler.ts":
/*!************************!*\
  !*** ./src/handler.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst serverless_http_1 = __importDefault(__webpack_require__(/*! serverless-http */ \"serverless-http\"));\nconst app_1 = __importDefault(__webpack_require__(/*! ./app */ \"./src/app.ts\"));\nexports[\"default\"] = (0, serverless_http_1.default)(app_1.default); // ESM default export\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/handler.ts?\n}");

/***/ }),

/***/ "./src/lib/cookies.ts":
/*!****************************!*\
  !*** ./src/lib/cookies.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.setAuthCookie = setAuthCookie;\nexports.clearAuthCookie = clearAuthCookie;\nconst env_1 = __webpack_require__(/*! ../config/env */ \"./src/config/env.ts\");\nfunction setAuthCookie(res, token) {\n    const isProd = env_1.env.NODE_ENV === \"production\";\n    res.cookie(env_1.env.COOKIE_NAME, token, {\n        httpOnly: true,\n        secure: isProd, // true on Vercel (HTTPS)\n        sameSite: \"lax\",\n        path: \"/\",\n        maxAge: env_1.env.COOKIE_MAX_AGE * 1000,\n        ...(env_1.env.COOKIE_DOMAIN ? { domain: env_1.env.COOKIE_DOMAIN } : {})\n    });\n}\nfunction clearAuthCookie(res) {\n    res.clearCookie(env_1.env.COOKIE_NAME, {\n        httpOnly: true,\n        sameSite: \"lax\",\n        path: \"/\",\n        ...(env_1.env.COOKIE_DOMAIN ? { domain: env_1.env.COOKIE_DOMAIN } : {})\n    });\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/lib/cookies.ts?\n}");

/***/ }),

/***/ "./src/lib/jwt.ts":
/*!************************!*\
  !*** ./src/lib/jwt.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.signJwt = signJwt;\nexports.verifyJwt = verifyJwt;\nconst jsonwebtoken_1 = __importDefault(__webpack_require__(/*! jsonwebtoken */ \"jsonwebtoken\"));\nconst env_1 = __webpack_require__(/*! ../config/env */ \"./src/config/env.ts\");\nfunction signJwt(payload) {\n    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, { expiresIn: \"30d\" });\n}\nfunction verifyJwt(token) {\n    try {\n        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);\n    }\n    catch {\n        return null;\n    }\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/lib/jwt.ts?\n}");

/***/ }),

/***/ "./src/lib/mailer.ts":
/*!***************************!*\
  !*** ./src/lib/mailer.ts ***!
  \***************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    var desc = Object.getOwnPropertyDescriptor(m, k);\n    if (!desc || (\"get\" in desc ? !m.__esModule : desc.writable || desc.configurable)) {\n      desc = { enumerable: true, get: function() { return m[k]; } };\n    }\n    Object.defineProperty(o, k2, desc);\n}) : (function(o, m, k, k2) {\n    if (k2 === undefined) k2 = k;\n    o[k2] = m[k];\n}));\nvar __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {\n    Object.defineProperty(o, \"default\", { enumerable: true, value: v });\n}) : function(o, v) {\n    o[\"default\"] = v;\n});\nvar __importStar = (this && this.__importStar) || (function () {\n    var ownKeys = function(o) {\n        ownKeys = Object.getOwnPropertyNames || function (o) {\n            var ar = [];\n            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;\n            return ar;\n        };\n        return ownKeys(o);\n    };\n    return function (mod) {\n        if (mod && mod.__esModule) return mod;\n        var result = {};\n        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== \"default\") __createBinding(result, mod, k[i]);\n        __setModuleDefault(result, mod);\n        return result;\n    };\n})();\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.sendOtpEmail = sendOtpEmail;\nconst Brevo = __importStar(__webpack_require__(/*! @getbrevo/brevo */ \"@getbrevo/brevo\"));\nconst env_1 = __webpack_require__(/*! ../config/env */ \"./src/config/env.ts\");\nasync function sendOtpEmail(to, code, purpose) {\n    if (!env_1.env.BREVO.API_KEY) {\n        console.warn(\"⚠️ BREVO_API_KEY missing — DEV OTP:\", code);\n        return;\n    }\n    const api = new Brevo.TransactionalEmailsApi();\n    api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, env_1.env.BREVO.API_KEY);\n    const html = `\r\n    <div style=\"font-family:Inter,Arial,sans-serif;color:#222\">\r\n      <h2>${env_1.env.BREVO.FROM_NAME} ${purpose === \"register\" ? \"Registration\" : \"Login\"} Code</h2>\r\n      <div style=\"font-size:32px;font-weight:700;letter-spacing:6px\">${code}</div>\r\n      <p>Expires in 10 minutes.</p>\r\n    </div>`;\n    const email = new Brevo.SendSmtpEmail();\n    email.subject = `${env_1.env.BREVO.FROM_NAME} ${purpose === \"register\" ? \"Registration\" : \"Login\"} Code`;\n    email.htmlContent = html;\n    email.sender = { name: env_1.env.BREVO.FROM_NAME, email: env_1.env.BREVO.FROM_EMAIL }; // must be verified sender\n    email.to = [{ email: to }];\n    try {\n        await api.sendTransacEmail(email);\n        console.log(`📨 OTP email sent to ${to}`);\n    }\n    catch (err) {\n        const status = err?.response?.status;\n        const data = err?.response?.data || err?.response?.text || err?.message;\n        console.error(\"❌ Brevo sendTransacEmail failed\", { status, data });\n        throw err;\n    }\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/lib/mailer.ts?\n}");

/***/ }),

/***/ "./src/lib/otp.ts":
/*!************************!*\
  !*** ./src/lib/otp.ts ***!
  \************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

eval("{\nvar __importDefault = (this && this.__importDefault) || function (mod) {\n    return (mod && mod.__esModule) ? mod : { \"default\": mod };\n};\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.generateOtp = generateOtp;\nexports.hashOtp = hashOtp;\nexports.verifyOtpHash = verifyOtpHash;\nexports.minutesFromNow = minutesFromNow;\nconst bcryptjs_1 = __importDefault(__webpack_require__(/*! bcryptjs */ \"bcryptjs\"));\nfunction generateOtp(length = 6) {\n    return Math.floor(Math.random() * 10 ** length)\n        .toString()\n        .padStart(length, \"0\");\n}\nasync function hashOtp(otp) {\n    const salt = await bcryptjs_1.default.genSalt(10);\n    return bcryptjs_1.default.hash(otp, salt);\n}\nasync function verifyOtpHash(otp, hash) {\n    return bcryptjs_1.default.compare(otp, hash);\n}\nfunction minutesFromNow(min) {\n    const d = new Date();\n    d.setMinutes(d.getMinutes() + min);\n    return d;\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/lib/otp.ts?\n}");

/***/ }),

/***/ "./src/middlewares/auth.ts":
/*!*********************************!*\
  !*** ./src/middlewares/auth.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.authMiddleware = authMiddleware;\nconst jwt_1 = __webpack_require__(/*! ../lib/jwt */ \"./src/lib/jwt.ts\");\nconst env_1 = __webpack_require__(/*! ../config/env */ \"./src/config/env.ts\");\nfunction authMiddleware(req, res, next) {\n    const token = req.cookies?.[env_1.env.COOKIE_NAME];\n    if (!token)\n        return res.status(401).json({ error: \"Unauthorized\" });\n    const payload = (0, jwt_1.verifyJwt)(token);\n    if (!payload)\n        return res.status(401).json({ error: \"Invalid token\" });\n    req.user = payload;\n    next();\n}\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/middlewares/auth.ts?\n}");

/***/ }),

/***/ "./src/models/Otp.ts":
/*!***************************!*\
  !*** ./src/models/Otp.ts ***!
  \***************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.Otp = void 0;\nconst mongoose_1 = __webpack_require__(/*! mongoose */ \"mongoose\");\nconst otpSchema = new mongoose_1.Schema({\n    email: { type: String, required: true, index: true },\n    otpHash: { type: String, required: true },\n    purpose: { type: String, enum: [\"register\", \"login\"], required: true, index: true },\n    expiresAt: { type: Date, required: true, index: true },\n    attempts: { type: Number, default: 0 }\n}, { timestamps: true });\n// TTL auto-delete after expiresAt\notpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });\nexports.Otp = (0, mongoose_1.model)(\"Otp\", otpSchema);\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/models/Otp.ts?\n}");

/***/ }),

/***/ "./src/models/User.ts":
/*!****************************!*\
  !*** ./src/models/User.ts ***!
  \****************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nexports.User = void 0;\nconst mongoose_1 = __webpack_require__(/*! mongoose */ \"mongoose\");\nconst userSchema = new mongoose_1.Schema({\n    email: { type: String, required: true, unique: true, index: true },\n    name: { type: String }\n}, { timestamps: true });\nexports.User = (0, mongoose_1.model)(\"User\", userSchema);\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/models/User.ts?\n}");

/***/ }),

/***/ "./src/routes/auth.route.ts":
/*!**********************************!*\
  !*** ./src/routes/auth.route.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

eval("{\nObject.defineProperty(exports, \"__esModule\", ({ value: true }));\nconst express_1 = __webpack_require__(/*! express */ \"express\");\nconst auth_controller_1 = __webpack_require__(/*! ../controllers/auth.controller */ \"./src/controllers/auth.controller.ts\");\nconst auth_1 = __webpack_require__(/*! ../middlewares/auth */ \"./src/middlewares/auth.ts\");\nconst router = (0, express_1.Router)();\nrouter.post(\"/register/request-otp\", auth_controller_1.registerRequestOtp);\nrouter.post(\"/register/verify-otp\", auth_controller_1.registerVerifyOtp);\nrouter.post(\"/login/request-otp\", auth_controller_1.loginRequestOtp);\nrouter.post(\"/login/verify-otp\", auth_controller_1.loginVerifyOtp);\nrouter.get(\"/session\", auth_controller_1.session);\nrouter.get(\"/me\", auth_1.authMiddleware, auth_controller_1.me);\nrouter.post(\"/logout\", auth_controller_1.logout);\nexports[\"default\"] = router; // ✅\n\n\n//# sourceURL=webpack://bravo-auth-backend/./src/routes/auth.route.ts?\n}");

/***/ }),

/***/ "@getbrevo/brevo":
/*!**********************************!*\
  !*** external "@getbrevo/brevo" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("@getbrevo/brevo");

/***/ }),

/***/ "bcryptjs":
/*!***************************!*\
  !*** external "bcryptjs" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("bcryptjs");

/***/ }),

/***/ "cookie-parser":
/*!********************************!*\
  !*** external "cookie-parser" ***!
  \********************************/
/***/ ((module) => {

module.exports = require("cookie-parser");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/***/ ((module) => {

module.exports = require("cors");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/***/ ((module) => {

module.exports = require("express");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/***/ ((module) => {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "mongoose":
/*!***************************!*\
  !*** external "mongoose" ***!
  \***************************/
/***/ ((module) => {

module.exports = require("mongoose");

/***/ }),

/***/ "serverless-http":
/*!**********************************!*\
  !*** external "serverless-http" ***!
  \**********************************/
/***/ ((module) => {

module.exports = require("serverless-http");

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
/******/ 	__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ 
/******/ // startup
/******/ // Load entry module and return exports
/******/ // This entry module is referenced by other modules so it can't be inlined
/******/ var __webpack_exports__ = __webpack_require__("./src/handler.ts");
/******/ export { __webpack_exports__ as default };
/******/ 
