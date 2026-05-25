import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import { User } from "./models/User.js";
import { seedDatabase } from "./scripts/seed.js";

const port = Number(process.env.PORT || 5000);

let server;
const shutdown = (signal, error) => {
  if (error) {
    console.error(`${signal}:`, error);
  }

  if (server) {
    server.close(() => {
      process.exit(error ? 1 : 0);
    });

    return;
  }

  process.exit(error ? 1 : 0);
};
process.on("unhandledRejection", (error) =>
  shutdown("UNHANDLED_REJECTION", error)
);

process.on("uncaughtException", (error) =>
  shutdown("UNCAUGHT_EXCEPTION", error)
);
const startServer = async () => {
  await connectDB(process.env.MONGO_URI);

  // Auto-seed if no admin exists
  try {
    const adminExists = await User.findOne({ role: "admin" });
    if (!adminExists) {
      console.log("No admin user found. Running auto-seeding...");
      await seedDatabase(false);
    }
  } catch (seedErr) {
    console.error("Auto-seeding check failed:", seedErr);
  }

  server = app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
  });
};

startServer().catch((error) =>
  shutdown("BOOT_FAILURE", error)
);

