// src/services/organisation.service.js
import { getSupabaseClient } from "../../../common/factories/supabaseClient.factory.js";

const supabase = getSupabaseClient();

class OrganisationService {
  /**
   * Creates a new organisation and associates it with the given user.
   * @param {Object} organisationData
   * @param {string} organisationData.name
   * @param {string} [organisationData.description]
   * @param {string} userId - The id of the user creating the organisation.
   * @returns {Promise<Object>} - The created organisation.
   */
  async createOrganisation({ name, description }, userId) {
    // Insert the organisation record.
    const { data: organisationDataRes, error: organisationError } =
      await supabase
        .from("organisations")
        .insert({ name, description, created_by: userId })
        .select(); // .select() returns the inserted rows

    if (organisationError) {
      throw new Error(organisationError.message);
    }

    const organisation = organisationDataRes[0];

    // Insert a record into the join table to link the organisation and user.
    const { error: joinError } = await supabase
      .from("organisation_users")
      .insert({ organisation_id: organisation.id, user_id: userId });

    if (joinError) {
      throw new Error(joinError.message);
    }

    return organisation;
  }

  /**
   * Fetches all organisations associated with a given user.
   * @param {string} userId - The id of the logged in user.
   * @returns {Promise<Array>} - A list of organisations.
   */
  async getOrganisationsForUser(userId) {
    // First, get the organisation IDs from the join table.
    const { data: orgUserRows, error: orgUserError } = await supabase
      .from("organisation_users")
      .select("organisation_id")
      .eq("user_id", userId);

    if (orgUserError) {
      throw new Error(orgUserError.message);
    }

    // Extract the organisation IDs.
    const orgIds = orgUserRows.map((row) => row.organisation_id);

    // If there are no organisations, return an empty array.
    if (orgIds.length === 0) {
      return [];
    }

    // Now fetch the organisations details.
    const { data: organisations, error: orgError } = await supabase
      .from("organisations")
      .select("*")
      .in("id", orgIds);

    if (orgError) {
      throw new Error(orgError.message);
    }

    return organisations;
  }

  /**
   * Fetch a single organisation by its ID if the user is attached.
   * @param {string} organisationId - The organisation ID.
   * @param {string} userId - The id of the logged in user.
   * @returns {Promise<Object>} - The organisation details.
   */
  async getOrganisationByIdForUser(organisationId, userId) {
    // Check membership via the join table.
    const { data: orgUser, error: orgUserError } = await supabase
      .from("organisation_users")
      .select("*")
      .eq("organisation_id", organisationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (orgUserError) {
      throw new Error(orgUserError.message);
    }
    if (!orgUser) {
      throw new Error("Organisation not found or not attached to user");
    }

    // Fetch the organisation details.
    const { data: organisation, error: orgError } = await supabase
      .from("organisations")
      .select("*")
      .eq("id", organisationId)
      .maybeSingle();

    if (orgError) {
      throw new Error(orgError.message);
    }
    if (!organisation) {
      throw new Error("Organisation not found");
    }

    return organisation;
  }

  /**
   * Updates an organisation if the user is attached.
   * @param {string} organisationId - The organisation ID.
   * @param {Object} updateData - An object containing fields to update (e.g., name, description).
   * @param {string} userId - The id of the logged in user.
   * @returns {Promise<Object>} - The updated organisation details.
   */
  async updateOrganisationForUser(organisationId, updateData, userId) {
    // First, ensure the user is attached to the organisation.
    const { data: orgUser, error: orgUserError } = await supabase
      .from("organisation_users")
      .select("*")
      .eq("organisation_id", organisationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (orgUserError) {
      throw new Error(orgUserError.message);
    }
    if (!orgUser) {
      throw new Error("Organisation not found or not attached to user");
    }

    // Update the organisation record.
    const { data: updatedOrg, error: updateError } = await supabase
      .from("organisations")
      .update(updateData)
      .eq("id", organisationId)
      .select(); // .select() returns the updated rows

    if (updateError) {
      throw new Error(updateError.message);
    }
    if (!updatedOrg || updatedOrg.length === 0) {
      throw new Error("Organisation update failed");
    }

    return updatedOrg[0];
  }

  /**
   * Deletes an organisation if the user is attached.
   * @param {string} organisationId - The organisation ID.
   * @param {string} userId - The id of the logged in user.
   * @returns {Promise<boolean>}
   */
  async deleteOrganisationForUser(organisationId, userId) {
    // First, ensure the user is attached to the organisation.
    const { data: orgUser, error: orgUserError } = await supabase
      .from("organisation_users")
      .select("*")
      .eq("organisation_id", organisationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (orgUserError) {
      throw new Error(orgUserError.message);
    }
    if (!orgUser) {
      throw new Error("Organisation not found or not attached to user");
    }

    // Delete the organisation.
    const { error: deleteError } = await supabase
      .from("organisations")
      .delete()
      .eq("id", organisationId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }

    return true;
  }
}

export default new OrganisationService();
