/**
 * Formats a Supabase user object into your desired user response.
 * @param {Object} user
 * @returns {Object}
 */
export const formatUserResponse = (user) => ({
  id: user.id,
  email: user.email,
  role: user.role,
  email_confirmed_at: user.email_confirmed_at,
  last_sign_in_at: user.last_sign_in_at,
  created_at: user.created_at,
  updated_at: user.updated_at,
});

/**
 * Formats a Supabase session object into your desired session response.
 * @param {Object} session
 * @returns {Object}
 */
export const formatSessionResponse = (session) => ({
  access_token: session.access_token,
  token_type: session.token_type,
  expires_in: session.expires_in,
  expires_at: session.expires_at,
  refresh_token: session.refresh_token,
});
