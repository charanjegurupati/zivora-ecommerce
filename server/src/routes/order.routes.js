import express from "express";
import { body, param } from "express-validator";
import {
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import { requireRole, verifyToken } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";

const router = express.Router();

router.use(verifyToken);

router.get("/", requireRole("admin"), getAllOrders);

router.post(
  "/",
  [
    body("items").isArray({ min: 1 }).withMessage("Order items are required"),
    body("items.*.product").isMongoId().withMessage("Valid product id is required"),
    body("items.*.qty").isInt({ min: 1 }).withMessage("Quantity must be at least 1"),
    body("shippingAddress.fullName")
      .trim()
      .notEmpty()
      .withMessage("Shipping full name is required"),
    body("shippingAddress.line1")
      .trim()
      .notEmpty()
      .withMessage("Shipping line1 is required"),
    body("shippingAddress.city").trim().notEmpty().withMessage("City is required"),
    body("shippingAddress.state").trim().notEmpty().withMessage("State is required"),
    body("shippingAddress.postalCode")
      .trim()
      .notEmpty()
      .withMessage("Postal code is required"),
    body("shippingAddress.country")
      .trim()
      .notEmpty()
      .withMessage("Country is required"),
    body("paymentMethod")
      .isIn(["card", "cod", "paypal", "upi"])
      .withMessage("Unsupported payment method"),
  ],
  validateRequest,
  createOrder,
);

router.get("/my", getMyOrders);

router.get(
  "/:id",
  [param("id").isMongoId().withMessage("Valid order id is required")],
  validateRequest,
  getOrderById,
);

router.patch(
  "/:id/status",
  requireRole("admin"),
  [
    param("id").isMongoId().withMessage("Valid order id is required"),
    body("orderStatus")
      .optional()
      .isIn(["pending", "processing", "shipped", "delivered", "cancelled"])
      .withMessage("Unsupported order status"),
    body("paymentStatus")
      .optional()
      .isIn(["pending", "paid", "failed", "refunded"])
      .withMessage("Unsupported payment status"),
  ],
  validateRequest,
  updateOrderStatus,
);

export default router;
