import { useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { SectionHeading } from "../components/common/SectionHeading.jsx";
import { SkeletonCard } from "../components/common/SkeletonCard.jsx";
import { FilterSidebar } from "../components/products/FilterSidebar.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { useDebounce } from "../hooks/useDebounce.js";
import { useProducts } from "../hooks/useProducts.js";

export default function ProductsPage() {
  const [searchParams] = useSearchParams();
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    maxPrice: searchParams.get("maxPrice") || "30000",
    rating: searchParams.get("rating") || "",
    sort: searchParams.get("sort") || "newest",
  });
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const debouncedSearch = useDebounce(search, 300);
  const deferredSearch = useDeferredValue(debouncedSearch);

  const { products, categories, pagination, loading, error } = useProducts({
    category: filters.category,
    maxPrice: filters.maxPrice,
    rating: filters.rating,
    sort: filters.sort,
    search: deferredSearch,
  });

  const updateFilter = (key, value) => {
    setFilters((current) => ({ ...current, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      category: "",
      maxPrice: "30000",
      rating: "",
      sort: "newest",
    });
    setSearch("");
  };

  return (
    <section className="page-section">
      <SectionHeading
        eyebrow="Products"
        title="Browse a filterable catalog with ratings, pricing, and search-ready data."
        description="This page uses debounced search, a deferred query value, and a reusable product hook to keep the experience responsive."
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[300px_1fr]">
        <FilterSidebar
          categories={categories}
          filters={filters}
          onChange={updateFilter}
          onReset={resetFilters}
        />

        <div>
          <div className="surface-panel mb-6 flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none lg:max-w-sm"
              placeholder="Search coats, decor, travel bags..."
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <select
                value={filters.sort}
                onChange={(event) => updateFilter("sort", event.target.value)}
                className="rounded-2xl border border-slate-200 bg-sand-50 px-4 py-3 text-sm outline-none"
              >
                <option value="newest">Newest</option>
                <option value="priceAsc">Price: Low to high</option>
                <option value="priceDesc">Price: High to low</option>
                <option value="rating">Top rated</option>
              </select>
              <p className="text-sm text-slate-500">
                {pagination.total} item{pagination.total === 1 ? "" : "s"} found
              </p>
            </div>
          </div>

          {error ? (
            <div className="mb-6 rounded-[24px] border border-dashed border-honey-400 bg-white/70 px-5 py-4 text-sm text-slate-600">
              {error}
            </div>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {loading
              ? Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)
              : products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
