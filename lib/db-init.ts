import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Create a Supabase client for initialization
export const createSupabaseClient = () => {
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

// Initialize the database with all tables
export async function initializeDatabase() {
  try {
    console.log("Initializing database schema...");
    const supabase = createSupabaseClient();

    // Create applications and related tables
    const { error: createBasicTablesError } = await supabase.rpc("exec_sql", {
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
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          resume TEXT -- Add resume field to store the tailored resume
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

        -- Create notifications table
        CREATE TABLE IF NOT EXISTS public.notifications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          message TEXT NOT NULL,
          type TEXT NOT NULL,
          read BOOLEAN DEFAULT FALSE,
          action_url TEXT,
          reference_id TEXT,
          reference_type TEXT,
          timestamp TIMESTAMPTZ DEFAULT now(),
          created_at TIMESTAMPTZ DEFAULT now()
        );
      `,
    });

    if (createBasicTablesError) {
      console.error("Error creating basic tables:", createBasicTablesError);
      return false;
    }

    // Create resume versioning tables
    const { error: createResumeVersionsError } = await supabase.rpc(
      "exec_sql",
      {
        sql_string: `
          -- Resume versions table to store history of resume changes
          CREATE TABLE IF NOT EXISTS public.resume_versions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            name VARCHAR(255),
            timestamp TIMESTAMPTZ NOT NULL DEFAULT now(),
            is_current BOOLEAN DEFAULT FALSE,
            application_id UUID REFERENCES public.applications(id) ON DELETE SET NULL
          );

          -- Quick action presets table
          CREATE TABLE IF NOT EXISTS public.quick_action_presets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            name VARCHAR(255) NOT NULL,
            prompt TEXT NOT NULL,
            category VARCHAR(50) DEFAULT 'custom',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
          );
        `,
      }
    );

    if (createResumeVersionsError) {
      console.error(
        "Error creating resume version tables:",
        createResumeVersionsError
      );
      return false;
    }

    // Create indexes for performance
    const { error: createIndexesError } = await supabase.rpc("exec_sql", {
      sql_string: `
        -- Indexes for applications and related tables
        CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
        CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON public.status_history(application_id);
        CREATE INDEX IF NOT EXISTS idx_events_application_id ON public.events(application_id);
        CREATE INDEX IF NOT EXISTS idx_chat_messages_application_id ON public.chat_messages(application_id);
        
        -- Indexes for resume versioning tables
        CREATE INDEX IF NOT EXISTS idx_resume_versions_user_id ON public.resume_versions(user_id);
        CREATE INDEX IF NOT EXISTS idx_resume_versions_is_current ON public.resume_versions(is_current);
        CREATE INDEX IF NOT EXISTS idx_resume_versions_application_id ON public.resume_versions(application_id);
        CREATE INDEX IF NOT EXISTS idx_quick_action_presets_user_id ON public.quick_action_presets(user_id);
        
        -- Indexes for notifications
        CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
        CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
      `,
    });

    if (createIndexesError) {
      console.warn("Error creating indexes:", createIndexesError);
      // Continue anyway
    }

    // Add RLS policies for all tables
    const { error: rlsError } = await supabase.rpc("exec_sql", {
      sql_string: `
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

        -- Resume Versions: users can only see their own resume versions
        ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own resume versions" ON public.resume_versions;
        CREATE POLICY "Users can CRUD their own resume versions" ON public.resume_versions
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

        -- Quick Action Presets: users can only see their own quick actions
        ALTER TABLE public.quick_action_presets ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own quick action presets" ON public.quick_action_presets;
        CREATE POLICY "Users can CRUD their own quick action presets" ON public.quick_action_presets
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);

        -- Notifications: users can only see their own notifications
        ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "Users can CRUD their own notifications" ON public.notifications;
        CREATE POLICY "Users can CRUD their own notifications" ON public.notifications
        USING (auth.uid() = user_id)
        WITH CHECK (auth.uid() = user_id);
      `,
    });

    if (rlsError) {
      console.warn("Error setting up RLS policies:", rlsError);
      // Continue anyway
    }

    // Create function and trigger for managing current resume version
    const { error: triggerError } = await supabase.rpc("exec_sql", {
      sql_string: `
        -- Create profile trigger to create profile when user signs up
        CREATE OR REPLACE FUNCTION public.handle_new_user()
        RETURNS TRIGGER AS $$ BEGIN
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

        -- Create function to manage current resume version
        CREATE OR REPLACE FUNCTION public.set_current_resume()
        RETURNS TRIGGER AS $$ BEGIN
          -- Only apply the current flag update if this is marked as current
          IF NEW.is_current THEN
            -- First set all versions for this user to not current
            UPDATE public.resume_versions
            SET is_current = FALSE
            WHERE user_id = NEW.user_id AND id != NEW.id;
            
            -- Ensure the new version is current
            IF NOT NEW.is_current THEN
              NEW.is_current := TRUE;
            END IF;
          END IF;
          RETURN NEW;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;

        -- Trigger to manage current resume version
        DROP TRIGGER IF EXISTS set_current_resume_trigger ON public.resume_versions;
        CREATE TRIGGER set_current_resume_trigger
        AFTER INSERT OR UPDATE OF is_current ON public.resume_versions
        FOR EACH ROW EXECUTE FUNCTION public.set_current_resume();
      `,
    });

    if (triggerError) {
      console.warn("Error setting up triggers:", triggerError);
      // Continue anyway
    }

    console.log("Database initialization completed successfully");
    return true;
  } catch (error) {
    console.error("Failed to initialize database:", error);
    return false;
  }
}
