import crypto from "crypto";
import jwt from "jsonwebtoken";

import { TokenBlocklist } from "../models/TokenBlocklist.js";
import { User } from "../models/User.js";
import { VerificationToken } from "../models/VerificationToken.js";

import { getRefreshCookieOptions } from "../utils/cookies.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { serializeUser } from "../utils/serialization.js";

import {
  sendEmailOtp,
  sendVerificationEmail,
  sendPasswordResetEmail,
} from "../services/email.service.js";

import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/tokens.js";

const sendAuthResponse = (res, user, statusCode = 200) => {
  const accessToken = signAccessToken(user);

  const { token: refreshToken } = signRefreshToken(user);

  res.cookie(
    "refreshToken",
    refreshToken,
    getRefreshCookieOptions()
  );

  return res.status(statusCode).json({
    status: "success",
    data: {
      accessToken,
      user: serializeUser(user),
    },
  });
};

const blacklistRefreshToken = async (token) => {
  try {
    const decoded = verifyRefreshToken(token);

    await TokenBlocklist.findOneAndUpdate(
      { tokenId: decoded.jti },
      {
        tokenId: decoded.jti,
        user: decoded.sub,
        expiresAt: new Date(decoded.exp * 1000),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    if (
      error instanceof jwt.JsonWebTokenError ||
      error instanceof jwt.TokenExpiredError
    ) {
      return;
    }

    throw error;
  }
};

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    phone,
    avatar,
    address,
  } = req.body;

  const existingUser = await User.findOne({
    email: email.toLowerCase(),
  });

  if (existingUser) {
    throw new AppError("Email already exists", 409);
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    avatar,
    address,
    role: "customer",
  });

  const emailToken = crypto
    .randomBytes(32)
    .toString("hex");

  await VerificationToken.create({
    userId: user._id,
    token: emailToken,
    type: "email",
    expiresAt: new Date(
      Date.now() + 10 * 60 * 1000
    ),
  });

  await sendVerificationEmail({
    to: user.email,
    customerName: user.name,
    token: emailToken,
  });

  return res.status(201).json({
    status: "success",
    message:
      "Registration successful. Please check your email to verify your account.",
    data: {
      userId: user._id,
      requiresEmailVerification: true,
    },
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError(
      "Invalid email or password",
      401
    );
  }

  if (!user.isActive) {
    throw new AppError(
      "Account is deactivated",
      403
    );
  }

  if (!user.isEmailVerified) {
    throw new AppError(
      "Please verify your email address before logging in.",
      403
    );
  }

  const otp = createOtp();

  await VerificationToken.deleteMany({
    userId: user._id,
    type: "email_otp",
  });

  await VerificationToken.create({
    userId: user._id,
    token: otp,
    type: "email_otp",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmailOtp({
    to: user.email,
    customerName: user.name,
    otp,
  });

  return res.json({
    status: "success",
    data: {
      requiresOtp: true,
      userId: user._id,
      email: user.email,
    },
  });
});

export const verifyEmail = asyncHandler(async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  const tokenDoc =
    await VerificationToken.findOne({
      userId: user._id,
      type: "email",
    });

  if (
    !tokenDoc ||
    !(await tokenDoc.compareToken(token))
  ) {
    throw new AppError(
      "Invalid or expired verification link",
      400
    );
  }

  user.isEmailVerified = true;

  await user.save();

  await VerificationToken.deleteOne({
    _id: tokenDoc._id,
  });

  return res.json({
    status: "success",
    message:
      "Email verified successfully. You can now log in.",
  });
});

export const resendVerificationEmail =
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError(
        "Email is required",
        400
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.json({
        status: "success",
        message:
          "If the email is registered, a new verification link has been sent.",
      });
    }

    if (user.isEmailVerified) {
      throw new AppError(
        "Email is already verified",
        400
      );
    }

    const emailToken = crypto
      .randomBytes(32)
      .toString("hex");

    await VerificationToken.deleteMany({
      userId: user._id,
      type: "email",
    });

    await VerificationToken.create({
      userId: user._id,
      token: emailToken,
      type: "email",
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    });

    await sendVerificationEmail({
      to: user.email,
      customerName: user.name,
      token: emailToken,
    });

    return res.json({
      status: "success",
      message:
        "If the email is registered, a new verification link has been sent.",
    });
  });

const createOtp = () => crypto.randomInt(100000, 1000000).toString();

export const verifyOtp = asyncHandler(async (req, res) => {
  const { userId, otp } = req.body;

  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError("User account is not available", 401);
  }

  const tokenDoc = await VerificationToken.findOne({
    userId: user._id,
    type: "email_otp",
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc || !(await tokenDoc.compareToken(otp))) {
    throw new AppError("Invalid or expired OTP", 400);
  }

  await VerificationToken.deleteOne({ _id: tokenDoc._id });

  return sendAuthResponse(res, user);
});

export const resendOtp = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const user = await User.findById(userId);

  if (!user || !user.isActive) {
    throw new AppError("User account is not available", 401);
  }

  const otp = createOtp();

  await VerificationToken.deleteMany({
    userId: user._id,
    type: "email_otp",
  });

  await VerificationToken.create({
    userId: user._id,
    token: otp,
    type: "email_otp",
    expiresAt: new Date(Date.now() + 10 * 60 * 1000),
  });

  await sendEmailOtp({
    to: user.email,
    customerName: user.name,
    otp,
  });

  return res.json({
    status: "success",
    message: "OTP sent successfully.",
  });
});

export const forgotPassword = asyncHandler(
  async (req, res) => {
    const { email } = req.body;

    if (!email) {
      throw new AppError(
        "Email is required",
        400
      );
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      return res.json({
        status: "success",
        message:
          "If the email is registered, a password reset link has been sent.",
      });
    }

    const resetToken = crypto
      .randomBytes(32)
      .toString("hex");

    await VerificationToken.deleteMany({
      userId: user._id,
      type: "password_reset",
    });

    await VerificationToken.create({
      userId: user._id,
      token: resetToken,
      type: "password_reset",
      expiresAt: new Date(
        Date.now() + 10 * 60 * 1000
      ),
    });

    await sendPasswordResetEmail({
      to: user.email,
      customerName: user.name,
      token: resetToken,
    });

    return res.json({
      status: "success",
      message:
        "If the email is registered, a password reset link has been sent.",
    });
  }
);

export const resetPassword = asyncHandler(
  async (req, res) => {
    const { email, token, newPassword } =
      req.body;

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    const tokenDoc =
      await VerificationToken.findOne({
        userId: user._id,
        type: "password_reset",
      });

    if (
      !tokenDoc ||
      !(await tokenDoc.compareToken(token))
    ) {
      throw new AppError(
        "Invalid or expired password reset link",
        400
      );
    }

    user.password = newPassword;

    await user.save();

    await VerificationToken.deleteOne({
      _id: tokenDoc._id,
    });

    return res.json({
      status: "success",
      message:
        "Password has been successfully reset. You can now log in.",
    });
  }
);

export const refresh = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError(
      "Refresh token is required",
      401
    );
  }

  const decoded =
    verifyRefreshToken(refreshToken);

  const blacklistedToken =
    await TokenBlocklist.findOne({
      tokenId: decoded.jti,
    });

  if (blacklistedToken) {
    throw new AppError(
      "Refresh token is no longer valid",
      401
    );
  }

  const user = await User.findById(
    decoded.sub
  );

  if (!user || !user.isActive) {
    throw new AppError(
      "User account is not available",
      401
    );
  }

  const accessToken = signAccessToken(user);

  return res.json({
    status: "success",
    data: {
      accessToken,
    },
  });
});

export const logout = asyncHandler(async (req, res) => {
  const refreshToken =
    req.cookies?.refreshToken;

  if (refreshToken) {
    await blacklistRefreshToken(
      refreshToken
    );
  }

  res.clearCookie("refreshToken", {
    ...getRefreshCookieOptions(),
    maxAge: undefined,
  });

  return res.json({
    status: "success",
    message: "Logged out successfully",
  });
});

export const me = asyncHandler(async (req, res) => {
  const user = await User.findById(
    req.user._id
  );

  return res.json({
    status: "success",
    data: {
      user: serializeUser(user),
    },
  });
});

export const updateMe = asyncHandler(
  async (req, res) => {
    const user = await User.findById(
      req.user._id
    );

    if (!user) {
      throw new AppError(
        "User not found",
        404
      );
    }

    const allowedFields = [
      "name",
      "avatar",
      "address",
    ];

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        user[field] = req.body[field];
      }
    });

    await user.save();

    return res.json({
      status: "success",
      data: {
        user: serializeUser(user),
      },
    });
  }
);
