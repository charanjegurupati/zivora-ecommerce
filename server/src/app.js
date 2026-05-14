import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import "dotenv/config";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import xssClean from "xss-clean";

import { errorHandler, notFound } from "./middleware/error.middleware.js";

import authRoutes from "./routes/auth.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import productRoutes from "./routes/product.routes.js";

const app = express();

// Allowed frontend origins
const whitelist = (
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

// CORS Configuration
const corsOptions = {
  origin(origin, callback) {
    // Allow requests without origin (Postman/mobile apps)
    if (!origin || whitelist.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Origin not allowed by CORS"));
    }
  },

  credentials: true,

  methods: [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ],

  allowedHeaders: [
    "Content-Type",
    "Authorization",
  ],
};

// Rate limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5000,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "fail",
    message: "Too many requests, please try again later.",
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: true,
  legacyHeaders: false,

  message: {
    status: "fail",
    message: "Too many auth attempts, please try again later.",
  },
});

// CSP directives
const cspDirectives = {
  defaultSrc: ["'self'"],

  connectSrc: [
    "'self'",
    ...whitelist,
  ],

  imgSrc: [
    "'self'",
    "data:",
    "https://images.unsplash.com",
    "https://plus.unsplash.com",
    "https://source.unsplash.com",
    "https://res.cloudinary.com",
    "https://placehold.co",
  ],

  styleSrc: [
    "'self'",
    "'unsafe-inline'",
    "https://fonts.googleapis.com",
  ],

  fontSrc: [
    "'self'",
    "https://fonts.gstatic.com",
    "data:",
  ],

  objectSrc: ["'none'"],

  frameAncestors: ["'none'"],
};

if (process.env.NODE_ENV === "production") {
  cspDirectives.upgradeInsecureRequests = [];
}

// Trust proxy (Render/Railway/Vercel)
app.set("trust proxy", 1);

// Helmet security
app.use(
  helmet({
    crossOriginResourcePolicy: false,

    contentSecurityPolicy: {
      directives: cspDirectives,
    },

    hsts:
      process.env.NODE_ENV === "production"
        ? {
            maxAge: 31536000,
            includeSubDomains: true,
            preload: true,
          }
        : false,

    frameguard: {
      action: "deny",
    },
  })
);

// CORS
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Compression
app.use(compression());

// Logger
app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

// Body parsers
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({
  extended: true,
  limit: "2mb",
}));

// Cookie parser
app.use(cookieParser());

// Security sanitizers
app.use(mongoSanitize());
app.use(xssClean());

// Rate limiter
app.use(globalLimiter);

// Health route
app.get("/api/health", (_req, res) => {
  res.json({
    status: "success",
    message: "Zivora API is running",
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

// 404 handler
app.use(notFound);

// Global error handler
app.use(errorHandler);

export default app;
