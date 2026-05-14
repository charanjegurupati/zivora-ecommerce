import express from "express";
import { body, param } from "express-validator";
import {
  createProduct,
  deleteProduct,
  getProductBySlug,
  getProducts,
  searchProducts,
  updateProduct,
} from "../controllers/product.controller.js";
import { requireRole, verifyToken } from "../middleware/auth.middleware.js";
import { uploadProductImages } from "../middleware/upload.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import reviewRoutes from "./review.routes.js";

const router = express.Router();

router.use("/:productId/reviews", reviewRoutes);

router.get("/search", searchProducts);

router
  .route("/")
  .get(getProducts)
  .post(
    verifyToken,
    requireRole("admin"),
    uploadProductImages,
    [
      body("name").trim().isLength({ min: 3 }).withMessage("Name is required"),
      body("description")
        .trim()
        .isLength({ min: 20 })
        .withMessage("Description must be at least 20 characters"),
      body("price").isFloat({ min: 0 }).withMessage("Price must be a positive number"),
      body("discountPrice")
        .optional({ values: "falsy" })
        .isFloat({ min: 0 })
        .withMessage("Discount price must be a positive number"),
      body("category").isMongoId().withMessage("Valid category is required"),
      body("stock").isInt({ min: 0 }).withMessage("Stock must be zero or greater"),
    ],
    validateRequest,
    createProduct,
  );

router.get("/:slug", getProductBySlug);

router
  .route("/:id")
  .put(
    verifyToken,
    requireRole("admin"),
    uploadProductImages,
    [param("id").isMongoId().withMessage("Valid product id is required")],
    validateRequest,
    updateProduct,
  )
  .delete(
    verifyToken,
    requireRole("admin"),
    [param("id").isMongoId().withMessage("Valid product id is required")],
    validateRequest,
    deleteProduct,
  );

export default router;
