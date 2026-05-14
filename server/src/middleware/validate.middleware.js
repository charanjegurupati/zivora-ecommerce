import { validationResult } from "express-validator";
import { AppError } from "../utils/appError.js";

export const validateRequest = (req, _res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  return next(new AppError("Validation failed", 400, result.array()));
};
