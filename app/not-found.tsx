// app/not-found.tsx
"use client";

import { useAuth } from "@/context/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function NotFound() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [destination, setDestination] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading) {
      setDestination(user ? "/app" : "/landing");
    }
  }, [user, isLoading]);

  const handleReturn = () => {
    if (destination) {
      router.push(destination);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center p-8 max-w-md mx-auto">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-6">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>

        {isLoading ? (
          <div className="animate-pulse text-gray-500">Loading...</div>
        ) : (
          <button
            onClick={handleReturn}
            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-md"
          >
            Return to {user ? "Dashboard" : "Home"}
          </button>
        )}
      </div>
    </div>
  );
}
