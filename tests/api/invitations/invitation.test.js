// tests/invitation.test.js
import request from "supertest";
import app from "../../../src/app.js";

// Mock the invitation service so we can control its responses.
import invitationService from "../../../src/api/invitations/services/invitation.service.js";
jest.mock(
  ".../../../src/api/invitations/services/invitation.service.js",
  () => ({
    sendInvitation: jest.fn(),
    acceptInvitation: jest.fn(),
  })
);

// To simulate an authenticated user in our tests, we can override the authentication middleware.
// For example, if your authenticate middleware is imported in your routes, you can use jest.mock
// to override it. Here’s a simple example assuming your middleware is in '../src/middlewares/auth.middleware.js':
jest.mock("../../../src/middlewares/auth.middleware.js", () => ({
  authenticate: (req, res, next) => {
    req.user = { sub: "test-user" };
    next();
  },
  requireUser: (req, res, next) => next(),
}));

describe("Invitation Endpoints", () => {
  describe("POST /organisations/:id/invitations", () => {
    const organisationId = "1";
    const validRequest = {
      email: "invitee@example.com",
      expires_at: "2099-12-31T23:59:59Z",
    };

    it("should send an invitation and return 201", async () => {
      // Setup the mock to resolve with a fake invitation object
      const fakeInvitation = {
        id: 123,
        organisation_id: organisationId,
        invited_by: "test-user",
        email: validRequest.email,
        token: "fake-token",
        status: "pending",
        expires_at: validRequest.expires_at,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      invitationService.sendInvitation.mockResolvedValue(fakeInvitation);

      const res = await request(app)
        .post(`/organisations/${organisationId}/invitations`)
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
        expiresAt: validRequest.expires_at,
      });
    });

    it("should return 400 for invalid input", async () => {
      const invalidRequest = {
        email: "not-an-email",
      };

      const res = await request(app)
        .post(`/organisations/${organisationId}/invitations`)
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
        expires_at: "2099-12-31T23:59:59Z",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      invitationService.acceptInvitation.mockResolvedValue(fakeInvitation);

      const res = await request(app)
        .get("/invitations/accept")
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
        .get("/invitations/accept")
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
