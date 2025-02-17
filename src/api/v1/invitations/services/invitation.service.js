import crypto from "crypto";
import { getSupabaseClient } from "#common/factories/supabaseClient.factory.js";

class InvitationService {
  async sendInvitation({ organisationId, invitedBy, email, expires_at }) {
    const supabase = getSupabaseClient();

    // Generate a unique token
    const token = crypto.randomBytes(20).toString("hex");

    // Insert invitation record
    const { data, error } = await supabase
      .from("invitations")
      .insert({
        organisation_id: organisationId,
        invited_by: invitedBy,
        email,
        token,
        expires_at: expires_at, // optional
      })
      .select();

    if (error) throw new Error(error.message);

    // Here you would trigger an email sending function
    // e.g., await emailService.sendInvitationEmail(email, token);
    return data[0];
  }

  async acceptInvitation(token, userId) {
    const supabase = getSupabaseClient();
    // Retrieve the invitation by token
    const { data: invitationData, error } = await supabase
      .from("invitations")
      .select("*")
      .eq("token", token)
      .maybeSingle();

    if (error) throw new Error(error.message);
    if (!invitationData) throw new Error("Invalid or expired invitation");

    // Check if invitation is still pending and not expired
    if (invitationData.status !== "pending") {
      throw new Error("Invitation already used or expired");
    }

    // Add user to organisation (assuming you have an organisation_users table)
    const { error: joinError } = await supabase
      .from("organisation_users")
      .insert({
        organisation_id: invitationData.organisation_id,
        user_id: userId,
      });

    if (joinError) throw new Error(joinError.message);

    // Mark invitation as accepted
    const { error: updateError } = await supabase
      .from("invitations")
      .update({ status: "accepted" })
      .eq("id", invitationData.id);

    if (updateError) throw new Error(updateError.message);

    return invitationData;
  }
}

export default new InvitationService();
