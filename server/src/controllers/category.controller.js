import { Category } from "../models/Category.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getCategories = asyncHandler(async (_req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 });

  return res.json({
    status: "success",
    data: {
      categories,
    },
  });
});
