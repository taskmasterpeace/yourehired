"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

// Log environment variables availability (without exposing actual values)
console.log("Auth context initialization", {
  supabaseUrlAvailable: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
  supabaseKeyAvailable: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  // Don't log the actual values for security reasons
  urlPrefix: process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 10) + "...",
  environment: process.env.NODE_ENV
});

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: Session | null;
  }>;
  signUp: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: Session | null;
  }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{
    error: Error | null;
    data: {} | null;
  }>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check storage availability
    try {
      localStorage.setItem('test', 'test');
      localStorage.removeItem('test');
      console.log("localStorage is available");
    } catch (e) {
      console.error("localStorage is not available:", e);
    }
    
    // Check if cookies are enabled
    document.cookie = "testcookie=1; SameSite=Strict; Secure";
    const cookiesEnabled = document.cookie.indexOf("testcookie=") !== -1;
    console.log("Cookies enabled:", cookiesEnabled);
    
    // Check if Supabase is properly initialized
    if (!supabase.auth) {
      console.error('Supabase auth is not available. Authentication will not work.');
      setIsLoading(false);
      return;
    }

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    try {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (_event, session) => {
          setSession(session);
          setUser(session?.user ?? null);
          setIsLoading(false);
        }
      );

      return () => {
        subscription.unsubscribe();
      };
    } catch (error) {
      console.error('Error setting up auth listener:', error);
      setIsLoading(false);
      return () => {}; // Return empty cleanup function
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    console.log("Sign-in attempt started for:", email);
    try {
      console.log("Supabase instance check:", {
        authAvailable: !!supabase.auth,
        baseUrl: supabase.supabaseUrl
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log("Sign-in response:", { 
        success: !!data.session, 
        error: error?.message || null,
        userId: data.user?.id || null,
        sessionExpiry: data.session?.expires_at || null
      });
      
      if (data.session) {
        console.log("Authentication successful, redirecting...");
        window.location.href = '/';
      } else if (error) {
        console.error("Authentication error:", error.message);
      }
      
      return { data: data.session, error };
    } catch (error) {
      console.error("Sign-in exception:", error);
      return { error: error as Error, data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data: data.session, error };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      return { data, error };
    } catch (error) {
      return { error: error as Error, data: null };
    }
  };

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
