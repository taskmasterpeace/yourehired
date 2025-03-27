"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
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
import { createSupabaseClient } from "@/lib/supabase";

// Validation schema for signup form
const signupSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
    confirmPassword: z
      .string()
      .min(6, { message: "Password must be at least 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export default function SignupPage() {
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();

  // Setup form with validation
  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Redirect if user is already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/app");
    }
  }, [user, authLoading, router]);

  const handleSignup = async (values: SignupFormValues) => {
    setIsSubmitting(true);
    setError("");
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
      });
      if (error) throw error;
      toast({
        title: "Account created",
        description: "Please check your email to confirm your account.",
      });
      // Redirect to login page after signup
      router.push("/login");
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.message || "Failed to create account. Please try again.");
      toast({
        variant: "destructive",
        title: "Signup failed",
        description: "There was a problem creating your account.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsSubmitting(true);
    setError("");
    try {
      const supabase = createSupabaseClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
      // The redirect will happen automatically, no need to navigate
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      setError(
        err.message || "Failed to sign in with Google. Please try again."
      );
      toast({
        variant: "destructive",
        title: "Google sign-in failed",
        description: "There was a problem signing in with Google.",
      });
      setIsSubmitting(false);
    }
  };

  // If user exists or auth is loading, show loading indicator
  if ((user || authLoading) && !error) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Please wait...</p>
          <Button
            onClick={() => router.push("/app")}
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
                Create an Account
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Sign up to get started
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
                onClick={handleGoogleSignIn}
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
                    Or sign up with email
                  </span>
                </div>
              </div>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(handleSignup)}
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
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={isSubmitting}
                            autoComplete="new-password"
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
                    name="confirmPassword"
                    render={({ field, fieldState }) => (
                      <FormItem className="space-y-2">
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="password"
                            disabled={isSubmitting}
                            autoComplete="new-password"
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
                        Creating account...
                      </>
                    ) : (
                      "Sign up"
                    )}
                  </Button>
                </form>
              </Form>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{" "}
                  <Link href="/login" className="text-blue-600 hover:underline">
                    Sign in
                  </Link>
                </p>
              </div>
              <div className="text-center text-xs text-gray-500 dark:text-gray-400">
                By signing up, you agree to our{" "}
                <Link href="/terms" className="text-blue-600 hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-blue-600 hover:underline">
                  Privacy Policy
                </Link>
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
