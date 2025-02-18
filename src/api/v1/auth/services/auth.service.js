// src/services/auth.service.js
import { getSupabaseClient } from "#common/factories/supabaseClient.factory.js";
import {
  formatUserResponse,
  formatSessionResponse,
} from "#common/formatters/user.formatter.js";

class AuthService {
  /**
   * Registers a new user using Supabase Auth.
   * @param {Object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<Object>}
   */
  async registerUser({ email, password }) {
    const supabase = getSupabaseClient();

    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      const err = new Error(error.message);
      err.status = error.status;
      throw err;
    }

    return {
      user: formatUserResponse(user),
      session: formatSessionResponse(session),
    };
  }

  /**
   * Logs in a user using Supabase Auth.
   * @param {Object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<Object>}
   */
  async loginUser({ email, password }) {
    const supabase = getSupabaseClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      const err = new Error(error.message);
      err.status = error.status;
      throw err;
    }

    const { user, session } = data;

    return {
      user: formatUserResponse(user),
      session: formatSessionResponse(session),
    };
  }

  /**
   * Logs out a user using Supabase Auth.
   * @param {Object} param0
   * @returns {Promise<Object>}
   */
  async logoutUser(token) {
    const supabase = getSupabaseClient();

    // Set the access token for the current client session.
    supabase.auth.setAuth(token);
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
    return { message: "User logged out successfully" };
  }
}

export default new AuthService();
