import { ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import { useCart } from "../../hooks/useCart.js";
import { formatCurrency } from "../../utils/currency.js";
import { LazyImage } from "../common/LazyImage.jsx";
import { RatingStars } from "../common/RatingStars.jsx";

export const ProductCard = ({ product }) => {
  const { addItem } = useCart();

  return (
    <article className="surface-panel group overflow-hidden">
      <Link to={`/products/${product.slug}`} className="block overflow-hidden">
        <LazyImage
          src={product.images?.[0]?.url}
          alt={product.images?.[0]?.alt || product.name}
          wrapperClassName="aspect-[4/5] overflow-hidden bg-sand-100"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
              {product.category?.name}
            </p>
            <Link
              to={`/products/${product.slug}`}
              className="mt-2 block text-lg font-semibold text-ink-950 transition hover:text-honey-500"
            >
              {product.name}
            </Link>
          </div>
          {product.isFeatured ? (
            <span className="rounded-full bg-blush-200 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.22em] text-ink-900">
              Featured
            </span>
          ) : null}
        </div>

        <RatingStars
          rating={product.ratings?.average || 0}
          count={product.ratings?.count || 0}
        />

        <div className="flex items-end justify-between gap-4">
          <div className="flex items-center gap-3">
            <p className="text-lg font-semibold text-ink-950">
              {formatCurrency(product.discountPrice ?? product.price)}
            </p>
            {product.discountPrice ? (
              <p className="text-sm text-slate-400 line-through">
                {formatCurrency(product.price)}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-4 py-2 text-sm font-semibold text-sand-50 transition hover:-translate-y-0.5"
            onClick={() =>
              addItem(product, 1, {
                size: product.variants?.sizes?.[0],
                color: product.variants?.colors?.[0],
              })
            }
          >
            <ShoppingBag size={16} />
            Add
          </button>
        </div>
      </div>
    </article>
  );
};
