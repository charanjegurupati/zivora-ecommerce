import mongoose from "mongoose";
import { slugify } from "../utils/slugify.js";

const productImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },
    publicId: {
      type: String,
      trim: true,
      default: null,
    },
    alt: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { _id: false },
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 20,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    discountPrice: {
      type: Number,
      min: 0,
      default: null,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
      index: true,
    },
    images: {
      type: [productImageSchema],
      default: [],
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    ratings: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

productSchema.pre("validate", function preValidate(next) {
  if (this.name) {
    this.slug = slugify(this.name);
  }

  if (
    this.discountPrice !== null &&
    this.discountPrice !== undefined &&
    this.discountPrice > this.price
  ) {
    this.invalidate("discountPrice", "Discount price cannot exceed price");
  }

  next();
});

productSchema.virtual("effectivePrice").get(function getEffectivePrice() {
  return this.discountPrice ?? this.price;
});

productSchema.virtual("discountPercentage").get(function getDiscountPercentage() {
  if (!this.discountPrice || this.discountPrice >= this.price) {
    return 0;
  }

  return Math.round(((this.price - this.discountPrice) / this.price) * 100);
});

productSchema.virtual("reviews", {
  ref: "Review",
  localField: "_id",
  foreignField: "product",
});

productSchema.index({ name: "text", description: "text", tags: "text" });
productSchema.index({ category: 1, price: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, createdAt: -1 });
productSchema.index({ "ratings.average": -1, "ratings.count": -1 });

export const Product = mongoose.model("Product", productSchema);
