import React, { useState, useEffect } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/navigation';
import { Separator } from "../../components/ui/separator";

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [signInTimer, setSignInTimer] = useState<NodeJS.Timeout | null>(null);
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  // Clear any active timer when component unmounts
  useEffect(() => {
    return () => {
      if (signInTimer) {
        clearTimeout(signInTimer);
      }
    };
  }, [signInTimer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    
    console.log('Sign in process started...');

    // Set a timeout to handle stuck sign-in process
    const timer = setTimeout(() => {
      console.log('Sign in process timed out after 15 seconds');
      setError('Sign in process is taking longer than expected. Please try again or use an alternative sign-in method.');
      setIsLoading(false);
    }, 15000); // 15 seconds timeout
    
    setSignInTimer(timer);

    try {
      // Check if signIn function exists (it might not if Supabase isn't initialized)
      if (!signIn) {
        clearTimeout(timer);
        setSignInTimer(null);
        setError('Authentication service is not available. Please try refreshing the page or check your internet connection.');
        console.error('Sign in function is not available - Supabase may not be properly initialized');
        setIsLoading(false);
        return;
      }

      console.log('Calling signIn function...');
      const { error, data } = await signIn(email, password);
      
      // Clear the timeout since we got a response
      clearTimeout(timer);
      setSignInTimer(null);
      
      if (error) {
        console.error('Sign in error:', error);
        // Provide more user-friendly error messages based on error type
        if (error.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (error.message.includes('network')) {
          setError('Network error. Please check your internet connection and try again.');
        } else {
          setError(error.message || 'An error occurred during sign in.');
        }
      } else if (data) {
        // Successful login, redirect to main application
        console.log('Successfully signed in! Redirecting...');
        router.push('/app');
      } else {
        // No data and no error is unusual
        console.warn('Sign in returned neither data nor error');
        setError('Unable to sign in. Please try again later.');
      }
    } catch (err) {
      // Clear the timeout since we got a response (even an error)
      clearTimeout(timer);
      setSignInTimer(null);
      
      console.error('Unexpected error during sign in:', err);
      setError('An unexpected error occurred. Please refresh the page and try again.');
    } finally {
      // Set loading to false if not already done by the timeout
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    console.log('Google sign in process started...');
    
    // Set a timeout for Google sign-in process
    const timer = setTimeout(() => {
      console.log('Google sign in process timed out');
      setError('Google sign in is taking longer than expected. Please check your popup blocker and try again.');
      setIsLoading(false);
    }, 30000); // 30 seconds timeout for OAuth
    
    setSignInTimer(timer);
    
    try {
      if (!signInWithGoogle) {
        clearTimeout(timer);
        setSignInTimer(null);
        setError('Google authentication is not available. Please try refreshing the page.');
        setIsLoading(false);
        return;
      }
      
      console.log('Calling signInWithGoogle function...');
      const { error } = await signInWithGoogle();
      
      // Clear the timeout since we got a response
      clearTimeout(timer);
      setSignInTimer(null);
      
      if (error) {
        console.error('Google sign in error:', error);
        // Check for specific Google sign-in errors
        if (error.message.includes('popup')) {
          setError('Google sign-in popup was blocked. Please allow popups for this site and try again.');
        } else {
          setError(error.message || 'An error occurred during Google sign in.');
        }
        setIsLoading(false);
      }
      // No need to redirect here as the OAuth redirect will handle it
    } catch (err) {
      // Clear the timeout
      clearTimeout(timer);
      setSignInTimer(null);
      
      console.error('Unexpected error during Google sign in:', err);
      setError('An unexpected error occurred with Google sign in. Please try again later.');
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your email and password to sign in to your account
        </p>
      </div>
      <Button 
        type="button" 
        variant="outline" 
        className="w-full flex items-center justify-center gap-2"
        onClick={handleGoogleSignIn}
        disabled={isLoading}
      >
        <img src="/google-logo.png" alt="Google" width="16" height="16" />
        Sign in with Google
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <Separator className="w-full" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
            {error}
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Password</Label>
            <Button variant="link" className="p-0 h-auto text-xs" type="button">
              Forgot password?
            </Button>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
    </div>
  );
}
