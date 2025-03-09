import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Debug information
console.log('Supabase initialization:');
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('URL value check:', supabaseUrl ? 'Has value' : 'Empty');
console.log('Key value check:', supabaseAnonKey ? 'Has value' : 'Empty');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
  console.error('Available env vars:', Object.keys(process.env).filter(key => key.startsWith('NEXT_')));
}

// Create a dummy client if credentials are missing
const createDummyClient = () => {
  console.warn('Using dummy Supabase client. Authentication features will not work.');
  
  return {
    auth: {
      getSession: () => Promise.resolve({ data: { session: null } }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signInWithPassword: () => Promise.resolve({ data: { session: null }, error: null }),
      signUp: () => Promise.resolve({ data: { session: null }, error: null }),
      signOut: () => Promise.resolve(),
      resetPasswordForEmail: () => Promise.resolve({ data: null, error: null })
    }
  };
};

// Export the client or a dummy if credentials are missing
const client = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createDummyClient();

console.log('Using real Supabase client:', !!(supabaseUrl && supabaseAnonKey));
console.log('Client has auth methods:', !!client.auth);

export const supabase = client;
