// src/utils/sendBrevoOtp.ts
import * as Brevo from "@getbrevo/brevo";
import { env } from "../config/env";

export async function sendOtpEmail(
  to: string,
  code: string,
  purpose: "register" | "login"
) {
  if (!env.BREVO.API_KEY) {
    console.warn("⚠️ BREVO_API_KEY missing — DEV OTP:", code);
    return;
  }

  // Brevo v2 SDK (CJS-style) exposes classes on the module namespace
  const api = new (Brevo as any).TransactionalEmailsApi();

  // Support both auth styles used across v2.x releases:
  if (typeof api.setApiKey === "function") {
    // Older v2 signature
    api.setApiKey((Brevo as any).TransactionalEmailsApiApiKeys.apiKey, env.BREVO.API_KEY);
  } else if (api?.authentications?.apiKey) {
    // Newer v2 signature
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
  email.sender = { name: env.BREVO.FROM_NAME, email: env.BREVO.FROM_EMAIL }; // must be a verified sender
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
