import express from "express";
import { body } from "express-validator";
import { addReview, getProductReviews } from "../controllers/review.controller.js";
import { verifyToken } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = express.Router({ mergeParams: true });

router
  .route("/")
  .get(getProductReviews)
  .post(
    verifyToken,
    [
      body("rating")
        .isInt({ min: 1, max: 5 })
        .withMessage("Rating must be between 1 and 5"),
      body("comment")
        .optional()
        .isLength({ max: 1200 })
        .withMessage("Comment cannot exceed 1200 characters"),
    ],
    validateRequest,
    addReview,
  );

export default router;
