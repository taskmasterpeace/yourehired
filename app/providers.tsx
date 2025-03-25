"use client";
import { useAuth } from "@/context/auth-context";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export function AuthRedirector({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // First, determine if this is a route that requires authentication
    // based on the URL structure rather than explicit lists
    const isAppRoute = pathname === "/app" || pathname.startsWith("/app/");
    const isPublicRoute =
      pathname === "/" ||
      pathname === "/landing" ||
      pathname === "/login" ||
      pathname === "/signup" ||
      pathname.startsWith("/auth/");

    // If it's neither a recognized app route nor public route,
    // don't redirect - let the framework handle 404s
    if (!isAppRoute && !isPublicRoute) {
      return;
    }

    // Redirect authenticated users from landing pages to app
    if (user && isPublicRoute && !pathname.startsWith("/auth/")) {
      router.push("/app");
    }
    // Redirect unauthenticated users from app routes to landing
    else if (!user && isAppRoute) {
      router.push("/landing");
    }
  }, [user, isLoading, router, pathname]);

  if (isLoading) {
    return (
      <div className="p-4 text-center">
        Initializing application security...
      </div>
    );
  }

  return <>{children}</>;
}
