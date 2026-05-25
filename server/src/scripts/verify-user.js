import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

const verifyUser = async () => {
  const email = process.argv[2];
  
  if (!email) {
    console.error("❌ Please provide an email address. Example: npm run verify-user test@example.com");
    process.exit(1);
  }

  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`Connecting to: ${mongoUri.replace(/:([^@:]+)@/, ":***@")}`);
    await connectDB(mongoUri);
    
    const user = await User.findOne({ email: email.toLowerCase() });
    
    if (!user) {
      console.error(`❌ User not found with email: ${email}`);
      return;
    }
    
    if (user.isEmailVerified) {
      console.log(`ℹ️ User ${email} is already verified.`);
      return;
    }
    
    user.isEmailVerified = true;
    await user.save();
    
    console.log(`\n✅ Success! User ${email} has been successfully verified in the database.`);
  } catch (error) {
    console.error("❌ Failed to verify user:", error);
  } finally {
    await mongoose.connection.close();
  }
};

verifyUser();
