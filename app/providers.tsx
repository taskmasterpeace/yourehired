"use client";

import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthRedirector({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Don't redirect while auth state is still loading
    if (isLoading) return;

    // Classify the current route
    const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");
    const isLandingRoute = pathname === "/landing";
    const isAuthRoute =
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/auth/");
    const isRootRoute = pathname === "/";

    // RULE 1: Redirect root path to landing page if not authenticated
    if (isRootRoute && !user) {
      router.push("/landing");
      return;
    }

    // RULE 2: Redirect root path to app if authenticated
    if (isRootRoute && user) {
      router.push("/app");
      return;
    }

    // RULE 3: Redirect to /app if user is logged in and on landing/auth pages
    if (user && (isLandingRoute || isAuthRoute)) {
      router.push("/app");
      return;
    }

    // RULE 4: Redirect to /landing if user is NOT logged in and trying to access app routes
    if (!user && isAppRoute) {
      router.push("/landing");
      return;
    }
  }, [user, isLoading, router, pathname]);

  // Show loading state while determining auth status
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        Initializing application security...
      </div>
    );
  }

  return <>{children}</>;
}
