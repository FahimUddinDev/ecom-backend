import nodemailer, { Transporter } from "nodemailer";
import { SendMailData } from "../../types/usersType";
import { findAllSmtp } from "../modules/smtp/smtp.model";

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  userName: string;
  password: string;
}

// Create a transporter from SMTP config
const createTransporter = ({
  host,
  port,
  secure,
  userName,
  password,
}: SmtpConfig): Transporter => {
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: userName,
      pass: password,
    },
  });
};

// Send password mail with failover SMTP support
export const sendPasswordMail = async (
  data: SendMailData
): Promise<boolean> => {
  const smtpConfigs: SmtpConfig[] = await findAllSmtp();

  if (!smtpConfigs || smtpConfigs.length === 0) {
    throw new Error("No SMTP configuration found");
  }

  if (!data.template || !data.template.body) {
    throw new Error("Email template is required");
  }

  const result = data.template.body.replace(/\$\{(\w+)\}/g, (_, key) => {
    return data[key] ?? "";
  });

  const mailOptionsTemplate = {
    to: data.to,
    subject: data.template.subject || "Your Account Password",
    html: result,
  };

  let lastError: unknown = null;

  for (const smtpConfig of smtpConfigs) {
    const configWithSecure: SmtpConfig = {
      ...smtpConfig,
      secure: smtpConfig.port === 465,
    };

    const transporter = createTransporter(configWithSecure);

    const mailOptions = {
      ...mailOptionsTemplate,
      from: `"Your App" <${smtpConfig.userName}>`,
    };

    try {
      await transporter.sendMail(mailOptions);
      return true;
    } catch (err) {
      console.error(
        `Failed with SMTP: ${smtpConfig.host}`,
        err instanceof Error ? err.message : err
      );
      lastError = err;
    }
  }

  throw new Error(
    "All SMTP servers failed. Last error: " +
      (lastError instanceof Error ? lastError.message : String(lastError))
  );
};
