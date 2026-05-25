import "dotenv/config";
import nodemailer from "nodemailer";

const testEmail = async () => {
  console.log("Testing SMTP Configuration...");
  console.log(`Host: ${process.env.SMTP_HOST}`);
  console.log(`Port: ${process.env.SMTP_PORT}`);
  console.log(`Secure: ${process.env.SMTP_SECURE}`);
  console.log(`User: ${process.env.SMTP_USER}`);
  console.log(`Pass: ${process.env.SMTP_PASS ? "EXISTS (hidden)" : "MISSING"}`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    console.log("\nVerifying SMTP connection...");
    await transporter.verify();
    console.log("✅ Success! SMTP Connection is verified and working perfectly!");
  } catch (error) {
    console.error("\n❌ SMTP Verification Failed!");
    console.error(error);
  }
};

testEmail();
