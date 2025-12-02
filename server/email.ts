import nodemailer from "nodemailer";

// Create transporter based on environment
const createTransporter = () => {
  // For development, use console logging
  if (process.env.NODE_ENV === "development" && !process.env.SMTP_HOST) {
    return {
      sendMail: async (options: any) => {
        console.log("=== EMAIL (Development) ===");
        console.log("To:", options.to);
        console.log("Subject:", options.subject);
        console.log("Text:", options.text);
        console.log("HTML:", options.html);
        console.log("========================");
        return { messageId: "dev-" + Date.now() };
      },
    };
  }

  // For production or when SMTP is configured
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

const transporter = createTransporter();

const getBaseUrl = () => {
  if (process.env.BASE_URL) {
    return process.env.BASE_URL;
  }
  if (process.env.NODE_ENV === "production") {
    return "https://yourdomain.com";
  }
  return "http://localhost:5000";
};

export async function sendVerificationEmail(
  email: string,
  token: string,
  firstName: string
): Promise<void> {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/verify-email?token=${token}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .button { display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { margin-top: 30px; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Сәлем, ${firstName}!</h2>
        <p>Компьютерлік сауаттылық платформасына қош келдіңіз!</p>
        <p>Тіркелуді аяқтау үшін төмендегі батырманы басыңыз немесе сілтемені ашыңыз:</p>
        <a href="${verificationUrl}" class="button">Email растау</a>
        <p>Немесе мына сілтемені көшіріп, браузерге қойыңыз:</p>
        <p style="word-break: break-all;">${verificationUrl}</p>
        <p>Егер сіз тіркелмеген болсаңыз, бұл хатты елемеңіз.</p>
        <div class="footer">
          <p>Бұл хат автоматты түрде жіберілді. Оған жауап бермеңіз.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const text = `
Сәлем, ${firstName}!

Компьютерлік сауаттылық платформасына қош келдіңіз!

Тіркелуді аяқтау үшін мына сілтемені ашыңыз:
${verificationUrl}

Егер сіз тіркелмеген болсаңыз, бұл хатты елемеңіз.
  `;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@example.com",
    to: email,
    subject: "Email растау - Компьютерлік сауаттылық",
    text,
    html,
  });
}

