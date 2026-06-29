import nodemailer from "nodemailer";

let transporter;

const getFrontendOrigin = () =>
  (process.env.FRONTEND_ORIGIN || "http://localhost:5173")
    .split(",")[0]
    .trim();

const getTransporter = async () => {
  if (transporter) {
    return transporter;
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    return transporter;
  }

  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  return transporter;
};

// Safe helper to send mail without throwing exceptions that crash the API
const sendMailSafely = async (mailOptions) => {
  const { to, subject, text, from } = mailOptions;

  // 1. If Resend API Key is set, send via Resend HTTP API (avoids SMTP port blocks on Render!)
  if (process.env.RESEND_API_KEY) {
    try {
      console.log(`Sending email to ${to} via Resend HTTP API...`);
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: from || "onboarding@resend.dev",
          to,
          subject,
          text,
        }),
      });

      const data = await response.json();
      
      if (response.ok) {
        console.log(`✅ Success! Email sent via Resend API (ID: ${data.id})`);
        return data;
      } else {
        throw new Error(data.message || JSON.stringify(data));
      }
    } catch (resendError) {
      console.error("❌ Resend API sending failed, falling back to SMTP...", resendError);
    }
  }

  // 2. Fallback to standard SMTP
  const mailer = await getTransporter();
  
  try {
    const result = await mailer.sendMail(mailOptions);
    
    // For development testing or JSONTransport fallback, log the output to terminal
    if (mailer?.transporter?.name === "JSONTransport") {
      console.log("-----------------------------------------");
      console.log(`[EMAIL SIMULATOR] Sent to ${mailOptions.to}`);
      console.log(`[EMAIL SIMULATOR] Subject: ${mailOptions.subject}`);
      console.log(`[EMAIL SIMULATOR] Body:\n${mailOptions.text}`);
      console.log("-----------------------------------------");
    }
    
    return result;
  } catch (error) {
    console.error(`📧 [EMAIL ERROR] Failed to send email to ${mailOptions.to}:`, error);
    
    // Always fallback to logging the details to console so the links are never lost
    console.log("-----------------------------------------");
    console.log(`[EMAIL FALLBACK] Sent to ${mailOptions.to}`);
    console.log(`[EMAIL FALLBACK] Subject: ${mailOptions.subject}`);
    console.log(`[EMAIL FALLBACK] Body:\n${mailOptions.text}`);
    console.log("-----------------------------------------");
    
    return {
      message: "Email sending failed, fell back to console logs",
      error: error.message,
    };
  }
};

export const sendOrderStatusEmail = async ({
  to,
  customerName,
  orderId,
  orderStatus,
  trackingId,
}) => {
  if (!to) {
    return null;
  }

  return sendMailSafely({
    from: process.env.SMTP_FROM || "no-reply@zivora.shop",
    to,
    subject: `Order ${orderId} is now ${orderStatus}`,
    text: [
      `Hi ${customerName || "there"},`,
      "",
      `Your order ${orderId} status changed to ${orderStatus}.`,
      trackingId ? `Tracking ID: ${trackingId}` : null,
      "",
      "Thank you for shopping with Zivora.",
    ]
      .filter(Boolean)
      .join("\n"),
  });
};

export const sendVerificationEmail = async ({ to, customerName, token }) => {
  if (!to) {
    return null;
  }

  const frontendOrigin = getFrontendOrigin();
  const verificationLink = `${frontendOrigin}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  return sendMailSafely({
    from: process.env.SMTP_FROM || "no-reply@zivora.shop",
    to,
    subject: "Zivora: Verify your email address",
    text: [
      `Hi ${customerName || "there"},`,
      "",
      "Please verify your email address by clicking the link below:",
      verificationLink,
      "",
      "If you did not request this, please ignore this email.",
    ].join("\n"),
  });
};

export const sendEmailOtp = async ({ to, customerName, otp }) => {
  if (!to) {
    return null;
  }

  return sendMailSafely({
    from: process.env.SMTP_FROM || "no-reply@zivora.shop",
    to,
    subject: "Zivora: Your Login OTP",
    text: [
      `Hi ${customerName || "there"},`,
      "",
      `Your one-time password (OTP) for login is: ${otp}`,
      "",
      "This code is valid for 10 minutes. If you did not attempt to log in, please secure your account immediately.",
    ].join("\n"),
  });
};

export const sendPasswordResetEmail = async ({ to, customerName, token }) => {
  if (!to) {
    return null;
  }

  const frontendOrigin = getFrontendOrigin();
  const resetLink = `${frontendOrigin}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

  return sendMailSafely({
    from: process.env.SMTP_FROM || "no-reply@zivora.shop",
    to,
    subject: "Zivora: Reset your password",
    text: [
      `Hi ${customerName || "there"},`,
      "",
      "We received a request to reset your password. Click the link below to choose a new one:",
      resetLink,
      "",
      "If you did not request this, you can safely ignore this email. Your password will not change.",
    ].join("\n"),
  });
};
