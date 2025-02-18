// tests/unit/invitation.service.test.js
import { describe, jest, expect } from "@jest/globals";
import crypto from "crypto";
import { setupSupabaseMock, mockClient } from "../mocks/supabaseClient.mock.js";

await setupSupabaseMock();

const { default: invitationService } = await import(
  "#api/invitations/services/invitation.service.js"
);

describe("InvitationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("sendInvitation", () => {
    it("should send an invitation and return the inserted invitation data", async () => {
      // Override token generation to return a fixed token.
      const fixedBuffer = Buffer.from("12345678901234567890"); // 20 bytes
      const fixedTokenHex = fixedBuffer.toString("hex");
      jest.spyOn(crypto, "randomBytes").mockReturnValue(fixedBuffer);

      const fakeInvitation = {
        id: 1,
        organisation_id: "org-123",
        invited_by: "user-456",
        email: "invitee@example.com",
        token: fixedTokenHex,
        expires_at: "2025-03-01T00:00:00Z",
        status: "pending",
      };

      // Mock the Supabase chain for inserting into the "invitations" table.
      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: [fakeInvitation],
                error: null,
              }),
            }),
          };
        }
        return {};
      });

      // Act
      const result = await invitationService.sendInvitation({
        organisationId: "org-123",
        invitedBy: "user-456",
        email: "invitee@example.com",
        expires_at: "2025-03-01T00:00:00Z",
      });

      // Assert
      expect(result).toEqual(fakeInvitation);
      expect(crypto.randomBytes).toHaveBeenCalledWith(20);
    });

    it("should throw an error if supabase returns an error on insert", async () => {
      // Arrange
      const errorResponse = { message: "Insert failed" };
      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            insert: jest.fn().mockReturnValue({
              select: jest.fn().mockResolvedValue({
                data: null,
                error: errorResponse,
              }),
            }),
          };
        }
        return {};
      });

      // Act & Assert
      await expect(
        invitationService.sendInvitation({
          organisationId: "org-123",
          invitedBy: "user-456",
          email: "invitee@example.com",
          expires_at: "2025-03-01T00:00:00Z",
        })
      ).rejects.toThrow("Insert failed");
    });
  });

  describe("acceptInvitation", () => {
    it("should accept a valid invitation and return the invitation data", async () => {
      // Arrange
      const fakeInvitation = {
        id: 1,
        organisation_id: "org-123",
        invited_by: "user-456",
        email: "invitee@example.com",
        token: "validtoken",
        expires_at: "2025-03-01T00:00:00Z",
        status: "pending",
      };

      // Mock the chain for retrieving, updating, and adding the user to the organisation.
      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: fakeInvitation,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null,
              }),
            }),
          };
        } else if (table === "organisation_users") {
          return {
            insert: jest.fn().mockResolvedValue({
              error: null,
            }),
          };
        }
        return {};
      });

      // Act
      const result = await invitationService.acceptInvitation(
        "validtoken",
        "user-789"
      );

      // Assert
      expect(result).toEqual(fakeInvitation);
    });

    it("should throw an error if retrieving the invitation fails", async () => {
      // Arrange
      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: null,
                  error: { message: "Retrieval error" },
                }),
              }),
            }),
          };
        }
        return {};
      });

      // Act & Assert
      await expect(
        invitationService.acceptInvitation("invalidtoken", "user-789")
      ).rejects.toThrow("Retrieval error");
    });

    it("should throw an error if invitation is not found", async () => {
      // Arrange
      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: null,
                  error: null,
                }),
              }),
            }),
          };
        }
        return {};
      });

      // Act & Assert
      await expect(
        invitationService.acceptInvitation("nonexistenttoken", "user-789")
      ).rejects.toThrow("Invalid or expired invitation");
    });

    it("should throw an error if invitation is not pending", async () => {
      // Arrange
      const fakeInvitation = {
        id: 1,
        organisation_id: "org-123",
        invited_by: "user-456",
        email: "invitee@example.com",
        token: "usedtoken",
        expires_at: "2025-03-01T00:00:00Z",
        status: "accepted", // not pending
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: fakeInvitation,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null,
              }),
            }),
          };
        } else if (table === "organisation_users") {
          return {
            insert: jest.fn().mockResolvedValue({
              error: null,
            }),
          };
        }
        return {};
      });

      // Act & Assert
      await expect(
        invitationService.acceptInvitation("usedtoken", "user-789")
      ).rejects.toThrow("Invitation already used or expired");
    });

    it("should throw an error if adding user to organisation fails", async () => {
      // Arrange
      const fakeInvitation = {
        id: 1,
        organisation_id: "org-123",
        invited_by: "user-456",
        email: "invitee@example.com",
        token: "validtoken",
        expires_at: "2025-03-01T00:00:00Z",
        status: "pending",
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: fakeInvitation,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: null,
              }),
            }),
          };
        } else if (table === "organisation_users") {
          return {
            insert: jest.fn().mockResolvedValue({
              error: { message: "Insert organisation user failed" },
            }),
          };
        }
        return {};
      });

      // Act & Assert
      await expect(
        invitationService.acceptInvitation("validtoken", "user-789")
      ).rejects.toThrow("Insert organisation user failed");
    });

    it("should throw an error if updating invitation status fails", async () => {
      // Arrange
      const fakeInvitation = {
        id: 1,
        organisation_id: "org-123",
        invited_by: "user-456",
        email: "invitee@example.com",
        token: "validtoken",
        expires_at: "2025-03-01T00:00:00Z",
        status: "pending",
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "invitations") {
          return {
            select: jest.fn().mockReturnValue({
              eq: jest.fn().mockReturnValue({
                maybeSingle: jest.fn().mockResolvedValue({
                  data: fakeInvitation,
                  error: null,
                }),
              }),
            }),
            update: jest.fn().mockReturnValue({
              eq: jest.fn().mockResolvedValue({
                error: { message: "Update failed" },
              }),
            }),
          };
        } else if (table === "organisation_users") {
          return {
            insert: jest.fn().mockResolvedValue({
              error: null,
            }),
          };
        }
        return {};
      });

      // Act & Assert
      await expect(
        invitationService.acceptInvitation("validtoken", "user-789")
      ).rejects.toThrow("Update failed");
    });
  });
});
