import mongoose from "mongoose";
import { Product } from "./Product.js";

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 1200,
      default: "",
    },
    helpful: {
      type: Number,
      default: 0,
      min: 0,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

reviewSchema.statics.calculateAverageRating = async function calculateAverageRating(
  productId,
) {
  const [stats] = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
      },
    },
    {
      $group: {
        _id: "$product",
        averageRating: { $avg: "$rating" },
        ratingsCount: { $sum: 1 },
      },
    },
  ]);

  await Product.findByIdAndUpdate(productId, {
    ratings: stats
      ? {
          average: Number(stats.averageRating.toFixed(1)),
          count: stats.ratingsCount,
        }
      : {
          average: 0,
          count: 0,
        },
  });
};

reviewSchema.post("save", async function postSave() {
  await this.constructor.calculateAverageRating(this.product);
});

reviewSchema.post("findOneAndDelete", async function postDelete(doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

reviewSchema.index({ user: 1, product: 1 }, { unique: true });
reviewSchema.index({ product: 1, helpful: -1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);
