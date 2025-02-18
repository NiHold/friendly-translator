// tests/unit/auth.service.test.js
import { describe, jest } from "@jest/globals";
import { setupSupabaseMock, mockClient } from "../mocks/supabaseClient.mock.js";

// Set up the Supabase mock BEFORE importing modules that depend on it.
await setupSupabaseMock();

// Import the service after the mock is set up.
const { default: authService } = await import(
  "#api/auth/services/auth.service.js"
);

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("registerUser", () => {
    it("should return formatted user and session on successful registration", async () => {
      // Arrange: define fake user and session data.
      const fakeUser = {
        id: "user-id",
        email: "user@example.com",
        role: "authenticated",
        email_confirmed_at: "2025-02-11T14:54:57.883821Z",
        last_sign_in_at: "2025-02-17T15:01:59.642591777Z",
        created_at: "2025-02-11T14:53:47.058518Z",
        updated_at: "2025-02-11T14:53:47.058518Z",
      };

      const fakeSession = {
        access_token: "fake_access_token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: 1739808119,
        refresh_token: "fake_refresh_token",
      };

      // Mock signUp to resolve with our fake data.
      mockClient.auth.signUp.mockResolvedValue({
        user: fakeUser,
        session: fakeSession,
        error: null,
      });

      const result = await authService.registerUser({
        email: "user@example.com",
        password: "securepassword",
      });

      // Check that the returned data is formatted as expected.
      expect(result).toEqual({
        user: {
          id: fakeUser.id,
          email: fakeUser.email,
          role: fakeUser.role,
          email_confirmed_at: fakeUser.email_confirmed_at,
          last_sign_in_at: fakeUser.last_sign_in_at,
          created_at: fakeUser.created_at,
          updated_at: fakeUser.updated_at,
        },
        session: {
          access_token: fakeSession.access_token,
          token_type: fakeSession.token_type,
          expires_in: fakeSession.expires_in,
          expires_at: fakeSession.expires_at,
          refresh_token: fakeSession.refresh_token,
        },
      });
      expect(mockClient.auth.signUp).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "securepassword",
      });
    });

    it("should throw an error with status code when supabase returns an error", async () => {
      const errorResponse = { message: "Registration failed", status: 400 };
      mockClient.auth.signUp.mockResolvedValue({
        user: null,
        session: null,
        error: errorResponse,
      });

      await expect(
        authService.registerUser({
          email: "user@example.com",
          password: "pass",
        })
      ).rejects.toMatchObject({
        message: "Registration failed",
        status: 400,
      });
    });
  });
  describe("loginUser", () => {
    it("should return formatted user and session on successful login", async () => {
      const fakeUser = {
        id: "user-id",
        email: "user@example.com",
        role: "authenticated",
        email_confirmed_at: "2025-02-11T14:54:57.883821Z",
        last_sign_in_at: "2025-02-17T15:01:59.642591777Z",
        created_at: "2025-02-11T14:53:47.058518Z",
        updated_at: "2025-02-11T14:53:47.058518Z",
      };

      const fakeSession = {
        access_token: "fake_access_token",
        token_type: "bearer",
        expires_in: 3600,
        expires_at: 1739808119,
        refresh_token: "fake_refresh_token",
      };

      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: { user: fakeUser, session: fakeSession },
        error: null,
      });

      const result = await authService.loginUser({
        email: "user@example.com",
        password: "securepassword",
      });

      // Check that the returned data is formatted as expected.
      expect(result).toEqual({
        user: {
          id: fakeUser.id,
          email: fakeUser.email,
          role: fakeUser.role,
          email_confirmed_at: fakeUser.email_confirmed_at,
          last_sign_in_at: fakeUser.last_sign_in_at,
          created_at: fakeUser.created_at,
          updated_at: fakeUser.updated_at,
        },
        session: {
          access_token: fakeSession.access_token,
          token_type: fakeSession.token_type,
          expires_in: fakeSession.expires_in,
          expires_at: fakeSession.expires_at,
          refresh_token: fakeSession.refresh_token,
        },
      });
      expect(mockClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: "user@example.com",
        password: "securepassword",
      });
    });

    it("should throw an error with status code when supabase returns an error", async () => {
      const errorResponse = {
        message: "Invalid login credentials",
        status: 400,
      };
      mockClient.auth.signInWithPassword.mockResolvedValue({
        data: null,
        error: errorResponse,
      });

      await expect(
        authService.loginUser({
          email: "user@example.com",
          password: "pass",
        })
      ).rejects.toMatchObject({
        message: "Invalid login credentials",
        status: 400,
      });
    });
  });
});
