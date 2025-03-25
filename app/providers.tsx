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

    // Redirect authenticated users from landing pages to app
    if (
      user &&
      (pathname === "/" ||
        pathname === "/landing" ||
        pathname === "/login" ||
        pathname === "/signup")
    ) {
      router.push("/app");
    }

    // Redirect unauthenticated users to landing page
    // Exclude paths that should be accessible without auth
    else if (
      !user &&
      pathname !== "/landing" &&
      pathname !== "/login" &&
      pathname !== "/signup" &&
      !pathname.startsWith("/auth/") // Add any other public paths here
    ) {
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
