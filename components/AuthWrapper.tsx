"use client"

import React, { useEffect } from 'react';
import { AuthProvider } from '../context/auth-context';
import { useAuth } from '../context/auth-context';
import { usePathname, useRouter } from 'next/navigation';

// Protected routes wrapper
function ProtectedRouteWrapper({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  useEffect(() => {
    // Skip redirect for login and signup pages
    if (pathname === '/login' || pathname === '/signup') {
      return;
    }
    
    // Wait until auth is loaded before redirecting
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router, pathname]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="h-16 w-16 bg-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold">Loading...</h2>
        </div>
      </div>
    );
  }
  
  // If on login/signup page or authenticated, render children
  if (pathname === '/login' || pathname === '/signup' || user) {
    return <>{children}</>;
  }
  
  // Otherwise show minimal loading (during redirect)
  return null;
}

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <ProtectedRouteWrapper>{children}</ProtectedRouteWrapper>
    </AuthProvider>
  );
}
