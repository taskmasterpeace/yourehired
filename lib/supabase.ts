import { createClient } from '@supabase/supabase-js';

// These environment variables need to be set in your .env.local file
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

console.log('Initializing Supabase client...');
console.log('URL available:', !!supabaseUrl);
console.log('Key available:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check your environment variables.');
}

// Create a dummy client if credentials are missing
const createDummyClient = () => {
  console.warn('Using dummy Supabase client. Authentication features will not work.');
  
  return {
    auth: {
      getSession: () => {
        console.log('Dummy client: getSession called');
        return Promise.resolve({ data: { session: null } });
      },
      onAuthStateChange: () => {
        console.log('Dummy client: onAuthStateChange called');
        return { data: { subscription: { unsubscribe: () => {} } } };
      },
      signInWithPassword: () => {
        console.log('Dummy client: signInWithPassword called');
        return Promise.resolve({ data: { session: null }, error: null });
      },
      signUp: () => {
        console.log('Dummy client: signUp called');
        return Promise.resolve({ data: { session: null }, error: null });
      },
      signOut: () => {
        console.log('Dummy client: signOut called');
        return Promise.resolve();
      },
      resetPasswordForEmail: () => {
        console.log('Dummy client: resetPasswordForEmail called');
        return Promise.resolve({ data: null, error: null });
      },
      signInWithOAuth: () => {
        console.log('Dummy client: signInWithOAuth called');
        return Promise.resolve({ data: { url: null }, error: null });
      }
    }
  };
};

// Export the client or a dummy if credentials are missing
let client;
try {
  if (supabaseUrl && supabaseAnonKey) {
    console.log('Creating real Supabase client...');
    client = createClient(supabaseUrl, supabaseAnonKey);
    console.log('Supabase client created successfully');
  } else {
    console.log('Creating dummy Supabase client...');
    client = createDummyClient();
  }
} catch (error) {
  console.error('Error creating Supabase client:', error);
  console.log('Falling back to dummy client...');
  client = createDummyClient();
}

export const supabase = client;
