import crypto from "node:crypto";
import jwt from "jsonwebtoken";

const getJwtSecret = (name) => {
  const secret = process.env[name];

  if (!secret) {
    throw new Error(`${name} is required`);
  }

  return secret;
};

const buildPayload = (user, extra = {}) => ({
  sub: user._id.toString(),
  role: user.role,
  email: user.email,
  ...extra,
});

export const signAccessToken = (user) =>
  jwt.sign(buildPayload(user), getJwtSecret("JWT_ACCESS_SECRET"), {
    expiresIn: "15m",
  });

export const signRefreshToken = (user) => {
  const tokenId = crypto.randomUUID();
  const token = jwt.sign(
    buildPayload(user, { jti: tokenId, type: "refresh" }),
    getJwtSecret("JWT_REFRESH_SECRET"),
    { expiresIn: "7d" },
  );

  return { token, tokenId };
};

export const verifyAccessToken = (token) =>
  jwt.verify(token, getJwtSecret("JWT_ACCESS_SECRET"));

export const verifyRefreshToken = (token) =>
  jwt.verify(token, getJwtSecret("JWT_REFRESH_SECRET"));
