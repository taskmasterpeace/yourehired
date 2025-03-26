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

-- Add Row Level Security (RLS) policies
-- Applications: users can only see their own applications
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own applications" ON public.applications
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Status History: users can only see their own status history
ALTER TABLE public.status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own status history" ON public.status_history
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Events: users can only see their own events
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own events" ON public.events
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Profiles: users can only see their own profile
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own profile" ON public.profiles
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Chat Messages: users can only see their own chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD their own chat messages" ON public.chat_messages
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create profile trigger to create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger the function every time a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indices to improve query performance
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON public.applications(user_id);
CREATE INDEX IF NOT EXISTS idx_status_history_application_id ON public.status_history(application_id);
CREATE INDEX IF NOT EXISTS idx_events_application_id ON public.events(application_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_application_id ON public.chat_messages(application_id);