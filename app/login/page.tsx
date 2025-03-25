"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { AuthService } from "@/lib/auth-service";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { loginSchema } from "@/lib/validation";

// Type for the login form values
type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [clickCount, setClickCount] = useState(0); // Add this for debugging
  const searchParams = useSearchParams();
  const redirectTo = searchParams?.get("redirectTo") || "/app";
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Setup form with validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, redirectTo, router]);

  // Check for error parameter in URL
  useEffect(() => {
    const errorParam = searchParams?.get("error");
    if (errorParam) {
      setError("Authentication failed. Please try again.");
    }
  }, [searchParams]);

  const handleEmailLogin = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    setError("");
    // Using updated AuthService that returns errors instead of throwing them
    const { error: signInError } = await AuthService.signIn(
      values.email,
      values.password
    );
    if (signInError) {
      console.error("Login error:", signInError);
      // Handle specific error messages for better user experience
      if (signInError.message.includes("Invalid login credentials")) {
        setError("Invalid email or password. Please try again.");
      } else if (signInError.message.includes("Too many requests")) {
        setError("Too many login attempts. Please try again later.");
      } else if (signInError.message.includes("Email not confirmed")) {
        setError("Please verify your email before logging in.");
      } else {
        setError(
          signInError.message || "Authentication failed. Please try again."
        );
      }
      setIsSubmitting(false);
      return;
    }
    // Success - Auth context will update and useEffect will handle redirect
  };

  const handleGoogleLogin = async () => {
    setIsSubmitting(true);
    setError("");
    const { error: googleError } = await AuthService.signInWithGoogle();
    if (googleError) {
      console.error("Google sign-in error:", googleError);
      setError(
        googleError.message ||
          "Failed to sign in with Google. Please try again."
      );
      setIsSubmitting(false);
    }
    // If successful, redirect will happen automatically when auth state changes
  };

  // New signup handler that uses window.location
  const goToSignup = (e) => {
    e.preventDefault();
    console.log(`Sign up clicked. Click count: ${clickCount + 1}`);
    setClickCount((prev) => prev + 1);

    // Force navigation with window.location for reliability
    window.location.href = "/signup";
  };

  // If user exists or auth is loading, show loading indicator
  if ((user || authLoading) && !error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Please wait...</p>
          <Button
            onClick={() => router.push(redirectTo)}
            variant="link"
            className="mt-4"
          >
            Click here if not redirecting
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: "url(/login-background.jpg)" }}
    >
      {/* Overlay for better text readability */}
      <div className="absolute inset-0 bg-black/40"></div>
      {/* Content */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="container mx-auto p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <img
              src="/logo.png"
              alt="Hey, You're Hired! Logo"
              className="w-10 h-10"
            />
            <span className="text-xl font-bold text-white">
              Hey, You're Hired!
            </span>
          </Link>
          <Link href="/">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              ← Back to Home
            </Button>
          </Link>
        </header>
        {/* Main content */}
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl">
            <div className="flex justify-center">
              <img
                src="/logo.png"
                alt="Hey, You're Hired! Logo"
                className="w-20 h-20"
              />
            </div>
            <div className="text-center">
              <h1 className="text-3xl font-bold dark:text-white">
                Welcome Back
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign in to your account
              </p>
            </div>
            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                <p>{error}</p>
              </div>
            )}
            <div className="space-y-4">
              <Button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <img
                    src="/google-logo.png"
                    alt="Google"
                    className="w-5 h-5"
                  />
                )}
                Continue with Google
              </Button>
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
                    Or sign in with email
                  </span>
                </div>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleEmailLogin)}
                  className="space-y-4"
                >
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            placeholder="name@example.com"
                            disabled={isSubmitting}
                            autoComplete="email"
                            className={cn(
                              fieldState.error &&
                                "border-red-500 focus-visible:ring-red-500"
                            )}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <div className="flex items-center text-red-500 text-sm mt-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <FormMessage className="text-red-500 font-semibold" />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-2">
                        <div className="flex items-center justify-between">
                          <FormLabel>Password</FormLabel>
                          <Link
                            href="/forgot-password"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            Forgot password?
                          </Link>
                        </div>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={isSubmitting}
                            autoComplete="current-password"
                            className={cn(
                              fieldState.error &&
                                "border-red-500 focus-visible:ring-red-500"
                            )}
                          />
                        </FormControl>
                        {fieldState.error && (
                          <div className="flex items-center text-red-500 text-sm mt-1">
                            <AlertCircle className="h-4 w-4 mr-1" />
                            <FormMessage className="text-red-500 font-semibold" />
                          </div>
                        )}
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <div className="p-0 h-auto font-normal text-lg">
                        Sign in
                      </div>
                    )}
                  </Button>
                </form>
              </Form>

              {/* Completely redesigned signup section */}
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?
                </p>
                <Button
                  variant="link"
                  className="text-blue-600 p-0 h-auto font-normal text-sm"
                  onClick={goToSignup}
                >
                  Sign up
                </Button>
              </div>
            </div>
          </div>
        </main>
        {/* Footer */}
        <footer className="container mx-auto p-4 text-center text-sm text-white">
          <p>
            © {new Date().getFullYear()} Hey, You're Hired! All rights reserved.
          </p>
        </footer>
      </div>
    </div>
  );
}
