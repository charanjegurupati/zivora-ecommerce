import request from "supertest";
import app from "../src/app.js";
import { Category } from "../src/models/Category.js";
import { User } from "../src/models/User.js";

const createAdminSession = async () => {
  await User.create({
    name: "Catalog Admin",
    email: "catalog-admin@example.com",
    password: "password123",
    role: "admin",
    isEmailVerified: true,
  });

  const agent = request.agent(app);
  const loginResponse = await agent.post("/api/auth/login").send({
    email: "catalog-admin@example.com",
    password: "password123",
  });

  return {
    agent,
    token: loginResponse.body.data.accessToken,
  };
};

describe("Product routes", () => {
  test("admin can create and public clients can list and search products", async () => {
    const category = await Category.create({
      name: "Outerwear",
      description: "Layered essentials",
    });

    const { agent, token } = await createAdminSession();

    const createResponse = await agent
      .post("/api/products")
      .set("Authorization", `Bearer ${token}`)
      .send({
        name: "Monarch Travel Coat",
        description:
          "A travel-ready coat with soft structure, oversized pockets, and a weather-aware finish for long city days.",
        price: 220,
        discountPrice: 189,
        category: category._id.toString(),
        stock: 12,
        tags: ["travel", "coat"],
        images: ["https://example.com/coat.jpg"],
        isFeatured: true,
      });

    expect(createResponse.status).toBe(201);
    expect(createResponse.body.data.product.slug).toBe("monarch-travel-coat");

    const listResponse = await request(app).get("/api/products");
    expect(listResponse.status).toBe(200);
    expect(listResponse.body.data.products).toHaveLength(1);

    const searchResponse = await request(app).get("/api/products/search?q=travel");
    expect(searchResponse.status).toBe(200);
    expect(searchResponse.body.data.products[0].name).toBe("Monarch Travel Coat");

    const detailResponse = await request(app).get(
      `/api/products/${createResponse.body.data.product.slug}`,
    );
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.data.product.name).toBe("Monarch Travel Coat");
  });
});
