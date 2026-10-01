import nodemailer, { Transporter } from "nodemailer";

/**
 * Configure a Nodemailer transporter using environment variables.
 * Expected .env variables: EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS.
 */
export function getTransporter(): Transporter {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    secure: Number(process.env.EMAIL_PORT) === 465, // true for 465, false for other ports
  });
}

/**
 * Send an email with the given options.
 * Returns the info object from Nodemailer.
 */
export async function sendMail(options: {
  to: string;
  subject: string;
  html: string;
}): Promise<nodemailer.SentMessageInfo> {
  const transporter = getTransporter();
  return await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: options.to,
    subject: options.subject,
    html: options.html,
  });
}
