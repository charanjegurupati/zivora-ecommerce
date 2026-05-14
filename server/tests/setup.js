import mongoose from "mongoose";
import { MongoMemoryReplSet } from "mongodb-memory-server";

let mongoReplSet;

beforeAll(async () => {
  process.env.NODE_ENV = "test";
  process.env.JWT_ACCESS_SECRET = "test-access-secret";
  process.env.JWT_REFRESH_SECRET = "test-refresh-secret";
  process.env.FRONTEND_ORIGIN = "http://localhost:5173";
  process.env.SMTP_HOST = "";
  process.env.SMTP_USER = "";
  process.env.SMTP_PASS = "";
  process.env.MONGOMS_SYSTEM_BINARY =
    process.env.MONGOMS_SYSTEM_BINARY ||
    "C:\\Program Files\\MongoDB\\Server\\8.3\\bin\\mongod.exe";

  mongoReplSet = await MongoMemoryReplSet.create({
    binary: {
      systemBinary: process.env.MONGOMS_SYSTEM_BINARY,
    },
    replSet: { count: 1, storageEngine: "wiredTiger" },
  });

  process.env.MONGO_URI = mongoReplSet.getUri();
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  if (!mongoose.connection.db) {
    return;
  }

  const collections = await mongoose.connection.db.collections();
  await Promise.all(collections.map((collection) => collection.deleteMany({})));
});

afterAll(async () => {
  if (mongoose.connection.db) {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  }

  if (mongoReplSet) {
    await mongoReplSet.stop();
  }
});
