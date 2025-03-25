"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { AuthService } from "@/lib/auth-service";
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

// Validation schema for reset password
const resetPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  // Setup form with validation
  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const handleResetPassword = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setError("");
    setEmail(values.email);

    try {
      await AuthService.resetPassword(values.email);
      setIsSubmitted(true);
      toast({
        title: "Reset link sent",
        description: "Check your email for a link to reset your password.",
      });
    } catch (err: any) {
      setError(err.message || "Failed to send reset link. Please try again.");
      toast({
        variant: "destructive",
        title: "Reset failed",
        description: "There was a problem sending the reset link.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <Link href="/login">
            <Button
              variant="outline"
              className="text-white border-white hover:bg-white hover:text-black"
            >
              ← Back to Login
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
                Reset Password
              </h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Enter your email address and we'll send you a link to reset your
                password
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md flex items-start">
                <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 text-red-500" />
                <p>{error}</p>
              </div>
            )}

            <div className="space-y-4">
              {isSubmitted ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Check your email</h3>
                  <p className="text-muted-foreground mb-4">
                    We've sent a password reset link to <strong>{email}</strong>
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Didn't receive the email? Check your spam folder or{" "}
                    <button
                      onClick={() => setIsSubmitted(false)}
                      className="text-primary hover:underline"
                    >
                      try again
                    </button>
                  </p>
                </div>
              ) : (
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleResetPassword)}
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
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <div className="p-0 h-auto font-normal text-lg">
                          Send Reset Link
                        </div>
                      )}
                    </Button>
                  </form>
                </Form>
              )}

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Remember your password?
                </p>
                <Link href="/login">
                  <Button
                    variant="link"
                    className="text-blue-600 p-0 h-auto font-normal text-sm"
                  >
                    Back to login
                  </Button>
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
