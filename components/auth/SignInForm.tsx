import React, { useState } from 'react';
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
  const { signIn, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Check if signIn function exists (it might not if Supabase isn't initialized)
      if (!signIn) {
        setError('Authentication service is not available. Please check console for details.');
        console.error('Sign in function is not available - Supabase may not be properly initialized');
        return;
      }

      const { error, data } = await signIn(email, password);
      if (error) {
        setError(error.message);
        console.error('Sign in error:', error);
      } else if (data) {
        // Successful login, redirect to main application
        router.push('/app');
        // Show success message
        console.log('Successfully signed in!');
      } else {
        // No data and no error is unusual
        console.warn('Sign in returned neither data nor error');
        setError('Unable to sign in. Please try again later.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Unexpected error during sign in:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        setError(error.message);
        console.error('Google sign in error:', error);
        setIsLoading(false);
      }
      // No need to redirect here as the OAuth redirect will handle it
    } catch (err) {
      setError('An unexpected error occurred with Google sign in');
      console.error('Unexpected error during Google sign in:', err);
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
