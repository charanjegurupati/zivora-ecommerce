import { Truck } from "lucide-react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import { api } from "../api/client.js";
import { PageLoader } from "../components/common/PageLoader.jsx";
import { QuantityStepper } from "../components/common/QuantityStepper.jsx";
import { RatingStars } from "../components/common/RatingStars.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { ReviewList } from "../components/products/ReviewList.jsx";
import { useCart } from "../hooks/useCart.js";
import { formatCurrency } from "../utils/currency.js";
import { fallbackProductBySlug, fallbackRelatedProducts } from "../utils/products.js";

const tabs = ["description", "reviews", "shipping"];

export default function ProductDetailPage() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [tab, setTab] = useState("description");
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  useEffect(() => {
    let mounted = true;

    const loadProduct = async () => {
      setLoading(true);

      try {
        const response = await api.get(`/products/${slug}`);
        const nextProduct = response.data?.data?.product;

        if (!mounted) {
          return;
        }

        setProduct(nextProduct);
        setRelatedProducts(response.data?.data?.relatedProducts || []);
        setSelectedSize(nextProduct?.variants?.sizes?.[0] || "Standard");
        setSelectedColor(nextProduct?.variants?.colors?.[0] || "Default");
      } catch {
        const fallback = fallbackProductBySlug(slug);

        if (!mounted) {
          return;
        }

        setProduct(fallback || null);
        setRelatedProducts(fallback ? fallbackRelatedProducts(fallback) : []);
        setSelectedSize(fallback?.variants?.sizes?.[0] || "Standard");
        setSelectedColor(fallback?.variants?.colors?.[0] || "Default");
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadProduct();

    return () => {
      mounted = false;
    };
  }, [slug]);

  if (loading) {
    return <PageLoader label="Loading product detail..." />;
  }

  if (!product) {
    return (
      <div className="page-section">
        <div className="surface-panel px-8 py-12 text-center">
          <h1 className="display-title text-3xl font-semibold text-ink-950">Product not found</h1>
        </div>
      </div>
    );
  }

  return (
    <section className="page-section">
      <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <div className="surface-panel overflow-hidden p-5">
          <Swiper modules={[Pagination]} pagination={{ clickable: true }} className="overflow-hidden rounded-[28px]">
            {product.images?.map((image) => (
              <SwiperSlide key={image.url}>
                <img
                  src={image.url}
                  alt={image.alt || product.name}
                  className="h-[420px] w-full object-cover sm:h-[540px]"
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>

        <div className="surface-panel space-y-6 p-8">
          <div className="space-y-3">
            <p className="eyebrow">{product.category?.name}</p>
            <h1 className="display-title text-4xl font-semibold text-ink-950">{product.name}</h1>
            <RatingStars
              rating={product.ratings?.average || 0}
              count={product.ratings?.count || 0}
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-3xl font-semibold text-ink-950">
              {formatCurrency(product.discountPrice ?? product.price)}
            </p>
            {product.discountPrice ? (
              <p className="text-lg text-slate-400 line-through">
                {formatCurrency(product.price)}
              </p>
            ) : null}
          </div>

          <p className="text-base leading-8 text-slate-600">{product.description}</p>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Size
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.variants?.sizes || ["Standard"]).map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setSelectedSize(size)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    selectedSize === size
                      ? "bg-ink-950 text-sand-50"
                      : "border border-slate-200 bg-white text-ink-900"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
              Color
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(product.variants?.colors || ["Default"]).map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setSelectedColor(color)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ${
                    selectedColor === color
                      ? "bg-honey-500 text-white"
                      : "border border-slate-200 bg-white text-ink-900"
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <QuantityStepper
              value={quantity}
              max={product.stock || 20}
              onChange={setQuantity}
            />
            <button
              type="button"
              className="inline-flex flex-1 items-center justify-center rounded-full bg-ink-950 px-6 py-4 text-sm font-semibold text-sand-50 transition hover:-translate-y-0.5"
              onClick={() =>
                addItem(product, quantity, {
                  size: selectedSize,
                  color: selectedColor,
                })
              }
            >
              Add to cart
            </button>
          </div>

          <div className="rounded-[24px] bg-sand-50 px-5 py-4 text-sm text-slate-600">
            <div className="flex items-start gap-3">
              <Truck size={18} className="mt-0.5 text-honey-500" />
              <p>
                Ships in 24 hours. Free delivery on orders over $150 and easy returns within 14
                days.
              </p>
            </div>
          </div>

          <div className="border-t border-slate-200 pt-4">
            <div className="flex flex-wrap gap-2">
              {tabs.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setTab(item)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold capitalize ${
                    tab === item
                      ? "bg-ink-950 text-sand-50"
                      : "border border-slate-200 bg-white text-ink-900"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-5">
              {tab === "description" ? (
                <p className="text-sm leading-7 text-slate-600">{product.description}</p>
              ) : null}
              {tab === "reviews" ? <ReviewList reviews={product.reviews || []} /> : null}
              {tab === "shipping" ? (
                <div className="rounded-[24px] border border-slate-200 px-5 py-5 text-sm leading-7 text-slate-600">
                  Dispatch within one business day. Tracking is emailed automatically on shipped
                  orders, and the backend is wired for admin status updates plus email triggers.
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="display-title text-3xl font-semibold text-ink-950">Related products</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {relatedProducts.map((item) => (
            <ProductCard key={item._id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
