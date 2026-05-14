import twilio from "twilio";

let twilioClient;

const getTwilioClient = () => {
  if (twilioClient) return twilioClient;

  if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
    twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    return twilioClient;
  }
  
  return null;
};

export const sendSmsOtp = async ({ to, otp }) => {
  if (!to) {
    return null;
  }

  const client = getTwilioClient();

  if (client && process.env.TWILIO_PHONE_NUMBER) {
    try {
      const message = await client.messages.create({
        body: `Your Zivora OTP is: ${otp}`,
        from: process.env.TWILIO_PHONE_NUMBER,
        to,
      });
      return message.sid;
    } catch (error) {
      console.error("[SMS TWILIO ERROR]", error.message);
      // Fallback to simulator if it fails (e.g. unverified number on free tier)
    }
  }

  // Simulator Fallback
  
  console.log("-----------------------------------------");
  console.log(`[SMS SIMULATOR] Sending SMS to ${to}`);
  console.log(`[SMS SIMULATOR] Your Zivora OTP is: ${otp}`);
  console.log("-----------------------------------------");

  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return true;
};
