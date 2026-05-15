import request from "supertest";
import app from "../src/app.js";
import { User } from "../src/models/User.js";
import { VerificationToken } from "../src/models/VerificationToken.js";

describe("Auth routes", () => {
  test("register creates a customer and requires email verification", async () => {
    const response = await request(app).post("/api/auth/register").send({
      name: "Jane Buyer",
      email: "jane@example.com",
      password: "password123",
    });

    expect(response.status).toBe(201);
    expect(response.body.data.requiresEmailVerification).toBe(true);
    expect(response.body.data.userId).toBeTruthy();

    const user = await User.findOne({ email: "jane@example.com" });
    expect(user.role).toBe("customer");
    expect(user.isEmailVerified).toBe(false);
  });

  test("login, me, refresh, and logout work together", async () => {
    await User.create({
      name: "Admin Tester",
      email: "admin@example.com",
      password: "password123",
      role: "admin",
      isEmailVerified: true,
    });

    const agent = request.agent(app);
    const loginResponse = await agent.post("/api/auth/login").send({
      email: "admin@example.com",
      password: "password123",
    });

    expect(loginResponse.status).toBe(200);

    const accessToken = loginResponse.body.data.accessToken;

    const meResponse = await agent
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${accessToken}`);

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.data.user.role).toBe("admin");

    const refreshResponse = await agent.post("/api/auth/refresh");
    expect(refreshResponse.status).toBe(200);
    expect(refreshResponse.body.data.accessToken).toBeTruthy();

    const logoutResponse = await agent.post("/api/auth/logout");
    expect(logoutResponse.status).toBe(200);
  });

  test("forgot password creates a reset token and reset password updates credentials", async () => {
    const user = await User.create({
      name: "Reset Tester",
      email: "reset@example.com",
      password: "password123",
      role: "customer",
      isEmailVerified: true,
    });

    const forgotResponse = await request(app)
      .post("/api/auth/forgot-password")
      .send({ email: "reset@example.com" });

    expect(forgotResponse.status).toBe(200);

    const generatedTokenDoc = await VerificationToken.findOne({
      userId: user._id,
      type: "password_reset",
    });

    expect(generatedTokenDoc).toBeTruthy();

    await VerificationToken.deleteMany({
      userId: user._id,
      type: "password_reset",
    });

    const resetToken = "password-reset-token";

    await VerificationToken.create({
      userId: user._id,
      token: resetToken,
      type: "password_reset",
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    });

    const actualResetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        email: "reset@example.com",
        token: resetToken,
        newPassword: "newpassword123",
      });

    expect(actualResetResponse.status).toBe(200);

    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "reset@example.com",
      password: "newpassword123",
    });

    expect(loginResponse.status).toBe(200);
  });
});
