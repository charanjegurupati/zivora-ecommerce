import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { User } from "../models/User.js";

const cleanUsers = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    console.log(`Connecting to: ${mongoUri.replace(/:([^@:]+)@/, ":***@")}`);
    await connectDB(mongoUri);
    
    // Delete all users except those with role: "admin"
    const result = await User.deleteMany({ role: { $ne: "admin" } });
    console.log(`\n🧹 Database Cleaned: Deleted ${result.deletedCount} non-admin users.`);
    
    // List remaining users to confirm
    const remainingAdmins = await User.find({}, { name: 1, email: 1, role: 1, isEmailVerified: 1 });
    console.log("\n👥 Remaining Users in Database (Admins):");
    console.table(remainingAdmins.map(u => ({
      Name: u.name,
      Email: u.email,
      Role: u.role,
      Verified: u.isEmailVerified
    })));
  } catch (error) {
    console.error("❌ Failed to clean database:", error);
  } finally {
    await mongoose.connection.close();
  }
};

cleanUsers();
