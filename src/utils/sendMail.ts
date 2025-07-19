import nodemailer, { Transporter } from "nodemailer";
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
export const sendPasswordMail = async ({
  to,
  name,
  password,
}: {
  to: string;
  name: string;
  password: string;
}): Promise<boolean> => {
  const smtpConfigs: SmtpConfig[] = await findAllSmtp();

  if (!smtpConfigs || smtpConfigs.length === 0) {
    throw new Error(" No SMTP configuration found");
  }

  const mailOptionsTemplate = {
    to,
    subject: "Welcome to Our App!",
    html: `<h2>Hi ${name},</h2><p>Your account has been created successfully! Your password is: <strong>${password}</strong></p>`,
  };

  let lastError: unknown = null;

  for (const smtpConfig of smtpConfigs) {
    // You must calculate secure value if not provided
    const configWithSecure: SmtpConfig = {
      ...smtpConfig,
      secure: smtpConfig.port === 465, // infer secure if needed
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
