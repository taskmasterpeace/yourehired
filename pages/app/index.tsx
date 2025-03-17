import { useAuth } from '../../context/auth-context'

export default function AppDashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="p-6 bg-white dark:bg-gray-800 shadow">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <button 
            onClick={logout}
            className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900"
          >
            Logout
          </button>
        </div>
      </nav>
      
      <main className="container px-6 mx-auto mt-8">
        <div className="p-6 bg-white rounded-lg shadow dark:bg-gray-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Welcome back, {user?.email}
          </h2>
          {/* Add dashboard content here */}
        </div>
      </main>
    </div>
  )
}import dynamic from 'next/dynamic'

// Import the main application component with dynamic import to handle client-side only features
const CAPTAINGui = dynamic(() => import('../../captain_gui'), { ssr: false })

export default function AppPage() {
  return <CAPTAINGui />
}
