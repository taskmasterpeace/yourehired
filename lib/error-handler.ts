// Central error handling utility

// For client-side display
export function getPublicErrorMessage(error: unknown): string {
  // Never expose sensitive details in error messages shown to users
  if (error instanceof Error) {
    // You can map specific error types to user-friendly messages
    if (error.message.includes("authentication")) {
      return "Please sign in to continue."
    }

    if (error.message.includes("permission")) {
      return "You don't have permission to perform this action."
    }

    // For database errors, provide a generic message
    if (error.message.includes("database") || error.message.includes("query")) {
      return "There was a problem with our system. Please try again later."
    }

    // For validation errors, you might want to be more specific
    if (error.message.includes("validation")) {
      return "Please check your input and try again."
    }
  }

  // Default generic message
  return "Something went wrong. Please try again later."
}

// For server-side logging
export function logServerError(error: unknown, context?: Record<string, any>): void {
  // Here you would typically log to a service like Sentry, LogRocket, etc.
  console.error("Server error:", {
    error:
      error instanceof Error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : String(error),
    context,
    timestamp: new Date().toISOString(),
  })
}

// Utility for API routes to handle errors consistently
export function handleApiError(error: unknown, res: Response) {
  logServerError(error)

  return new Response(
    JSON.stringify({
      error: getPublicErrorMessage(error),
    }),
    {
      status: 500,
      headers: { "Content-Type": "application/json" },
    },
  )
}

