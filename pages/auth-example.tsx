import React from 'react';
import { useAuth } from '@/context/auth-context';
import { AuthModal } from '@/components/auth/AuthModal';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthExample() {
  const { user, isLoading, signOut } = useAuth();

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Authentication Example</h1>
      
      {isLoading ? (
        <div className="flex items-center justify-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : user ? (
        <Card>
          <CardHeader>
            <CardTitle>Welcome, {user.email}</CardTitle>
            <CardDescription>You are currently signed in</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium">User ID:</h3>
                <p className="text-sm text-gray-500">{user.id}</p>
              </div>
              <div>
                <h3 className="font-medium">Email:</h3>
                <p className="text-sm text-gray-500">{user.email}</p>
              </div>
              <Button onClick={signOut} variant="destructive">Sign Out</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center">
          <p className="mb-4">You are not signed in.</p>
          <AuthModal 
            trigger={<Button>Sign In / Sign Up</Button>}
          />
        </div>
      )}
    </div>
  );
}
