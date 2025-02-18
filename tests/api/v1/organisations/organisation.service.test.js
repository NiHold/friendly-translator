// tests/unit/organisation.service.test.js
import { describe, jest, expect } from "@jest/globals";
import { setupSupabaseMock, mockClient } from "../mocks/supabaseClient.mock.js";

// Set up the Supabase mock before importing modules that depend on it.
await setupSupabaseMock();

// Import the OrganisationService after the mock is set up.
const { default: organisationService } = await import(
  "#api/organisations/services/organisation.service.js"
);

describe("OrganisationService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createOrganisation", () => {
    it("should create an organisation and associate it with the user", async () => {
      const userId = "user-123";
      const inputData = { name: "Test Org", description: "A test org" };
      const fakeOrganisation = {
        id: "org-001",
        name: "Test Org",
        description: "A test org",
        created_by: userId,
      };

      // Set up the chainable queries for the two tables.
      mockClient.from.mockImplementation((table) => {
        if (table === "organisations") {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({
              data: [fakeOrganisation],
              error: null,
            }),
          };
        }
        if (table === "organisation_users") {
          return {
            insert: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const result = await organisationService.createOrganisation(
        inputData,
        userId
      );
      expect(result).toEqual(fakeOrganisation);
      expect(mockClient.from).toHaveBeenCalledWith("organisations");
      expect(mockClient.from).toHaveBeenCalledWith("organisation_users");
    });

    it("should throw an error if organisation insertion fails", async () => {
      const userId = "user-123";
      const inputData = { name: "Test Org", description: "A test org" };
      const errorResponse = { message: "Insertion failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisations") {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({
              data: null,
              error: errorResponse,
            }),
          };
        }
        return {};
      });

      await expect(
        organisationService.createOrganisation(inputData, userId)
      ).rejects.toThrow("Insertion failed");
    });

    it("should throw an error if join table insertion fails", async () => {
      const userId = "user-123";
      const inputData = { name: "Test Org", description: "A test org" };
      const fakeOrganisation = {
        id: "org-001",
        name: "Test Org",
        description: "A test org",
        created_by: userId,
      };
      const joinError = { message: "Join insertion failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisations") {
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({
              data: [fakeOrganisation],
              error: null,
            }),
          };
        }
        if (table === "organisation_users") {
          return {
            insert: jest.fn().mockResolvedValue({ error: joinError }),
          };
        }
        return {};
      });

      await expect(
        organisationService.createOrganisation(inputData, userId)
      ).rejects.toThrow("Join insertion failed");
    });
  });

  describe("getOrganisationsForUser", () => {
    it("should return a list of organisations for the user", async () => {
      const userId = "user-123";
      const orgUserRows = [
        { organisation_id: "org-001" },
        { organisation_id: "org-002" },
      ];
      const fakeOrganisations = [
        { id: "org-001", name: "Org One" },
        { id: "org-002", name: "Org Two" },
      ];

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: orgUserRows, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest
              .fn()
              .mockResolvedValue({ data: fakeOrganisations, error: null }),
          };
        }
        return {};
      });

      const result = await organisationService.getOrganisationsForUser(userId);
      expect(result).toEqual(fakeOrganisations);
      expect(mockClient.from).toHaveBeenCalledWith("organisation_users");
      expect(mockClient.from).toHaveBeenCalledWith("organisations");
    });

    it("should return an empty array if the user has no organisations", async () => {
      const userId = "user-123";
      const orgUserRows = [];

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: orgUserRows, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            select: jest.fn(),
          };
        }
        return {};
      });

      const result = await organisationService.getOrganisationsForUser(userId);
      expect(result).toEqual([]);
    });

    it("should throw an error if join table query fails", async () => {
      const userId = "user-123";
      const errorResponse = { message: "Join query failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.getOrganisationsForUser(userId)
      ).rejects.toThrow("Join query failed");
    });

    it("should throw an error if organisations query fails", async () => {
      const userId = "user-123";
      const orgUserRows = [{ organisation_id: "org-001" }];
      const errorResponse = { message: "Organisations query failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ data: orgUserRows, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            select: jest.fn().mockReturnThis(),
            in: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.getOrganisationsForUser(userId)
      ).rejects.toThrow("Organisations query failed");
    });
  });

  describe("getOrganisationByIdForUser", () => {
    it("should return organisation details if the user is attached", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };
      const fakeOrganisation = { id: organisationId, name: "Org One" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeOrganisation, error: null }),
          };
        }
        return {};
      });

      const result = await organisationService.getOrganisationByIdForUser(
        organisationId,
        userId
      );
      expect(result).toEqual(fakeOrganisation);
    });

    it("should throw an error if the join table query fails", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const errorResponse = { message: "Join query error" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.getOrganisationByIdForUser(organisationId, userId)
      ).rejects.toThrow("Join query error");
    });

    it("should throw an error if the user is not attached to the organisation", async () => {
      const organisationId = "org-001";
      const userId = "user-123";

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: null }),
          };
        }
        return {};
      });

      await expect(
        organisationService.getOrganisationByIdForUser(organisationId, userId)
      ).rejects.toThrow("Organisation not found or not attached to user");
    });

    it("should throw an error if the organisations query fails", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };
      const errorResponse = { message: "Organisation query failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.getOrganisationByIdForUser(organisationId, userId)
      ).rejects.toThrow("Organisation query failed");
    });

    it("should throw an error if the organisation is not found", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: null }),
          };
        }
        return {};
      });

      await expect(
        organisationService.getOrganisationByIdForUser(organisationId, userId)
      ).rejects.toThrow("Organisation not found");
    });
  });

  describe("updateOrganisationForUser", () => {
    it("should update organisation details if the user is attached", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const updateData = { name: "Updated Org" };
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };
      const updatedOrganisation = {
        id: organisationId,
        name: "Updated Org",
        description: "A test org",
        created_by: userId,
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest
              .fn()
              .mockResolvedValue({ data: [updatedOrganisation], error: null }),
          };
        }
        return {};
      });

      const result = await organisationService.updateOrganisationForUser(
        organisationId,
        updateData,
        userId
      );
      expect(result).toEqual(updatedOrganisation);
    });

    it("should throw an error if the join table query fails", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const updateData = { name: "Updated Org" };
      const errorResponse = { message: "Join query error" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.updateOrganisationForUser(
          organisationId,
          updateData,
          userId
        )
      ).rejects.toThrow("Join query error");
    });

    it("should throw an error if the user is not attached to the organisation", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const updateData = { name: "Updated Org" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: null }),
          };
        }
        return {};
      });

      await expect(
        organisationService.updateOrganisationForUser(
          organisationId,
          updateData,
          userId
        )
      ).rejects.toThrow("Organisation not found or not attached to user");
    });

    it("should throw an error if the update query fails", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const updateData = { name: "Updated Org" };
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };
      const errorResponse = { message: "Update failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.updateOrganisationForUser(
          organisationId,
          updateData,
          userId
        )
      ).rejects.toThrow("Update failed");
    });

    it("should throw an error if the update returns an empty array", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const updateData = { name: "Updated Org" };
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            update: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            select: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }
        return {};
      });

      await expect(
        organisationService.updateOrganisationForUser(
          organisationId,
          updateData,
          userId
        )
      ).rejects.toThrow("Organisation update failed");
    });
  });

  describe("deleteOrganisationForUser", () => {
    it("should delete the organisation if the user is attached", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: null }),
          };
        }
        return {};
      });

      const result = await organisationService.deleteOrganisationForUser(
        organisationId,
        userId
      );
      expect(result).toBe(true);
    });

    it("should throw an error if the join table query fails", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const errorResponse = { message: "Join query error" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: errorResponse }),
          };
        }
        return {};
      });

      await expect(
        organisationService.deleteOrganisationForUser(organisationId, userId)
      ).rejects.toThrow("Join query error");
    });

    it("should throw an error if the user is not attached to the organisation", async () => {
      const organisationId = "org-001";
      const userId = "user-123";

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: null, error: null }),
          };
        }
        return {};
      });

      await expect(
        organisationService.deleteOrganisationForUser(organisationId, userId)
      ).rejects.toThrow("Organisation not found or not attached to user");
    });

    it("should throw an error if deletion fails", async () => {
      const organisationId = "org-001";
      const userId = "user-123";
      const fakeJoinRecord = {
        organisation_id: organisationId,
        user_id: userId,
      };
      const deleteError = { message: "Deletion failed" };

      mockClient.from.mockImplementation((table) => {
        if (table === "organisation_users") {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest
              .fn()
              .mockResolvedValue({ data: fakeJoinRecord, error: null }),
          };
        }
        if (table === "organisations") {
          return {
            delete: jest.fn().mockReturnThis(),
            eq: jest.fn().mockResolvedValue({ error: deleteError }),
          };
        }
        return {};
      });

      await expect(
        organisationService.deleteOrganisationForUser(organisationId, userId)
      ).rejects.toThrow("Deletion failed");
    });
  });
});
