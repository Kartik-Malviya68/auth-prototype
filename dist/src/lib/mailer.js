"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendOtpEmail = sendOtpEmail;
const Brevo = __importStar(require("@getbrevo/brevo"));
const env_1 = require("../config/env");
async function sendOtpEmail(to, code, purpose) {
    if (!env_1.env.BREVO.API_KEY) {
        console.warn("⚠️ BREVO_API_KEY missing — DEV OTP:", code);
        return;
    }
    const api = new Brevo.TransactionalEmailsApi();
    api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, env_1.env.BREVO.API_KEY);
    const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#222">
      <h2>${env_1.env.BREVO.FROM_NAME} ${purpose === "register" ? "Registration" : "Login"} Code</h2>
      <div style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</div>
      <p>Expires in 10 minutes.</p>
    </div>`;
    const email = new Brevo.SendSmtpEmail();
    email.subject = `${env_1.env.BREVO.FROM_NAME} ${purpose === "register" ? "Registration" : "Login"} Code`;
    email.htmlContent = html;
    email.sender = { name: env_1.env.BREVO.FROM_NAME, email: env_1.env.BREVO.FROM_EMAIL }; // must be verified sender
    email.to = [{ email: to }];
    try {
        await api.sendTransacEmail(email);
        console.log(`📨 OTP email sent to ${to}`);
    }
    catch (err) {
        const status = err?.response?.status;
        const data = err?.response?.data || err?.response?.text || err?.message;
        console.error("❌ Brevo sendTransacEmail failed", { status, data });
        throw err;
    }
}
