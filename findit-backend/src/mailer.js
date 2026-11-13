import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;

// Only set up real email if all the settings are present
const transporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT || 587),
        secure: Number(SMTP_PORT) === 465,
        auth: { user: SMTP_USER, pass: SMTP_PASS },
      })
    : null;

export async function sendResetEmail(to, link) {
  // No email settings: print the link in the server terminal instead
  if (!transporter) {
    console.log(`\n[DEV] Password reset link for ${to}:\n${link}\n`);
    return;
  }

  await transporter.sendMail({
    from: MAIL_FROM || SMTP_USER,
    to,
    subject: "Reset your FindIt password",
    text:
      "Someone asked to reset the password for your FindIt account.\n\n" +
      `Open this link to choose a new password (valid for 30 minutes):\n${link}\n\n` +
      "If this wasn't you, ignore this email. Your password stays the same.",
  });
}