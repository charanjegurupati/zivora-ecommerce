export const mockCategories = [
  {
    _id: "cat-outerwear",
    name: "Outerwear",
    slug: "outerwear",
    description: "Layered staples built for travel days and late city nights.",
    image:
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "cat-footwear",
    name: "Footwear",
    slug: "footwear",
    description: "Comfort-driven silhouettes with sharp material stories.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "cat-accessories",
    name: "Accessories",
    slug: "accessories",
    description: "Daily carry pieces that organize the small essentials.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
  },
  {
    _id: "cat-home",
    name: "Home Studio",
    slug: "home-studio",
    description: "Objects that soften desks, shelves, and quiet corners.",
    image:
      "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80",
  },
];

export const mockProducts = [
  {
    _id: "prod-1",
    name: "Lattice Wool Overcoat",
    slug: "lattice-wool-overcoat",
    description:
      "A brushed wool overcoat cut with a generous drape, tonal horn buttons, and a soft stand collar for colder commutes.",
    price: 23120,
    discountPrice: 19120,
    category: mockCategories[0],
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        alt: "Model in a wool overcoat",
      },
      {
        url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
        alt: "Close-up fabric detail on an overcoat",
      },
    ],
    stock: 14,
    ratings: { average: 4.8, count: 124 },
    seller: { name: "Zivora Atelier", avatar: "" },
    tags: ["winter", "coat", "premium"],
    isFeatured: true,
    variants: {
      sizes: ["S", "M", "L", "XL"],
      colors: ["Stone", "Espresso", "Noir"],
    },
    reviews: [
      {
        _id: "rev-1",
        rating: 5,
        helpful: 18,
        comment: "The drape is excellent and the lining feels really premium.",
        createdAt: "2026-05-10T10:00:00.000Z",
        user: { name: "Naomi West", avatar: "" },
      },
    ],
  },
  {
    _id: "prod-2",
    name: "Transit Runner 02",
    slug: "transit-runner-02",
    description:
      "A lightweight mixed-material sneaker with responsive cushioning and a city-ready tread made for all-day movement.",
    price: 12720,
    discountPrice: 10320,
    category: mockCategories[1],
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        alt: "Red lifestyle sneaker",
      },
      {
        url: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1200&q=80",
        alt: "Sneaker side profile",
      },
    ],
    stock: 22,
    ratings: { average: 4.6, count: 96 },
    seller: { name: "Orbit Footwear", avatar: "" },
    tags: ["sneakers", "travel", "running"],
    isFeatured: true,
    variants: {
      sizes: ["7", "8", "9", "10", "11"],
      colors: ["Crimson", "Bone", "Slate"],
    },
    reviews: [],
  },
  {
    _id: "prod-3",
    name: "Crescent Leather Sling",
    slug: "crescent-leather-sling",
    description:
      "Compact sling bag in pebbled leather with an adjustable strap, magnetic flap, and enough room for daily carry essentials.",
    price: 9440,
    discountPrice: 7840,
    category: mockCategories[2],
    images: [
      {
        url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80",
        alt: "Leather sling bag",
      },
    ],
    stock: 31,
    ratings: { average: 4.7, count: 61 },
    seller: { name: "North Goods", avatar: "" },
    tags: ["bag", "leather", "travel"],
    isFeatured: true,
    variants: {
      sizes: ["One Size"],
      colors: ["Tan", "Black", "Olive"],
    },
    reviews: [],
  },
  {
    _id: "prod-4",
    name: "Studio Ceramic Lamp",
    slug: "studio-ceramic-lamp",
    description:
      "Sculpted table lamp with a warm linen shade that softens workspaces and shelves with a calm evening glow.",
    price: 16800,
    discountPrice: null,
    category: mockCategories[3],
    images: [
      {
        url: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
        alt: "Ceramic table lamp",
      },
    ],
    stock: 9,
    ratings: { average: 4.9, count: 42 },
    seller: { name: "Hearth Objects", avatar: "" },
    tags: ["home", "lighting", "decor"],
    isFeatured: false,
    variants: {
      sizes: ["Standard"],
      colors: ["Ivory", "Sand", "Terracotta"],
    },
    reviews: [],
  },
  {
    _id: "prod-5",
    name: "Field Notes Desk Set",
    slug: "field-notes-desk-set",
    description:
      "Minimal desk organization kit with tray, notebook, and pen rest, designed to keep creative tools within reach.",
    price: 5920,
    discountPrice: 4960,
    category: mockCategories[3],
    images: [
      {
        url: "https://images.unsplash.com/photo-1516542076529-1ea3854896f2?auto=format&fit=crop&w=1200&q=80",
        alt: "Minimal desk accessories",
      },
    ],
    stock: 40,
    ratings: { average: 4.5, count: 33 },
    seller: { name: "Hearth Objects", avatar: "" },
    tags: ["desk", "stationery", "home"],
    isFeatured: false,
    variants: {
      sizes: ["Set"],
      colors: ["Oak", "Walnut"],
    },
    reviews: [],
  },
  {
    _id: "prod-6",
    name: "Canvas Utility Jacket",
    slug: "canvas-utility-jacket",
    description:
      "Hard-wearing cotton canvas jacket with oversized pockets, soft lining, and a tailored fit that balances workwear and polish.",
    price: 15520,
    discountPrice: 13600,
    category: mockCategories[0],
    images: [
      {
        url: "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
        alt: "Canvas jacket hanging on model",
      },
    ],
    stock: 17,
    ratings: { average: 4.4, count: 87 },
    seller: { name: "Zivora Atelier", avatar: "" },
    tags: ["jacket", "utility", "canvas"],
    isFeatured: true,
    variants: {
      sizes: ["S", "M", "L", "XL"],
      colors: ["Moss", "Camel", "Ink"],
    },
    reviews: [],
  },
  {
    _id: "prod-7",
    name: "Nomad Hiking Boots",
    slug: "nomad-hiking-boots",
    description:
      "Durable, waterproof hiking boots offering superior grip and comfort for your next adventure.",
    price: 14500,
    discountPrice: 12500,
    category: mockCategories[1],
    images: [
      {
        url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80",
        alt: "Nomad hiking boots",
      },
    ],
    stock: 18,
    ratings: { average: 4.8, count: 54 },
    seller: { name: "Orbit Footwear", avatar: "" },
    tags: ["boots", "hiking", "outdoor"],
    isFeatured: true,
    variants: {
      sizes: ["8", "9", "10", "11", "12"],
      colors: ["Brown", "Black"],
    },
    reviews: [],
  },
  {
    _id: "prod-8",
    name: "Classic Silk Scarf",
    slug: "classic-silk-scarf",
    description:
      "A premium woven silk scarf designed to add a touch of elegance and warmth to any outfit.",
    price: 4500,
    discountPrice: 3800,
    category: mockCategories[2],
    images: [
      {
        url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
        alt: "Classic silk scarf",
      },
    ],
    stock: 45,
    ratings: { average: 4.9, count: 21 },
    seller: { name: "North Goods", avatar: "" },
    tags: ["scarf", "silk", "accessories"],
    isFeatured: false,
    variants: {
      sizes: ["One Size"],
      colors: ["Navy", "Burgundy", "Gold"],
    },
    reviews: [],
  },
  {
    _id: "prod-9",
    name: "Minimalist Aviator Sunglasses",
    slug: "minimalist-aviator-sunglasses",
    description:
      "Lightweight aviators with polarized lenses and a matte metal finish for everyday protection.",
    price: 5200,
    discountPrice: 4500,
    category: mockCategories[2],
    images: [
      {
        url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
        alt: "Minimalist aviator sunglasses",
      },
    ],
    stock: 25,
    ratings: { average: 4.6, count: 38 },
    seller: { name: "North Goods", avatar: "" },
    tags: ["sunglasses", "eyewear", "summer"],
    isFeatured: false,
    variants: {
      sizes: ["One Size"],
      colors: ["Silver/Black", "Gold/Green", "Black/Gray"],
    },
    reviews: [],
  }
];

export const mockOrders = [
  {
    _id: "order-1",
    createdAt: "2026-05-08T10:30:00.000Z",
    orderStatus: "shipped",
    paymentStatus: "paid",
    paymentMethod: "card",
    totalAmount: 26960,
    trackingId: "TRK-2C89D1AA0F",
    items: [
      {
        product: mockProducts[0],
        qty: 1,
        price: 19120,
      },
      {
        product: mockProducts[2],
        qty: 1,
        price: 7840,
      },
    ],
  },
];

export const heroImageFallbacks = [
  "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
];

export const promoBanners = [
  {
    title: "72-hour city edit",
    copy: "Pack lighter with elevated layers, shoes, and carry goods tailored for one smart capsule wardrobe.",
  },
  {
    title: "Designer home accents",
    copy: "Make work corners softer with ceramic lighting, storage sets, and tactile materials that age beautifully.",
  },
];
