import React from "react";
import { useAuth } from "@/context/auth-context";
import { ProtectedContentProps } from "@/types";

// Protected content wrapper component
export const ProtectedContent = ({
  children,
  fallback = (
    <div className="p-4 text-center">Please sign in to access this feature</div>
  ),
}: ProtectedContentProps) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="p-4 text-center">Loading...</div>;
  }

  if (!user) {
    return fallback;
  }

  return <>{children}</>;
};
