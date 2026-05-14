import { mockProducts } from "../data/mockData.js";

export const fallbackProductBySlug = (slug) =>
  mockProducts.find((product) => product.slug === slug);

export const fallbackRelatedProducts = (product) =>
  mockProducts.filter(
    (item) =>
      item.slug !== product.slug &&
      item.category?.slug === product.category?.slug,
  );
