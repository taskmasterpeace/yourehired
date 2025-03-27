// lib/db-init.ts
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Create a Supabase client for initialization
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  });
};

// Flag to track if we've already attempted initialization
let initializationAttempted = false;

export async function initializeDatabase(forceCheck = false) {
  // Skip if we've already attempted initialization and not forcing a check
  if (initializationAttempted && !forceCheck) {
    return true;
  }

  initializationAttempted = true;

  try {
    console.log("Checking database schema...");
    const supabase = createSupabaseClient();

    // Simple ping to check connectivity
    const { error: pingError } = await supabase
      .from("applications")
      .select("count")
      .limit(1)
      .single();

    // If we get a "relation does not exist" error, we need to create the tables
    if (
      pingError &&
      pingError.message.includes(
        'relation "public.applications" does not exist'
      )
    ) {
      console.log("Tables don't exist, attempting to create schema...");
      return await createTables(supabase);
    } else if (pingError) {
      // For other errors, log but don't fail - the tables might already exist
      console.warn("Error checking schema, but continuing:", pingError.message);
      return true;
    }

    console.log("Database schema already exists");
    return true;
  } catch (error: unknown) {
    console.error("Failed to initialize database:", error);
    // Don't throw, just return false to indicate failure
    return false;
  }
}

// Create tables with direct SQL
async function createTables(supabase: SupabaseClient) {
  try {
    // Create all tables using the complete schema
    const { error } = await supabase.rpc("exec_sql", {
      sql_string: `
        -- Create applications table
        CREATE TABLE IF NOT EXISTS public.applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          company_name TEXT NOT NULL,
          position_title TEXT NOT NULL,
          status TEXT NOT NULL,
          location TEXT DEFAULT '',
          date_added TIMESTAMPTZ DEFAULT now(),
          date_applied TIMESTAMPTZ,
          job_description TEXT DEFAULT '',
          salary TEXT,
          notes TEXT,
          contact_name TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          url TEXT,
          tags TEXT[] DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
        );

        -- Create status_history table
        CREATE TABLE IF NOT EXISTS public.status_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          date TIMESTAMPTZ DEFAULT now(),
          notes TEXT,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT now()
        );

        -- Create events table
        CREATE TABLE IF NOT EXISTS public.events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          date TIMESTAMPTZ NOT NULL,
          type TEXT NOT NULL,
          notes TEXT,
          location TEXT,
          is_completed BOOLEAN DEFAULT FALSE,
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- Create profiles table
        CREATE TABLE IF NOT EXISTS public.profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          name TEXT,
          email TEXT,
          dark_mode BOOLEAN DEFAULT FALSE,
          master_resume TEXT,
          created_at TIMESTAMPTZ DEFAULT now(),
          updated_at TIMESTAMPTZ DEFAULT now()
        );

        -- Create chat_messages table
        CREATE TABLE IF NOT EXISTS public.chat_messages (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          application_id UUID REFERENCES public.applications(id) ON DELETE CASCADE,
          message TEXT NOT NULL,
          sender TEXT NOT NULL,
          timestamp TIMESTAMPTZ DEFAULT now(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `,
    });

    if (error) {
      console.warn("Error creating tables:", error);
      return false;
    }

    // Add RLS policies and indexes in a separate call to avoid query size limits
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql_string: `
        -- Add Row Level Security (RLS) policies
        -- Applications: users can only see their own applications
        ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own applications" ON public.applications;
        CREATE POLICY "Users can CRUD their own applications" ON public.applications
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        -- Status History: users can only see their own status history
        ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own status history" ON public.status_history;
        CREATE POLICY "Users can CRUD their own status history" ON public.status_history
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        -- Events: users can only see their own events
        ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own events" ON public.events;
        CREATE POLICY "Users can CRUD their own events" ON public.events
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);

        -- Profiles: users can only see their own profile
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own profile" ON public.profiles;
        CREATE POLICY "Users can CRUD their own profile" ON public.profiles
          USING (auth.uid() = id)
          WITH CHECK (auth.uid() = id);

        -- Chat Messages: users can only see their own chat messages
        ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own chat messages" ON public.chat_messages;
        CREATE POLICY "Users can CRUD their own chat messages" ON public.chat_messages
          USING (auth.uid() = user_id)
          WITH CHECK (auth.uid() = user_id);
      `,
    });

    if (rlsError) {
      console.warn("Error setting up RLS policies:", rlsError);
      // Continue anyway
    }

    // Add trigger for automatic profile creation
    const { error: triggerError } = await supabase.rpc("exec_sql", {
      sql_string: `
        -- Create profile trigger to create profile when user signs up
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$        BEGIN
          INSERT INTO public.profiles (id, email)
          VALUES (NEW.id, NEW.email);
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger the function every time a user is created
        DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
        CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
      `,
    });

    if (triggerError) {
      console.warn("Error setting up user trigger:", triggerError);
      // Continue anyway
    }

    // Create indexes for performance
    const { error: indexError } = await supabase.rpc("exec_sql", {
      sql_string: `
        -- Indices to improve query performance
        CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
        CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON public.status_history(application_id);
        CREATE INDEX IF NOT EXISTS idx_events_application_id ON public.events(application_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_application_id ON public.chat_messages(application_id);
      `,
    });

    if (indexError) {
      console.warn("Error creating indexes:", indexError);
      // Continue anyway
    }

    console.log("Database schema created successfully");
    return true;
  } catch (error: unknown) {
    console.error("Failed to create tables:", error);
    return false;
  }
}
