import "dotenv/config";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { Category } from "../models/Category.js";
import { Product } from "../models/Product.js";
import { User } from "../models/User.js";
import { slugify } from "../utils/slugify.js";

const adminCredentials = {
  name: "Zivora Admin",
  email: "zivoraecommerce@gmail.com",
  password: "jcharan2048",
  role: "admin",
  isActive: true,
  isEmailVerified: true,
};

const categories = [
  {
    name: "Outerwear",
    description: "Layered staples designed for cooler commutes and travel days.",
    image:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Footwear",
    description: "Comfort-led silhouettes with premium finishes for daily wear.",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Accessories",
    description: "Carry goods and smaller essentials that complete the kit.",
    image:
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=900&q=80",
  },
];

const products = [
  {
    name: "Monarch Travel Coat",
    description:
      "A travel-ready coat with soft structure, oversized pockets, and a weather-aware finish for long city days.",
    price: 17600,
    discountPrice: 15120,
    categoryName: "Outerwear",
    stock: 12,
    tags: ["travel", "coat", "featured"],
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1200&q=80",
        alt: "Monarch travel coat",
      },
    ],
  },
  {
    name: "Transit Runner 02",
    description:
      "A lightweight mixed-material sneaker with responsive cushioning and a city-ready tread for all-day movement.",
    price: 12720,
    discountPrice: 10320,
    categoryName: "Footwear",
    stock: 24,
    tags: ["sneakers", "travel", "running"],
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80",
        alt: "Transit runner sneaker",
      },
    ],
  },
  {
    name: "Crescent Leather Sling",
    description:
      "Compact sling bag in pebbled leather with an adjustable strap and enough room for daily essentials.",
    price: 9440,
    discountPrice: 7840,
    categoryName: "Accessories",
    stock: 30,
    tags: ["bag", "leather", "carry"],
    isFeatured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1200&q=80",
        alt: "Crescent leather sling",
      },
    ],
  },
  {
    name: "Nomad Hiking Boots",
    description:
      "Durable, waterproof hiking boots offering superior grip and comfort for your next adventure.",
    price: 14500,
    discountPrice: 12500,
    categoryName: "Footwear",
    stock: 18,
    tags: ["boots", "hiking", "outdoor"],
    isFeatured: true,
    images: [
      {
        url: "https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1200&q=80",
        alt: "Nomad hiking boots",
      },
    ],
  },
  {
    name: "Classic Silk Scarf",
    description:
      "A premium woven silk scarf designed to add a touch of elegance and warmth to any outfit.",
    price: 4500,
    discountPrice: 3800,
    categoryName: "Accessories",
    stock: 45,
    tags: ["scarf", "silk", "accessories"],
    isFeatured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=1200&q=80",
        alt: "Classic silk scarf",
      },
    ],
  },
  {
    name: "Minimalist Aviator Sunglasses",
    description:
      "Lightweight aviators with polarized lenses and a matte metal finish for everyday protection.",
    price: 5200,
    discountPrice: 4500,
    categoryName: "Accessories",
    stock: 25,
    tags: ["sunglasses", "eyewear", "summer"],
    isFeatured: false,
    images: [
      {
        url: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1200&q=80",
        alt: "Minimalist aviator sunglasses",
      },
    ],
  }
];

const seed = async () => {
  await connectDB(process.env.MONGO_URI);

  try {
    let admin = await User.findOne({ email: adminCredentials.email }).select("+password");

    if (!admin) {
      admin = await User.create(adminCredentials);
      console.log(`Created admin user: ${adminCredentials.email}`);
    } else {
      admin.name = adminCredentials.name;
      admin.password = adminCredentials.password;
      admin.role = "admin";
      admin.isActive = true;
      admin.isEmailVerified = true;
      await admin.save();
      console.log(`Updated admin user: ${adminCredentials.email}`);
    }

    const categoryMap = new Map();

    for (const categoryData of categories) {
      const category = await Category.findOneAndUpdate(
        { name: categoryData.name },
        {
          ...categoryData,
          slug: slugify(categoryData.name),
          isActive: true,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        },
      );

      categoryMap.set(categoryData.name, category);
    }

    for (const productData of products) {
      const category = categoryMap.get(productData.categoryName);

      await Product.findOneAndUpdate(
        { name: productData.name },
        {
          name: productData.name,
          slug: slugify(productData.name),
          description: productData.description,
          price: productData.price,
          discountPrice: productData.discountPrice,
          category: category._id,
          images: productData.images,
          stock: productData.stock,
          seller: admin._id,
          tags: productData.tags,
          isFeatured: productData.isFeatured,
          isActive: true,
        },
        {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
          runValidators: true,
        },
      );
    }

    console.log("Seed complete.");
    console.log(`Admin login: ${adminCredentials.email}`);
    console.log(`Admin password: ${adminCredentials.password}`);
  } finally {
    await mongoose.connection.close();
  }
};

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
