// auth-guard.tsx
"use client";
import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function AuthGuard({ children, requiredRole }: AuthGuardProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [redirectAttempted, setRedirectAttempted] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    // If not loading, no user, and haven't tried to redirect yet
    if (!isLoading && !user && !redirectAttempted) {
      setRedirectAttempted(true);
      console.log("AuthGuard: No user found, redirecting to login");
      // Use window.location for a hard redirect
      window.location.href = "/login";
    }
  }, [isLoading, user, redirectAttempted]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // If no user, show loading while redirect happens
  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Please wait...</p>
          <button
            onClick={() => (window.location.href = "/login")}
            className="text-primary underline mt-4 focus:outline-none"
          >
            Click here if not redirecting
          </button>
        </div>
      </div>
    );
  }

  // User is authenticated, render children
  return <>{children}</>;
}
