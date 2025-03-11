"use client"

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { 
  getUserOpportunities, 
  saveUserOpportunities,
  getUserResume,
  saveUserResume,
  getUserEvents,
  saveUserEvents
} from '../lib/userDataService';

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
  const [localStorageOnly, setLocalStorageOnly] = useState<boolean>(
    typeof window !== 'undefined' && localStorage.getItem('localStorageOnly') === 'true' || false
  );

  useEffect(() => {
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
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { data: data.session, error };
    } catch (error) {
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

  // Update localStorage when localStorageOnly changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('localStorageOnly', localStorageOnly.toString());
    
    // If switching from local-only to cloud storage, offer to sync local data
    if (user && !localStorageOnly && localStorage.getItem('localStorageOnly') === 'true') {
      // Get local data
      try {
        const localOpportunities = JSON.parse(localStorage.getItem('opportunities') || '[]');
        const localResume = localStorage.getItem('masterResume') || '';
        const localEvents = JSON.parse(localStorage.getItem('events') || '[]');
        
        // If there's local data, offer to sync it
        if (localOpportunities.length > 0 || localResume || localEvents.length > 0) {
          const shouldSync = window.confirm(
            "You have local data that isn't synced to the cloud. Would you like to upload your local data now?"
          );
          
          if (shouldSync) {
            saveUserData({
              opportunities: localOpportunities,
              resume: localResume,
              events: localEvents
            });
          }
        }
      } catch (error) {
        console.error('Error syncing local data:', error);
      }
    }
  }, [localStorageOnly, user]);

  // Add online/offline event listeners
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleOnline = async () => {
      // If we have pending syncs and we're not in local-only mode
      if (localStorage.getItem('pendingSync') === 'true' && !localStorageOnly && user) {
        console.log('Back online. Syncing pending data...');
        try {
          // Get local data
          const localOpportunities = JSON.parse(localStorage.getItem('opportunities') || '[]');
          const localResume = localStorage.getItem('masterResume') || '';
          const localEvents = JSON.parse(localStorage.getItem('events') || '[]');
          
          // Sync to server
          await saveUserData({
            opportunities: localOpportunities,
            resume: localResume,
            events: localEvents
          });
          
          console.log('Pending data synced successfully');
        } catch (error) {
          console.error('Error syncing pending data:', error);
        }
      }
    };
    
    window.addEventListener('online', handleOnline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
    };
  }, [user, localStorageOnly]);
  
  // User data functions
  const loadUserData = async () => {
    // If in local storage only mode, don't load from database
    if (localStorageOnly) {
      return { opportunities: [], resume: '', events: [] };
    }
    
    if (!user) return { opportunities: [], resume: '', events: [] };
    
    try {
      const [opportunities, resume, events] = await Promise.all([
        getUserOpportunities(user.id),
        getUserResume(user.id),
        getUserEvents(user.id)
      ]);
      
      return { opportunities, resume, events };
    } catch (err) {
      console.error('Error loading user data:', err);
      throw err;
    }
  };

  const saveUserData = async ({ opportunities, resume, events }) => {
    // If in local storage only mode, don't save to database
    if (localStorageOnly) {
      return; // Just return as data is already saved to localStorage by the state management
    }
    
    if (!user) throw new Error('User must be logged in to save data');
    
    // Check if online
    if (!navigator.onLine) {
      console.warn('Currently offline. Data will only be saved locally.');
      // Set a flag to sync when back online
      localStorage.setItem('pendingSync', 'true');
      return;
    }
    
    try {
      const savePromises = [];
      
      if (opportunities) {
        savePromises.push(saveUserOpportunities(user.id, opportunities));
      }
      
      if (resume) {
        savePromises.push(saveUserResume(user.id, resume));
      }
      
      if (events) {
        savePromises.push(saveUserEvents(user.id, events));
      }
      
      await Promise.all(savePromises);
      // Clear pending sync flag if successful
      localStorage.removeItem('pendingSync');
    } catch (err) {
      console.error('Error saving user data:', err);
      // Set a flag to retry sync later
      localStorage.setItem('pendingSync', 'true');
      // Don't throw the error to prevent app crashes
      // Instead, we'll retry on next save attempt or when online
    }
  };

  const value = {
    user,
    session,
    isLoading,
    localStorageOnly,
    setLocalStorageOnly,
    signIn,
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
