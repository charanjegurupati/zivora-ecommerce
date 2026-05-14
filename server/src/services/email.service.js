import nodemailer from "nodemailer";

let transporter;

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
    });

    return transporter;
  }

  transporter = nodemailer.createTransport({
    jsonTransport: true,
  });

  return transporter;
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

  const mailer = await getTransporter();

  return mailer.sendMail({
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

  const mailer = await getTransporter();
  
  // Hardcode FRONTEND_ORIGIN to the local URL for development mode
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const verificationLink = `${frontendOrigin}/verify-email?token=${token}&email=${encodeURIComponent(to)}`;

  const result = await mailer.sendMail({
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
  
  // For development testing without SMTP setup, log the link to the terminal
  if (mailer.transporter?.name === 'JSONTransport') {
    console.log("-----------------------------------------");
    console.log(`[EMAIL SIMULATOR] Sent to ${to}`);
    console.log(`[EMAIL SIMULATOR] Verification Link: ${verificationLink}`);
    console.log("-----------------------------------------");
  }

  return result;
};

export const sendEmailOtp = async ({ to, customerName, otp }) => {
  if (!to) {
    return null;
  }

  const mailer = await getTransporter();

  const result = await mailer.sendMail({
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
  
  if (mailer.transporter?.name === 'JSONTransport') {
    console.log("-----------------------------------------");
    console.log(`[EMAIL SIMULATOR] Sent OTP to ${to}`);
    console.log(`[EMAIL SIMULATOR] OTP Code: ${otp}`);
    console.log("-----------------------------------------");
  }

  return result;
};

export const sendPasswordResetEmail = async ({ to, customerName, token }) => {
  if (!to) {
    return null;
  }

  const mailer = await getTransporter();
  
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";
  const resetLink = `${frontendOrigin}/reset-password?token=${token}&email=${encodeURIComponent(to)}`;

  const result = await mailer.sendMail({
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
  
  if (mailer.transporter?.name === 'JSONTransport') {
    console.log("-----------------------------------------");
    console.log(`[EMAIL SIMULATOR] Sent Password Reset to ${to}`);
    console.log(`[EMAIL SIMULATOR] Reset Link: ${resetLink}`);
    console.log("-----------------------------------------");
  }

  return result;
};
