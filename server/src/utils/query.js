const parseNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getPagination = (query) => {
  const page = Math.max(parseNumber(query.page, 1), 1);
  const limit = Math.min(Math.max(parseNumber(query.limit, 12), 1), 48);
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

export const getProductFilters = (query) => {
  const filters = { isActive: true };
  const minPrice = parseNumber(query.minPrice, null);
  const maxPrice = parseNumber(query.maxPrice, null);
  const minRating = parseNumber(query.rating, null);

  if (query.category) {
    filters.category = query.category;
  }

  if (minRating !== null) {
    filters["ratings.average"] = { $gte: minRating };
  }

  if (minPrice !== null || maxPrice !== null) {
    filters.price = {};
    if (minPrice !== null) {
      filters.price.$gte = minPrice;
    }
    if (maxPrice !== null) {
      filters.price.$lte = maxPrice;
    }
  }

  if (query.featured === "true") {
    filters.isFeatured = true;
  }

  return filters;
};

export const getProductSort = (sort = "newest") => {
  const sortMap = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { "ratings.average": -1, "ratings.count": -1 },
    featured: { isFeatured: -1, createdAt: -1 },
    stock: { stock: -1 },
  };

  return sortMap[sort] || sortMap.newest;
};
