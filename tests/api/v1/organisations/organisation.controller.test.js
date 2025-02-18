// tests/api/organisations/organisations.test.js
import { jest } from "@jest/globals";
import request from "supertest";

// Use unstable_mockModule to mock dependencies before any imports
await jest.unstable_mockModule(
  "#api/organisations/services/organisation.service.js",
  () => ({
    __esModule: true,
    default: {
      createOrganisation: jest.fn(),
      getOrganisationsForUser: jest.fn(),
      getOrganisationByIdForUser: jest.fn(),
      updateOrganisationForUser: jest.fn(),
      deleteOrganisationForUser: jest.fn(),
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

// Import the modules that depend on the mocks
const { default: organisationService } = await import(
  "#api/organisations/services/organisation.service.js"
);
const { default: app } = await import("#src/app.js");

describe("Organisation Endpoints", () => {
  describe("POST /organisations", () => {
    it("should create an organisation and return 201", async () => {
      const fakeOrganisation = {
        id: "123e4567-e89b-12d3-a456-426614174000",
        name: "Test Organisation",
        description: "A test organisation",
        created_by: "test-user",
      };

      organisationService.createOrganisation.mockResolvedValue(
        fakeOrganisation
      );

      const res = await request(app)
        .post("/api/v1/organisations")
        .send({
          name: "Test Organisation",
          description: "A test organisation",
        })
        .set("Accept", "application/json");

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty(
        "message",
        "Organisation created successfully"
      );
      expect(res.body.data).toMatchObject(fakeOrganisation);
      expect(organisationService.createOrganisation).toHaveBeenCalledWith(
        { name: "Test Organisation", description: "A test organisation" },
        "test-user"
      );
    });

    it("should return 400 for invalid input", async () => {
      // Simulate an error thrown from the service due to invalid input.
      organisationService.createOrganisation.mockImplementation(() => {
        throw new Error("Invalid input");
      });

      const res = await request(app)
        .post("/api/v1/organisations")
        .send({ name: "" }) // invalid input
        .set("Accept", "application/json");

      // Depending on your global error handler, adjust the expected status accordingly.
      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("message", "Validation error");
    });
  });

  describe("GET /organisations", () => {
    it("should fetch all organisations for the user and return 200", async () => {
      const fakeOrganisations = [
        { id: "123e4567-e89b-12d3-a456-426614174001", name: "Org One" },
        { id: "123e4567-e89b-12d3-a456-426614174002", name: "Org Two" },
      ];

      organisationService.getOrganisationsForUser.mockResolvedValue(
        fakeOrganisations
      );

      const res = await request(app)
        .get("/api/v1/organisations")
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Organisations fetched successfully"
      );
      expect(res.body.data).toMatchObject(fakeOrganisations);
      expect(organisationService.getOrganisationsForUser).toHaveBeenCalledWith(
        "test-user"
      );
    });
  });

  describe("GET /organisations/:id", () => {
    it("should fetch an organisation by id and return 200", async () => {
      const organisationId = "123e4567-e89b-12d3-a456-426614174000";
      const fakeOrganisation = {
        id: organisationId,
        name: "Org One",
        description: "An organisation description",
      };

      organisationService.getOrganisationByIdForUser.mockResolvedValue(
        fakeOrganisation
      );

      const res = await request(app)
        .get(`/api/v1/organisations/${organisationId}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Organisation fetched successfully"
      );
      expect(res.body.data).toMatchObject(fakeOrganisation);
      expect(
        organisationService.getOrganisationByIdForUser
      ).toHaveBeenCalledWith(organisationId, "test-user");
    });
  });

  describe("PUT /organisations/:id", () => {
    it("should update an organisation and return 200", async () => {
      const organisationId = "123e4567-e89b-12d3-a456-426614174000";
      const updateData = {
        name: "Updated Organisation",
        description: "Updated Description",
      };
      const updatedOrganisation = {
        id: organisationId,
        ...updateData,
        created_by: "test-user",
      };

      organisationService.updateOrganisationForUser.mockResolvedValue(
        updatedOrganisation
      );

      const res = await request(app)
        .put(`/api/v1/organisations/${organisationId}`)
        .send(updateData)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Organisations updated successfully"
      );
      expect(res.body.data).toMatchObject(updatedOrganisation);
      expect(
        organisationService.updateOrganisationForUser
      ).toHaveBeenCalledWith(organisationId, updateData, "test-user");
    });
  });

  describe("DELETE /organisations/:id", () => {
    it("should delete an organisation and return 200", async () => {
      const organisationId = "123e4567-e89b-12d3-a456-426614174000";

      // Simulate a successful deletion
      organisationService.deleteOrganisationForUser.mockResolvedValue();

      const res = await request(app)
        .delete(`/api/v1/organisations/${organisationId}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty(
        "message",
        "Organisation deleted successfully"
      );
      expect(
        organisationService.deleteOrganisationForUser
      ).toHaveBeenCalledWith(organisationId, "test-user");
    });

    it("should return an error if deletion fails", async () => {
      const organisationId = "123e4567-e89b-12d3-a456-426614174000";

      organisationService.deleteOrganisationForUser.mockImplementation(() => {
        throw new Error("Deletion failed");
      });

      const res = await request(app)
        .delete(`/api/v1/organisations/${organisationId}`)
        .set("Accept", "application/json");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("message", "Deletion failed");
    });
  });
});
