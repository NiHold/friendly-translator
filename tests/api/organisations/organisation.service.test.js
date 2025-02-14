// tests/organisation.service.test.js
import organisationService from "../../../src/api/organisations/services/organisation.service.js";
import { getSupabaseClient } from "../../../src/common/factories/supabaseClient.factory.js";

jest.mock("../../../src/common/factories/supabaseClient.factory.js");

describe("Organisation Service", () => {
  let fakeOrganisation;
  let fakeUser;
  let fakeSupabase;

  beforeEach(() => {
    // Define fake data for testing.
    fakeOrganisation = {
      id: "11111111-1111-1111-1111-111111111111",
      name: "Test Organisation",
      description: "A test organisation",
      created_by: "user-uuid",
    };

    fakeUser = { id: "user-uuid" };

    // Create a fake Supabase client with chainable methods.
    fakeSupabase = {
      from: jest.fn((tableName) => {
        if (tableName === "organisations") {
          return {
            // For createOrganisation: simulate an insert call that returns the organisation.
            insert: jest.fn().mockReturnValue({
              select: jest
                .fn()
                .mockResolvedValue({ data: [fakeOrganisation], error: null }),
            }),
            // For getOrganisationsForUser or getOrganisationByIdForUser: simulate a select.
            select: jest
              .fn()
              .mockResolvedValue({ data: [fakeOrganisation], error: null }),
            // For deleteOrganisationForUser: simulate a delete call.
            delete: jest.fn().mockResolvedValue({ error: null }),
            eq: jest.fn().mockReturnThis(),
            in: jest
              .fn()
              .mockResolvedValue({ data: [fakeOrganisation], error: null }),
          };
        }
        if (tableName === "organisation_users") {
          return {
            // For getOrganisationsForUser: simulate a select returning join rows.
            select: jest.fn().mockResolvedValue({
              data: [{ organisation_id: fakeOrganisation.id }],
              error: null,
            }),
            // For createOrganisation: simulate a successful insert into the join table.
            insert: jest.fn().mockResolvedValue({ error: null }),
            // For getOrganisationByIdForUser and deleteOrganisationForUser: simulate checking membership.
            eq: jest.fn().mockReturnThis(),
            maybeSingle: jest.fn().mockResolvedValue({
              data: { organisation_id: fakeOrganisation.id },
              error: null,
            }),
          };
        }
      }),
    };

    // Make getSupabaseClient return the fake client.
    getSupabaseClient.mockReturnValue(fakeSupabase);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("createOrganisation should insert organisation and create join record", async () => {
    const result = await organisationService.createOrganisation(
      {
        name: fakeOrganisation.name,
        description: fakeOrganisation.description,
      },
      fakeUser.id
    );

    expect(result).toEqual(fakeOrganisation);

    // Verify that Supabase was called for both organisations and organisation_users.
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisations");
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisation_users");
  });

  test("getOrganisationsForUser should return organisations for the user", async () => {
    const result = await organisationService.getOrganisationsForUser(
      fakeUser.id
    );
    expect(result).toEqual([fakeOrganisation]);
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisation_users");
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisations");
  });

  test("getOrganisationByIdForUser should return a single organisation if user is attached", async () => {
    const result = await organisationService.getOrganisationByIdForUser(
      fakeOrganisation.id,
      fakeUser.id
    );
    expect(result).toEqual(fakeOrganisation);
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisation_users");
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisations");
  });

  test("deleteOrganisationForUser should delete organisation if user is attached", async () => {
    const result = await organisationService.deleteOrganisationForUser(
      fakeOrganisation.id,
      fakeUser.id
    );
    expect(result).toBe(true);
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisation_users");
    expect(fakeSupabase.from).toHaveBeenCalledWith("organisations");
  });
});
