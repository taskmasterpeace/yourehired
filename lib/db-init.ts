import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for initialization
const createSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// Flag to track if we've already attempted initialization
let initializationAttempted = false

export async function initializeDatabase(forceCheck = false) {
  // Skip if we've already attempted initialization and not forcing a check
  if (initializationAttempted && !forceCheck) {
    return true
  }

  initializationAttempted = true

  try {
    console.log("Checking database schema...")
    const supabase = createSupabaseClient()

    // Simple ping to check connectivity
    const { error: pingError } = await supabase.from("applications").select("count").limit(1).single()

    // If we get a "relation does not exist" error, we need to create the tables
    if (pingError && pingError.message.includes('relation "public.applications" does not exist')) {
      console.log("Tables don't exist, attempting to create schema...")
      return await createTables(supabase)
    } else if (pingError) {
      // For other errors, log but don't fail - the tables might already exist
      console.warn("Error checking schema, but continuing:", pingError.message)
      return true
    }

    console.log("Database schema already exists")
    return true
  } catch (error) {
    console.error("Failed to initialize database:", error)
    // Don't throw, just return false to indicate failure
    return false
  }
}

// Create tables with direct SQL
async function createTables(supabase: any) {
  try {
    // Create applications table
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE TABLE IF NOT EXISTS applications (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          company_name TEXT NOT NULL,
          position_title TEXT NOT NULL,
          location TEXT,
          job_description TEXT,
          status TEXT NOT NULL,
          date_added TIMESTAMP WITH TIME ZONE DEFAULT now(),
          date_applied TIMESTAMP WITH TIME ZONE,
          salary TEXT,
          notes TEXT,
          contact_name TEXT,
          contact_email TEXT,
          contact_phone TEXT,
          url TEXT,
          tags TEXT[],
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `,
      })
      .catch((e) => console.warn("Error creating applications table:", e))

    // Create events table
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE TABLE IF NOT EXISTS events (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          title TEXT NOT NULL,
          date TIMESTAMP WITH TIME ZONE NOT NULL,
          type TEXT NOT NULL,
          notes TEXT,
          location TEXT,
          is_completed BOOLEAN DEFAULT false,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `,
      })
      .catch((e) => console.warn("Error creating events table:", e))

    // Create status_history table
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE TABLE IF NOT EXISTS status_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
          user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
          status TEXT NOT NULL,
          date TIMESTAMP WITH TIME ZONE DEFAULT now(),
          notes TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
        );
      `,
      })
      .catch((e) => console.warn("Error creating status_history table:", e))

    // Enable Row Level Security
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
        ALTER TABLE events ENABLE ROW LEVEL SECURITY;
        ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;
      `,
      })
      .catch((e) => console.warn("Error enabling RLS:", e))

    // Create policies for applications
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE POLICY IF NOT EXISTS "Users can view their own applications"
        ON applications FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own applications"
        ON applications FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own applications"
        ON applications FOR UPDATE
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own applications"
        ON applications FOR DELETE
        USING (auth.uid() = user_id);
      `,
      })
      .catch((e) => console.warn("Error creating application policies:", e))

    // Create policies for events
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE POLICY IF NOT EXISTS "Users can view their own events"
        ON events FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own events"
        ON events FOR INSERT
        WITH CHECK (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can update their own events"
        ON events FOR UPDATE
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can delete their own events"
        ON events FOR DELETE
        USING (auth.uid() = user_id);
      `,
      })
      .catch((e) => console.warn("Error creating event policies:", e))

    // Create policies for status_history
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE POLICY IF NOT EXISTS "Users can view their own status history"
        ON status_history FOR SELECT
        USING (auth.uid() = user_id);

        CREATE POLICY IF NOT EXISTS "Users can insert their own status history"
        ON status_history FOR INSERT
        WITH CHECK (auth.uid() = user_id);
      `,
      })
      .catch((e) => console.warn("Error creating status history policies:", e))

    // Create indexes for performance
    await supabase
      .rpc("exec_sql", {
        sql_string: `
        CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
        CREATE INDEX IF NOT EXISTS idx_events_application_id ON events(application_id);
        CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
        CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON status_history(application_id);
        CREATE INDEX IF NOT EXISTS idx_status_history_user_id ON status_history(user_id);
      `,
      })
      .catch((e) => console.warn("Error creating indexes:", e))

    console.log("Database schema created successfully")
    return true
  } catch (error) {
    console.error("Failed to create tables:", error)
    return false
  }
}

