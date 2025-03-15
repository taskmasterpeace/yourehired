import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/context/auth-context';

export default function Home() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        // If user is logged in, show the main application
        router.push('/app');
      } else {
        // If user is not logged in, redirect to landing page
        router.push('/');
      }
    }
  }, [user, isLoading, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="h-16 w-16 bg-blue-200 rounded-full animate-pulse mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold">Loading...</h2>
      </div>
    </div>
  );
}
