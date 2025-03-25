import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

// Create a singleton instance for the browser
let browserClient: SupabaseClient | null = null;

// Create a single supabase client for the browser
export const createSupabaseClient = () => {
  // For SSR, always create a new client
  if (typeof window === "undefined") {
    return createNewClient();
  }

  // For client-side, use the singleton pattern
  if (!browserClient) {
    browserClient = createNewClient();
  }

  return browserClient;
};

// Helper to create a new client
function createNewClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// For server-side operations that need admin privileges
export const createSupabaseAdminClient = () => {
  // This should only be used server-side
  if (typeof window !== "undefined") {
    throw new Error("Admin client should only be used on the server");
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Missing Supabase admin environment variables");
  }

  return createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
};
