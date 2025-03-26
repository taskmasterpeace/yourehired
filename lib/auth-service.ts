import { createSupabaseClient } from "./supabase";

// Get the current origin for redirects
const origin = typeof window !== "undefined" ? window.location.origin : "";

export const AuthService = {
  /**
   * Sign in with email and password
   * @returns Object containing data and error (if any)
   */
  async signIn(email: string, password: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  /**
   * Sign up with email and password
   * @returns Object containing data and error (if any)
   */
  async signUp(email: string, password: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Sign out the current user
   * @returns Object containing success status and error (if any)
   */
  async signOut() {
    const supabase = createSupabaseClient();
    const { error } = await supabase.auth.signOut();
    return { success: !error, error };
  },

  /**
   * Send password reset email
   * @returns Object containing success status and error (if any)
   */
  async resetPassword(email: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });
    return { success: !error, data, error };
  },

  /**
   * Sign in with Google OAuth
   * @returns Object containing data and error (if any)
   */
  async signInWithGoogle() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
    return { data, error };
  },

  /**
   * Get the current user session
   * @returns Object containing session data and error (if any)
   */
  async getSession() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getSession();
    return {
      session: data.session,
      error,
    };
  },

  /**
   * Get the current user
   * @returns Object containing user data and error (if any)
   */
  async getUser() {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.getUser();
    return {
      user: data.user,
      error,
    };
  },

  /**
   * Update user profile
   * @returns Object containing user data and error (if any)
   */
  async updateProfile(userData: { [key: string]: any }) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.updateUser(userData);
    return {
      user: data.user,
      error,
    };
  },

  /**
   * Change password for authenticated user
   * @returns Object containing user data and error (if any)
   */
  async changePassword(password: string) {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.updateUser({
      password,
    });
    return {
      user: data.user,
      error,
    };
  },

  /**
   * Verify OTP (one-time password) for email verification or password recovery
   * @returns Object containing session data and error (if any)
   */
  async verifyOTP(email: string, token: string, type: "email" | "recovery") {
    const supabase = createSupabaseClient();
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type,
    });
    return {
      session: data.session,
      user: data.user,
      error,
    };
  },
};
