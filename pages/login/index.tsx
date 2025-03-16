import { useAuth } from '../../context/auth-context';
import { useRouter } from 'next/router';
import Link from 'next/link';

export default function LoginPage() {
  const { signIn } = useAuth(); // Use signIn instead of login
  const router = useRouter();

  const handleLogin = async () => {
    try {
      // Use the correct function from auth context
      await signIn('test@example.com', 'password');
      router.push('/app');
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <h1 className="text-3xl font-bold dark:text-white">Login</h1>
      <button 
        onClick={handleLogin}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Temporary Login
      </button>
    </div>
  );
}
