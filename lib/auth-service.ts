import { getSupabaseClient } from "./supabase-client";

// Get the current origin for redirects
const origin = typeof window !== "undefined" ? window.location.origin : "";

export const AuthService = {
  async signIn(email: string, password: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    return true;
  },

  async signUp(email: string, password: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return true;
  },

  async signOut() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    return true;
  },

  async resetPassword(email: string) {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) throw error;

    return true;
  },

  async signInWithGoogle() {
    const supabase = getSupabaseClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) throw error;

    return true;
  },
};
