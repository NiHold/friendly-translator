import invitationService from "../services/invitation.service.js";

class InvitationController {
  // POST /organisations/:id/invitations
  async sendInvitation(req, res, next) {
    try {
      const organisationId = req.params.id;
      const invitedBy = req.user.sub; // Assuming authenticated user
      const { email, expiresAt } = req.body;

      // Validate that req.user is part of the organisation (omitted for brevity)

      const invitation = await invitationService.sendInvitation({
        organisationId,
        invitedBy,
        email,
        expiresAt,
      });

      res.status(201).json({
        message: "Invitation sent successfully",
        data: invitation,
      });
    } catch (err) {
      next(err);
    }
  }

  // GET /invitations/accept?token=...
  async acceptInvitation(req, res, next) {
    try {
      const { token } = req.query;
      // Assume userId comes from either an authenticated session or registration process
      const userId = req.user.sub;

      const invitation = await invitationService.acceptInvitation(
        token,
        userId
      );
      res.status(200).json({
        message:
          "Invitation accepted. You have been added to the organisation.",
        data: invitation,
      });
    } catch (err) {
      if (err.message === "Invalid or expired invitation") {
        err.status = 400;
      }
      next(err);
    }
  }
}

export default new InvitationController();
