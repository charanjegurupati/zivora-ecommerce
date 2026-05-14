import mongoose from "mongoose";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { Review } from "../models/Review.js";
import { AppError } from "../utils/appError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadProductImages as uploadImagesToCloudinary } from "../utils/cloudinary.js";
import { getPagination, getProductFilters, getProductSort } from "../utils/query.js";
import { escapeRegex } from "../utils/regex.js";

const normalizeTags = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => `${item}`.trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const normalizeImages = (value) => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) =>
        typeof item === "string"
          ? { url: item, alt: "Product image", publicId: null }
          : item,
      )
      .filter((item) => item.url);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return normalizeImages(parsed);
    } catch {
      return [{ url: value, alt: "Product image", publicId: null }];
    }
  }

  return [];
};

const ensureCategory = async (categoryId) => {
  if (!mongoose.isValidObjectId(categoryId)) {
    throw new AppError("Invalid category id", 400);
  }

  const category = await Category.findById(categoryId);

  if (!category) {
    throw new AppError("Category not found", 404);
  }

  return category;
};

export const getProducts = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filters = getProductFilters(req.query);
  const sort = getProductSort(req.query.sort);

  if (req.query.category && !mongoose.isValidObjectId(req.query.category)) {
    const categoryDoc = await Category.findOne({ slug: req.query.category });
    if (categoryDoc) {
      filters.category = categoryDoc._id;
    } else {
      return res.json({
        status: "success",
        data: {
          products: [],
          pagination: { page, limit, total: 0, pages: 1 },
        },
      });
    }
  }

  const [products, total] = await Promise.all([
    Product.find(filters)
      .populate("category", "name slug")
      .populate("seller", "name avatar")
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filters),
  ]);

  return res.json({
    status: "success",
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export const searchProducts = asyncHandler(async (req, res) => {
  const query = `${req.query.q || ""}`.trim();
  const { page, limit, skip } = getPagination(req.query);

  if (!query) {
    return res.json({
      status: "success",
      data: {
        products: [],
        pagination: { page, limit, total: 0, pages: 0 },
      },
    });
  }

  const fuzzyPattern = query
    .split(/\s+/)
    .map((term) => escapeRegex(term))
    .join("|");

  const fuzzyClauses = [
    { name: { $regex: fuzzyPattern, $options: "i" } },
    { description: { $regex: fuzzyPattern, $options: "i" } },
    { tags: { $regex: fuzzyPattern, $options: "i" } },
  ];

  let products;
  let total;

  try {
    const searchFilter = {
      isActive: true,
      $or: [{ $text: { $search: query } }, ...fuzzyClauses],
    };

    [products, total] = await Promise.all([
      Product.find(searchFilter, { score: { $meta: "textScore" } })
        .populate("category", "name slug")
        .populate("seller", "name avatar")
        .sort({ score: { $meta: "textScore" }, "ratings.average": -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(searchFilter),
    ]);
  } catch {
    const fallbackFilter = {
      isActive: true,
      $or: fuzzyClauses,
    };

    [products, total] = await Promise.all([
      Product.find(fallbackFilter)
        .populate("category", "name slug")
        .populate("seller", "name avatar")
        .sort({ "ratings.average": -1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(fallbackFilter),
    ]);
  }

  return res.json({
    status: "success",
    data: {
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit) || 1,
      },
    },
  });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  })
    .populate("category", "name slug description")
    .populate("seller", "name avatar role")
    .populate({
      path: "reviews",
      options: {
        sort: { createdAt: -1 },
        limit: 6,
      },
      populate: {
        path: "user",
        select: "name avatar",
      },
    });

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  const [reviewsCount, relatedProducts] = await Promise.all([
    Review.countDocuments({ product: product._id }),
    Product.find({
      _id: { $ne: product._id },
      category: product.category?._id || product.category,
      isActive: true,
    })
      .sort({ isFeatured: -1, "ratings.average": -1 })
      .limit(4)
      .populate("category", "name slug"),
  ]);

  return res.json({
    status: "success",
    data: {
      product,
      relatedProducts,
      reviewsCount,
    },
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    discountPrice,
    category,
    stock,
    isFeatured,
  } = req.body;

  await ensureCategory(category);

  const [uploadedImages] = await Promise.all([
    uploadImagesToCloudinary(req.files || []),
  ]);

  const product = await Product.create({
    name,
    description,
    price,
    discountPrice: discountPrice || null,
    category,
    images: uploadedImages.length ? uploadedImages : normalizeImages(req.body.images),
    stock,
    seller: req.user._id,
    tags: normalizeTags(req.body.tags),
    isFeatured: isFeatured === true || isFeatured === "true",
  });

  const populatedProduct = await Product.findById(product._id)
    .populate("category", "name slug")
    .populate("seller", "name avatar");

  return res.status(201).json({
    status: "success",
    data: {
      product: populatedProduct,
    },
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid product id", 400);
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  if (req.body.category) {
    await ensureCategory(req.body.category);
  }

  const uploadedImages = await uploadImagesToCloudinary(req.files || []);

  const updates = {
    ...req.body,
    tags: req.body.tags ? normalizeTags(req.body.tags) : product.tags,
    images:
      uploadedImages.length > 0
        ? uploadedImages
        : req.body.images
          ? normalizeImages(req.body.images)
          : product.images,
  };

  Object.entries(updates).forEach(([key, value]) => {
    if (value !== undefined) {
      product[key] = value;
    }
  });

  await product.save();

  const updatedProduct = await Product.findById(product._id)
    .populate("category", "name slug")
    .populate("seller", "name avatar");

  return res.json({
    status: "success",
    data: {
      product: updatedProduct,
    },
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw new AppError("Invalid product id", 400);
  }

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true },
  );

  if (!product) {
    throw new AppError("Product not found", 404);
  }

  return res.json({
    status: "success",
    message: "Product archived successfully",
  });
});
