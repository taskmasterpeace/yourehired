import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useState, useEffect } from 'react';
import React from 'react';

export default function LoginPage() {
  const { signIn, signInWithGoogle, user, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/app');
    }
  }, [user, isLoading, router]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const { error } = await signIn(email, password);
      if (error) {
        setError(error.message || 'Failed to sign in');
      } else {
        router.push('/app');
      }
    } catch (error) {
      setError('An unexpected error occurred');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await signInWithGoogle();
      if (error) {
        console.error('Google login error:', error);
        setError(error.message || 'Failed to sign in with Google');
      }
      // No need to redirect as OAuth will handle it
    } catch (error) {
      console.error('Google login error:', error);
      setError('An unexpected error occurred during Google sign-in');
    }
  };

  return (
    <div 
      className="min-h-screen bg-cover bg-center flex flex-col"
      style={{ backgroundImage: 'url(/login-background.jpg)' }}
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
            <span className="text-xl font-bold text-white">Hey, You're Hired!</span>
          </Link>
          
          <Link href="/">
            <Button variant="outline" className="text-white border-white hover:bg-white hover:text-black">
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
              <h1 className="text-3xl font-bold dark:text-white">Welcome Back</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Sign in to your account</p>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-200 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <Button 
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-2"
                variant="outline"
              >
                <img 
                  src="/google-logo.png" 
                  alt="Google" 
                  className="w-5 h-5"
                />
                Sign in with Google
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">Or sign in with email</span>
                </div>
              </div>
              
              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Password</Label>
                    <Link href="/forgot-password" className="text-sm text-blue-600 hover:underline">
                      Forgot password?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
              
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{" "}
                  <Link href="/signup" className="text-blue-600 hover:underline">
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="container mx-auto p-4 text-center text-sm text-white">
          <p>© {new Date().getFullYear()} Hey, You're Hired! All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
