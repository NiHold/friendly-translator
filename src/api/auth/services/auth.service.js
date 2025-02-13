// src/services/auth.service.js
import { getSupabaseClient } from "../../../common/factories/supabaseClient.factory.js";

const supabase = getSupabaseClient();

class AuthService {
  /**
   * Registers a new user using Supabase Auth.
   * @param {Object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<Object>}
   */
  async registerUser({ email, password }) {
    const { user, session, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { user, session };
  }

  /**
   * Logs in a user using Supabase Auth.
   * @param {Object} param0
   * @param {string} param0.email
   * @param {string} param0.password
   * @returns {Promise<Object>}
   */
  async loginUser({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw new Error(error.message);
    }
    return { data };
  }

  /**
   * Logs out a user using Supabase Auth.
   * @param {Object} param0
   * @returns {Promise<Object>}
   */
  async logoutUser(token) {
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
