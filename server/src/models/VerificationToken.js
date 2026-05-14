import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const verificationTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  token: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["email", "email_otp", "password_reset"],
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: "10m" },
  },
});

verificationTokenSchema.pre("save", async function preSave(next) {
  if (!this.isModified("token")) {
    return next();
  }

  this.token = await bcrypt.hash(this.token, 10);
  return next();
});

verificationTokenSchema.methods.compareToken = function compareToken(candidateToken) {
  return bcrypt.compare(candidateToken, this.token);
};

export const VerificationToken = mongoose.model("VerificationToken", verificationTokenSchema);
