import mongoose from "mongoose";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { getPagination } from "../utils/query.js";

export const addReview = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError("Invalid product id", 400);
  }

  const product = await Product.findOne({ _id: productId, isActive: true });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const existingReview = await Review.findOne({
    product: productId,
    user: req.user._id,
  });

  if (existingReview) {
    throw new AppError("You have already reviewed this product", 409);
  }

  const review = await Review.create({
    product: productId,
    user: req.user._id,
    rating: req.body.rating,
    comment: req.body.comment,
  });

  const populatedReview = await Review.findById(review._id).populate(
    "user",
    "name avatar",
  );

  return res.status(201).json({
    status: "success",
    data: {
      review: populatedReview,
    },
  });
});

export const getProductReviews = asyncHandler(async (req, res) => {
  const productId = req.params.productId;
  const { page, limit, skip } = getPagination(req.query);

  if (!mongoose.isValidObjectId(productId)) {
    throw new AppError("Invalid product id", 400);
  }

  const [product, reviews, total] = await Promise.all([
    Product.findById(productId).select("name ratings"),
    Review.find({ product: productId })
      .populate("user", "name avatar")
      .sort({ helpful: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Review.countDocuments({ product: productId }),
  ]);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.json({
    status: "success",
    data: {
      product,
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});
