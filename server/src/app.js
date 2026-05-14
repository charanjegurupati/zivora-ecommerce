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

const whitelist = (
  process.env.FRONTEND_ORIGIN ||
  "http://localhost:5173"
)
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

const corsOptions = {
  origin(origin, callback) {
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

app.set("trust proxy", 1);

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

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

app.use(compression());

app.use(
  morgan(
    process.env.NODE_ENV === "production"
      ? "combined"
      : "dev"
  )
);

app.use(express.json({ limit: "2mb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "2mb",
  })
);

app.use(cookieParser());

app.use(mongoSanitize());

app.use(xssClean());

app.use(globalLimiter);

app.get("/", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Zivora Backend API Running 🚀",
  });
});

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    status: "success",
    message: "Zivora API is running",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authLimiter, authRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/products", productRoutes);

app.use("/api/orders", orderRoutes);

app.use(notFound);

app.use(errorHandler);

export default app;
