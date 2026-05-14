import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { LazyImage } from "../components/common/LazyImage.jsx";
import { SectionHeading } from "../components/common/SectionHeading.jsx";
import { SkeletonCard } from "../components/common/SkeletonCard.jsx";
import { ProductCard } from "../components/products/ProductCard.jsx";
import { heroImageFallbacks, promoBanners } from "../data/mockData.js";
import { useProducts } from "../hooks/useProducts.js";

const buildUnsplashEndpoint = (accessKey) =>
  `https://api.unsplash.com/photos/random?count=3&query=ecommerce%20product%20fashion&orientation=portrait&client_id=${accessKey}`;

export default function HomePage() {
  const { products, categories, loading, error } = useProducts({
    limit: 4,
    featured: true,
    sort: "featured",
  });
  const [heroImages, setHeroImages] = useState(heroImageFallbacks);

  useEffect(() => {
    const accessKey = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;

    if (!accessKey) {
      return;
    }

    let mounted = true;

    const loadHeroImages = async () => {
      try {
        const response = await fetch(buildUnsplashEndpoint(accessKey));
        const payload = await response.json();
        const nextImages = payload.map((image) => image.urls.regular).slice(0, 3);

        if (mounted && nextImages.length) {
          setHeroImages(nextImages);
        }
      } catch {
        setHeroImages(heroImageFallbacks);
      }
    };

    loadHeroImages();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <section className="page-section pt-8">
        <div className="hero-grid surface-panel overflow-hidden px-6 py-8 sm:px-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:px-12 lg:py-12">
          <div className="flex flex-col justify-center">
            <p className="eyebrow mb-4">Full-stack storefront</p>
            <h1 className="display-title max-w-2xl text-4xl font-semibold leading-tight text-ink-950 sm:text-5xl lg:text-6xl">
              Curated essentials that feel considered before they hit your cart.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Zivora blends premium product storytelling, thoughtful browsing, and a checkout flow
              built for modern commerce teams.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="inline-flex items-center gap-2 rounded-full bg-ink-950 px-6 py-3 text-sm font-semibold text-sand-50 transition hover:-translate-y-0.5">
                Shop the edit
                <ArrowRight size={16} />
              </Link>
              <Link to="/admin" className="glass-button">
                <Sparkles size={16} />
                View admin tools
              </Link>
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4 lg:mt-0">
            <LazyImage
              src={heroImages[0]}
              alt="Featured editorial product"
              wrapperClassName="col-span-2 overflow-hidden rounded-[28px] bg-sand-100"
              className="h-72 w-full object-cover sm:h-80"
            />
            <LazyImage
              src={heroImages[1]}
              alt="Lifestyle product moment"
              wrapperClassName="overflow-hidden rounded-[28px] bg-sand-100"
              className="h-56 w-full object-cover"
            />
            <LazyImage
              src={heroImages[2]}
              alt="Curated apparel detail"
              wrapperClassName="overflow-hidden rounded-[28px] bg-sand-100"
              className="h-56 w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="page-section">
        <SectionHeading
          eyebrow="Categories"
          title="A storefront built around mood, not just inventory."
          description="Each category is designed to feel like its own carefully merchandised room, with sharp filters and fast product discovery."
        />

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link
              key={category._id}
              to={`/products?category=${category._id}`}
              className="surface-panel overflow-hidden transition hover:-translate-y-1"
            >
              <LazyImage
                src={category.image}
                alt={category.name}
                wrapperClassName="aspect-[4/3] overflow-hidden bg-sand-100"
                className="h-full w-full object-cover"
              />
              <div className="space-y-2 p-5">
                <h3 className="display-title text-xl font-semibold text-ink-950">{category.name}</h3>
                <p className="text-sm leading-7 text-slate-600">{category.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="page-section">
        <SectionHeading
          eyebrow="Featured now"
          title="Best-performing products with rich imagery, ratings, and related recommendations."
          description="The frontend is wired for lazy image loading, product hooks, and API-backed featured merchandising."
        />
        {error ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-honey-400 bg-white/70 px-5 py-4 text-sm text-slate-600">
            {error}
          </div>
        ) : null}
        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {loading
            ? Array.from({ length: 4 }).map((_, index) => <SkeletonCard key={index} />)
            : products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <section className="page-section">
        <div className="grid gap-6 lg:grid-cols-2">
          {promoBanners.map((banner) => (
            <article key={banner.title} className="surface-panel-dark px-8 py-8">
              <p className="eyebrow mb-4 text-sand-100/70">Promotional banner</p>
              <h3 className="display-title text-3xl font-semibold">{banner.title}</h3>
              <p className="mt-4 max-w-lg text-sm leading-7 text-sand-50/75">{banner.copy}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
