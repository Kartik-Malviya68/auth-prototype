import * as Brevo from "@getbrevo/brevo";
import { env } from "../config/env";

export async function sendOtpEmail(to: string, code: string, purpose: "register" | "login") {
  if (!env.BREVO.API_KEY) {
    console.warn("⚠️ BREVO_API_KEY missing — DEV OTP:", code);
    return;
  }

  const api = new Brevo.TransactionalEmailsApi();
  api.setApiKey(Brevo.TransactionalEmailsApiApiKeys.apiKey, env.BREVO.API_KEY);

  const html = `
    <div style="font-family:Inter,Arial,sans-serif;color:#222">
      <h2>${env.BREVO.FROM_NAME} ${purpose === "register" ? "Registration" : "Login"} Code</h2>
      <div style="font-size:32px;font-weight:700;letter-spacing:6px">${code}</div>
      <p>Expires in 10 minutes.</p>
    </div>`;

  const email = new Brevo.SendSmtpEmail();
  email.subject = `${env.BREVO.FROM_NAME} ${purpose === "register" ? "Registration" : "Login"} Code`;
  email.htmlContent = html;
  email.sender = { name: env.BREVO.FROM_NAME, email: env.BREVO.FROM_EMAIL }; // must be verified sender
  email.to = [{ email: to }];

  try {
    await api.sendTransacEmail(email);
    console.log(`📨 OTP email sent to ${to}`);
  } catch (err: any) {
    const status = err?.response?.status;
    const data = err?.response?.data || err?.response?.text || err?.message;
    console.error("❌ Brevo sendTransacEmail failed", { status, data });
    throw err;
  }
}
