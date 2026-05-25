import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

const checkUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`Connecting to: ${mongoUri.replace(/:([^@:]+)@/, ":***@")}`); // Hide password in logs
    
    await connectDB(mongoUri);
    
    const count = await User.countDocuments();
    console.log(`\n📊 Total users in database: ${count}`);
    
    if (count > 0) {
      const users = await User.find({}, { name: 1, email: 1, role: 1, isEmailVerified: 1, isActive: 1 });
      
      console.log("\n👥 Registered Users:");
      console.table(users.map(u => ({
        Name: u.name,
        Email: u.email,
        Role: u.role,
        Verified: u.isEmailVerified,
        Active: u.isActive
      })));
    } else {
      console.log("\n⚠️ No users found in the database.");
    }
  } catch (error) {
    console.error("❌ Failed to query database:", error);
  } finally {
    await mongoose.connection.close();
  }
};

checkUsers();
