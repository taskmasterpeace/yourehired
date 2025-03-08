import React, { useState } from 'react';
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/navigation';

export function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
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
        // Successful login, redirect to home page
        router.push('/');
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

  return (
    <div className="space-y-4">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign In</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Enter your email and password to sign in to your account
        </p>
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
