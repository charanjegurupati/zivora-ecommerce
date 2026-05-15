import express from "express";
import { body } from "express-validator";
import {
  login,
  logout,
  me,
  refresh,
  register,
  updateMe,
  verifyOtp,
  resendOtp,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = express.Router();

const emailRule = body("email").isEmail().withMessage("Valid email is required");
const passwordRule = body("password")
  .isLength({ min: 8 })
  .withMessage("Password must be at least 8 characters");

router.post(
  "/register",
  [
    body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
    emailRule,
    passwordRule,
    body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
  ],
  validateRequest,
  register,
);

router.post(
  "/login",
  [emailRule, body("password").notEmpty().withMessage("Password is required")],
  validateRequest,
  login,
);

router.post("/refresh", refresh);
router.post("/logout", logout);
router.get("/me", verifyToken, me);
router.patch("/me", verifyToken, updateMe);

router.post(
  "/verify-otp",
  [
    body("userId").isMongoId().withMessage("Valid user id is required"),
    body("otp").isLength({ min: 6, max: 6 }).withMessage("OTP must be 6 digits"),
  ],
  validateRequest,
  verifyOtp,
);

router.post(
  "/resend-otp",
  [body("userId").isMongoId().withMessage("Valid user id is required")],
  validateRequest,
  resendOtp,
);

router.post(
  "/verify-email",
  [
    emailRule,
    body("token").notEmpty().withMessage("Token is required"),
  ],
  validateRequest,
  verifyEmail,
);

router.post(
  "/resend-verification-email",
  [emailRule],
  validateRequest,
  resendVerificationEmail,
);

router.post(
  "/forgot-password",
  [emailRule],
  validateRequest,
  forgotPassword,
);

router.post(
  "/reset-password",
  [
    emailRule,
    body("token").notEmpty().withMessage("Reset token is required"),
    body("newPassword")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters"),
  ],
  validateRequest,
  resetPassword,
);

export default router;
