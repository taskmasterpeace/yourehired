"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

type User = {
  id: string;
  email: string;
  user_metadata: {
    full_name: string;
  };
};

type Session = {
  user: User;
  access_token: string;
  expires_at: number;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  localStorageOnly: boolean;
  setLocalStorageOnly: (value: boolean) => void;
  signIn: (email: string, password: string) => Promise<{
    error: Error | null;
    data?: Session | null;
  }>;
  signInWithGoogle: () => Promise<{
    error: Error | null;
    data?: any;
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
  loadUserData: () => Promise<{
    opportunities: any[];
    resume: string;
    events: any[];
  }>;
  saveUserData: (data: {
    opportunities?: any[];
    resume?: string;
    events?: any[];
  }) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [localStorageOnly, setLocalStorageOnly] = useState<boolean>(true);
  const router = useRouter();

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('captain_user');
    const storedSession = localStorage.getItem('captain_session');
    
    if (storedUser && storedSession) {
      setUser(JSON.parse(storedUser));
      setSession(JSON.parse(storedSession));
    }
    
    setIsLoading(false);
  }, []);

  // Simplified auth functions that only use localStorage
  const signIn = async (email: string, password: string) => {
    try {
      // Create mock user and session
      const mockUser = {
        id: `local_${Date.now()}`,
        email,
        user_metadata: {
          full_name: email.split('@')[0]
        }
      };

      const mockSession = {
        user: mockUser,
        access_token: 'local_token',
        expires_at: Date.now() + (7 * 24 * 60 * 60 * 1000)
      };

      // Store in localStorage
      localStorage.setItem('captain_user', JSON.stringify(mockUser));
      localStorage.setItem('captain_session', JSON.stringify(mockSession));
      
      setUser(mockUser);
      setSession(mockSession);
      
      return { data: mockSession, error: null };
    } catch (error) {
      return { error: error instanceof Error ? error : new Error('Unknown error'), data: null };
    }
  };

  const signUp = async (email: string, password: string) => {
    return signIn(email, password);
  };

  const signOut = async () => {
    localStorage.removeItem('captain_user');
    localStorage.removeItem('captain_session');
    setUser(null);
    setSession(null);
  };

  const signInWithGoogle = async () => {
    return { error: new Error('Google sign-in not available in local mode'), data: null };
  };

  const resetPassword = async (email: string) => {
    return { error: new Error('Password reset not available in local mode'), data: null };
  };

  // Simplified data functions that only use localStorage
  const loadUserData = async () => {
    const storedData = localStorage.getItem('captainAppState');
    if (storedData) {
      return JSON.parse(storedData);
    }
    return { opportunities: [], resume: '', events: [] };
  };

  const saveUserData = async ({ opportunities, resume, events }: {
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
        ...(events && { events })
      };
      localStorage.setItem('captainAppState', JSON.stringify(newData));
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const value = {
    user,
    session,
    isLoading,
    localStorageOnly,
    setLocalStorageOnly,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
    resetPassword,
    loadUserData,
    saveUserData,
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
