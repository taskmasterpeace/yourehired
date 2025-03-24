"use client";

import type React from "react";

import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase-client";

// Simple auth context with minimal state
type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const supabase = getSupabaseClient();

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setIsLoading(false);
    });

    // Set up auth state listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null);
    });

    // Clean up
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

// Simplified data functions that only use localStorage
export const loadUserData = async () => {
  const storedData = localStorage.getItem("captainAppState");
  if (storedData) {
    return JSON.parse(storedData);
  }
  return { opportunities: [], resume: "", events: [] };
};

export const saveUserData = async ({
  opportunities,
  resume,
  events,
}: {
  opportunities?: any[];
  resume?: string;
  events?: any[];
}) => {
  try {
    const currentData = await loadUserData();
    const newData = {
      ...currentData,
      ...(opportunities && { opportunities }),
      ...(resume && { resume }),
      ...(events && { events }),
    };
    localStorage.setItem("captainAppState", JSON.stringify(newData));
  } catch (error) {
    console.error("Error saving user data:", error);
  }
};

export function useAuth() {
  return useContext(AuthContext);
}
