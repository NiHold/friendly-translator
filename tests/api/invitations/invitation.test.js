// tests/api/invitations/invitation.test.js
import { jest } from "@jest/globals";
import request from "supertest";

// Use unstable_mockModule to mock your dependencies before any imports
await jest.unstable_mockModule(
  "#common/factories/supabaseClient.factory.js",
  () => {
    const mockClient = {
      from: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
    };

    return {
      getSupabaseClient: jest.fn(() => mockClient),
    };
  }
);

await jest.unstable_mockModule(
  "#api/invitations/services/invitation.service.js",
  () => ({
    __esModule: true,
    default: {
      sendInvitation: jest.fn(),
      acceptInvitation: jest.fn(),
    },
  })
);

await jest.unstable_mockModule("#middleware/auth.middleware.js", () => ({
  authenticate: (req, res, next) => {
    req.user = { sub: "test-user" };
    next();
  },
  requireUser: (req, res, next) => next(),
}));

// Now import the modules that rely on the mocks
const { default: invitationService } = await import(
  "#api/invitations/services/invitation.service.js"
);
const { default: app } = await import("#src/app.js");

// Now you can write your tests as usual.
describe("Invitation Endpoints", () => {
  describe("POST /organisations/:id/invitations", () => {
    const organisationId = "1";
    const validRequest = {
      email: "invitee@example.com",
      expiresAt: new Date("2099-12-31T23:59:59.000Z"),
    };

    it("should send an invitation and return 201", async () => {
      const fakeInvitation = {
        id: 123,
        organisation_id: organisationId,
        invited_by: "test-user",
        email: validRequest.email,
        token: "fake-token",
        status: "pending",
        expiresAt: validRequest.expiresAt.toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      invitationService.sendInvitation.mockResolvedValue(fakeInvitation);

      const res = await request(app)
        .post(`/api/v1/organisations/${organisationId}/invitations`)
        .send(validRequest)
        .set("Accept", "application/json");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "Invitation sent successfully"
      );
      expect(res.body.data).toMatchObject(fakeInvitation);
      expect(invitationService.sendInvitation).toHaveBeenCalledWith({
        organisationId,
        invitedBy: "test-user",
        email: validRequest.email,
        expiresAt: validRequest.expiresAt,
      });
    });

    it("should return 400 for invalid input", async () => {
      const invalidRequest = {
        email: "not-an-email",
      };

      const res = await request(app)
        .post(`/api/v1/organisations/${organisationId}/invitations`)
        .send(invalidRequest)
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message");
    });
  });

  describe("GET /invitations/accept", () => {
    const token = "fake-token";

    it("should accept an invitation and return 200", async () => {
      const fakeInvitation = {
        id: 123,
        organisation_id: "1",
        invited_by: "test-user",
        email: "invitee@example.com",
        token,
        status: "accepted",
        expiresAt: "2099-12-31T23:59:59Z",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      invitationService.acceptInvitation.mockResolvedValue(fakeInvitation);

      const res = await request(app)
        .get("/api/v1/invitations/accept")
        .query({ token })
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Invitation accepted. You have been added to the organisation."
      );
      expect(res.body.data).toMatchObject(fakeInvitation);
      expect(invitationService.acceptInvitation).toHaveBeenCalledWith(
        token,
        "test-user"
      );
    });

    it("should return 400 for an invalid token", async () => {
      invitationService.acceptInvitation.mockImplementation(() => {
        throw new Error("Invalid or expired invitation");
      });

      const res = await request(app)
        .get("/api/v1/invitations/accept")
        .query({ token: "invalid-token" })
        .set("Accept", "application/json");

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty(
        "message",
        "Invalid or expired invitation"
      );
    });
  });
});
