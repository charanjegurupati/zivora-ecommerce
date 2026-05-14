import { startTransition, useEffect, useState } from "react";
import { api } from "../api/client.js";
import { mockCategories, mockProducts } from "../data/mockData.js";

const filterFallbackProducts = ({
  category,
  maxPrice,
  rating,
  sort,
  search,
  featured,
}) => {
  let products = [...mockProducts];

  if (category) {
    products = products.filter(
      (product) =>
        product.category?._id === category || product.category?.slug === category,
    );
  }

  if (maxPrice) {
    products = products.filter((product) => (product.discountPrice ?? product.price) <= maxPrice);
  }

  if (rating) {
    products = products.filter((product) => product.ratings.average >= rating);
  }

  if (featured) {
    products = products.filter((product) => product.isFeatured);
  }

  if (search) {
    const keyword = search.toLowerCase();
    products = products.filter((product) =>
      `${product.name} ${product.description} ${product.tags.join(" ")}`
        .toLowerCase()
        .includes(keyword),
    );
  }

  const sorters = {
    newest: () => 0,
    priceAsc: (a, b) => (a.discountPrice ?? a.price) - (b.discountPrice ?? b.price),
    priceDesc: (a, b) => (b.discountPrice ?? b.price) - (a.discountPrice ?? a.price),
    rating: (a, b) => b.ratings.average - a.ratings.average,
  };

  if (sorters[sort]) {
    products.sort(sorters[sort]);
  }

  return products;
};

export const useProducts = ({
  page = 1,
  limit = 12,
  category = "",
  maxPrice = "",
  rating = "",
  sort = "newest",
  search = "",
  featured = false,
} = {}) => {
  const [state, setState] = useState({
    products: [],
    categories: [],
    pagination: { page: 1, limit, total: 0, pages: 0 },
    loading: true,
    error: "",
  });

  useEffect(() => {
    let isMounted = true;

    const loadProducts = async () => {
      setState((current) => ({ ...current, loading: true, error: "" }));

      try {
        const endpoint = search ? "/products/search" : "/products";
        const params = search
          ? { q: search, page, limit }
          : {
              page,
              limit,
              category,
              maxPrice,
              rating,
              sort,
              featured,
            };

        const [productsResponse, categoriesResponse] = await Promise.all([
          api.get(endpoint, { params }),
          api.get("/categories"),
        ]);

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setState({
            products: productsResponse.data?.data?.products || [],
            categories: categoriesResponse.data?.data?.categories || [],
            pagination: productsResponse.data?.data?.pagination || {
              page,
              limit,
              total: 0,
              pages: 0,
            },
            loading: false,
            error: "",
          });
        });
      } catch {
        if (!isMounted) {
          return;
        }

        const fallbackProducts = filterFallbackProducts({
          category,
          maxPrice: Number(maxPrice) || 0,
          rating: Number(rating) || 0,
          sort,
          search,
          featured,
        });

        startTransition(() => {
          setState({
            products: fallbackProducts.slice((page - 1) * limit, page * limit),
            categories: mockCategories,
            pagination: {
              page,
              limit,
              total: fallbackProducts.length,
              pages: Math.ceil(fallbackProducts.length / limit),
            },
            loading: false,
            error: "Live catalog unavailable, showing curated preview data.",
          });
        });
      }
    };

    loadProducts();

    return () => {
      isMounted = false;
    };
  }, [category, featured, limit, maxPrice, page, rating, search, sort]);

  return state;
};
