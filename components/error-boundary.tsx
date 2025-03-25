"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { getPublicErrorMessage } from "@/lib/error-handler";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex h-screen flex-col items-center justify-center p-4 text-center">
      <h2 className="mb-2 text-2xl font-bold">Something went wrong</h2>
      <p className="mb-4 text-muted-foreground">
        {getPublicErrorMessage(error)}
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
