import { AppError } from "../utils/appError.js";

const handleCastError = (error) =>
  new AppError(`Invalid value for ${error.path}`, 400);

const handleDuplicateFields = (error) => {
  const duplicatedField = Object.keys(error.keyValue || {})[0];
  return new AppError(`${duplicatedField} already exists`, 409);
};

const handleValidationError = (error) =>
  new AppError(
    "Validation failed",
    400,
    Object.values(error.errors).map((item) => item.message),
  );

const handleJwtError = () => new AppError("Invalid or expired token", 401);

const normalizeError = (error) => {
  if (error.name === "CastError") {
    return handleCastError(error);
  }

  if (error.code === 11000) {
    return handleDuplicateFields(error);
  }

  if (error.name === "ValidationError") {
    return handleValidationError(error);
  }

  if (error.name === "JsonWebTokenError" || error.name === "TokenExpiredError") {
    return handleJwtError();
  }

  return error;
};

export const notFound = (req, _res, next) =>
  next(new AppError(`Route ${req.originalUrl} not found`, 404));

export const errorHandler = (error, _req, res, next) => {
  void next;
  const normalized =
    error instanceof AppError ? error : normalizeError(error) || error;

  const statusCode = normalized.statusCode || 500;
  const status = normalized.status || "error";

  if (!normalized.isOperational && process.env.NODE_ENV === "production") {
    console.error(error);
    return res.status(500).json({
      status: "error",
      message: "Something went wrong",
    });
  }

  return res.status(statusCode).json({
    status,
    message: normalized.message || "Internal server error",
    details: normalized.details || undefined,
    stack: process.env.NODE_ENV === "production" ? undefined : normalized.stack,
  });
};
