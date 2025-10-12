"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./config/env");
const auth_route_1 = __importDefault(require("./routes/auth.route"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: env_1.env.FRONTEND_URL, // e.g. https://app.yourdomain.com
    credentials: true
}));
app.use(express_1.default.json());
app.use((0, cookie_parser_1.default)());
// health check
app.get("/health", (_req, res) => res.json({ ok: true }));
// auth routes
app.use("/auth", auth_route_1.default);
exports.default = app;
