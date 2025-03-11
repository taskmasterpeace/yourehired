-- Create user_opportunities table
CREATE TABLE user_opportunities (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opportunity_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_resumes table
CREATE TABLE user_resumes (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resume_data TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_events table
CREATE TABLE user_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  event_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX idx_user_opportunities_user_id ON user_opportunities(user_id);
CREATE INDEX idx_user_resumes_user_id ON user_resumes(user_id);
CREATE INDEX idx_user_events_user_id ON user_events(user_id);

-- Set up Row Level Security (RLS) policies
ALTER TABLE user_opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_events ENABLE ROW LEVEL SECURITY;

-- Create policies that only allow users to access their own data
CREATE POLICY "Users can only access their own opportunities" 
ON user_opportunities FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own resumes" 
ON user_resumes FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own events" 
ON user_events FOR ALL 
USING (auth.uid() = user_id);
