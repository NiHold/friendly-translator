import { describe, jest } from "@jest/globals";
import request from "supertest";
import { setupSupabaseMock } from "../mocks/supabaseClient.mock.js";

await setupSupabaseMock();

// Use unstable_mockModule to mock dependencies before any imports
await jest.unstable_mockModule("#api/auth/services/auth.service.js", () => ({
  __esModule: true,
  default: {
    registerUser: jest.fn(),
    loginUser: jest.fn(),
    logoutUser: jest.fn(),
  },
}));

const { default: authService } = await import(
  "#api/auth/services/auth.service.js"
);
const { default: app } = await import("#src/app.js");

describe("Auth Endpoints", () => {
  describe("POST /v1/auth/register", () => {
    const validRequest = {
      email: "user@example.com",
      password: "password",
    };
    it("should register a user and return 201", async () => {
      const fakeUser = {
        user: {
          id: 123,
          email: "test@user.com",
          role: "authenticated",
          email_confirmed_at: "2025-02-11T14:54:57.883821Z",
          last_sign_in_at: "2025-02-17T15:01:59.642591777Z",
          created_at: "2025-02-11T14:53:47.058518Z",
          updated_at: "2025-02-11T14:53:47.058518Z",
        },
        session: {
          access_token: "fake_access_token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: 1739808119,
          refresh_token: "fake_refresh_token",
        },
      };

      authService.registerUser.mockResolvedValue(fakeUser);

      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(validRequest)
        .set("Accept", "application/json");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(res.body.data).toMatchObject(fakeUser);
    });

    it("should return a 400 for invalid input", async () => {
      const invalidRequest = {
        email: "not-an-email",
        password: "invalid-password",
      };
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send(invalidRequest)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("POST /v1/auth/login", () => {
    const validRequest = {
      email: "user@example.com",
      password: "password",
    };
    it("should login a user and return 201", async () => {
      const fakeUser = {
        user: {
          id: 123,
          email: "test@user.com",
          role: "authenticated",
          email_confirmed_at: "2025-02-11T14:54:57.883821Z",
          last_sign_in_at: "2025-02-17T15:01:59.642591777Z",
          created_at: "2025-02-11T14:53:47.058518Z",
          updated_at: "2025-02-11T14:53:47.058518Z",
        },
        session: {
          access_token: "fake_access_token",
          token_type: "bearer",
          expires_in: 3600,
          expires_at: 1739808119,
          refresh_token: "fake_refresh_token",
        },
      };

      authService.loginUser.mockResolvedValue(fakeUser);

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(validRequest)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("message", "User logged in successfully");
      expect(res.body.data).toMatchObject(fakeUser);
    });

    it("should return a 400 for invalid input", async () => {
      const invalidRequest = {
        email: "not-an-email",
        password: "invalid-password",
      };
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send(invalidRequest)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });
});
