// src/controllers/organisation.controller.js
import organisationService from "../services/organisation.service.js";

class OrganisationController {
  /**
   * POST /organisations
   */
  async createOrganisation(req, res, next) {
    try {
      const userId = req.user.sub;

      const { name, description } = req.body;
      // TODO: Validate input (e.g., using Joi or express-validator)

      const organisation = await organisationService.createOrganisation(
        { name, description },
        userId
      );
      res.status(201).json({
        message: "Organisation created successfully",
        data: organisation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /organisations
   * Returns all organisations associated with the logged in user.
   */
  async getOrganisations(req, res, next) {
    try {
      const userId = req.user.sub;
      const organisations = await organisationService.getOrganisationsForUser(
        userId
      );
      res.status(200).json({
        message: "Organisations fetched successfully",
        data: organisations,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /organisations/:id
   * Fetch a single organisation by ID, only if the user is attached.
   */
  async getOrganisation(req, res, next) {
    try {
      const userId = req.user.sub;
      const organisationId = req.params.id;
      const organisation = await organisationService.getOrganisationByIdForUser(
        organisationId,
        userId
      );
      res.status(200).json({
        message: "Organisation fetched successfully",
        data: organisation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * UPDATE /organisations/:id
   * Delete an organisation, only if the user is attached.
   */
  async updateOrganisation(req, res, next) {
    try {
      const userId = req.user.sub;
      const organisationID = req.params.id;
      const { name, description } = req.body;

      const organisation = await organisationService.updateOrganisationForUser(
        organisationID,
        { name, description },
        userId
      );
      res.status(200).json({
        message: "Organisations updated successfully",
        data: organisation,
      });
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /organisations/:id
   * Delete an organisation, only if the user is attached.
   */
  async deleteOrganisation(req, res, next) {
    try {
      const userId = req.user.sub;
      const organisationId = req.params.id;
      await organisationService.deleteOrganisationForUser(
        organisationId,
        userId
      );
      res.status(200).json({
        message: "Organisation deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  }
}

export default new OrganisationController();
