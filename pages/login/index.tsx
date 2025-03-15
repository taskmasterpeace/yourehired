import { useAuth } from '../../context/auth-context'
import { useRouter } from 'next/router'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()

  const handleLogin = () => {
    // Temporary login for testing
    login({ email: 'test@example.com' })
    router.push('/app')
  }

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
  )
}