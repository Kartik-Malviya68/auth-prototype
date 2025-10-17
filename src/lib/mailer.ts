// src/lib/mailer.ts
import * as Brevo from "@getbrevo/brevo";
import { env } from "../config/env";

function normalizeSenderEmail(raw: string) {
  if (!raw) return raw;
  const m = raw.match(/<([^>]+)>/); // "Name <you@x.com>" -> "you@x.com"
  return (m ? m[1] : raw).trim();
}

function isEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "register" | "login"
) {
  if (!env.BREVO.API_KEY) {
    console.warn("⚠️ BREVO_API_KEY missing — DEV OTP:", code);
    return;
  }

  const senderEmail = normalizeSenderEmail(env.BREVO.FROM_EMAIL);
  if (!senderEmail || !isEmail(senderEmail)) {
    console.error(
      "❌ BREVO_FROM_EMAIL invalid. Use a plain verified address like you@domain.com (no < >)."
    );
    return;
  }

  const api = new (Brevo as any).TransactionalEmailsApi();
  if (typeof api.setApiKey === "function") {
    // older v2 builds
    api.setApiKey((Brevo as any).TransactionalEmailsApiApiKeys.apiKey, env.BREVO.API_KEY);
  } else if (api?.authentications?.apiKey) {
    // newer v2 builds
    api.authentications.apiKey.apiKey = env.BREVO.API_KEY;
  } else {
    throw new Error("Brevo API key binding failed — SDK shape not recognized.");
  }

  const subject = `${env.BREVO.FROM_NAME} ${purpose === "register" ? "Registration" : "Login"} Code`;
  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#222">
      <h2>${subject}</h2>
      <div style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</div>
      <p>Expires in 10 minutes.</p>
    </div>`;

  const email = new (Brevo as any).SendSmtpEmail();
  email.subject = subject;
  email.htmlContent = html;
  email.sender = { name: env.BREVO.FROM_NAME, email: senderEmail }; // MUST be verified in Brevo
  email.replyTo = { name: env.BREVO.FROM_NAME, email: senderEmail };
  email.to = [{ email: to }];

  try {
    await api.sendTransacEmail(email);
    console.log(`📨 OTP email sent to ${to}`);
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data ?? err?.response?.text ?? err?.message;
    console.error("❌ Brevo sendTransacEmail failed", { status, data });
    throw err;
  }
}
