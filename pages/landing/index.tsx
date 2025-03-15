import Link from 'next/link'
import { useDarkMode } from '../../hooks/useDarkMode'

export default function LandingPage() {
  const { isDarkMode, toggleDarkMode } = useDarkMode()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="flex justify-between p-6">
        <div className="text-2xl font-bold text-gray-900 dark:text-white">
          Your Logo
        </div>
        <div className="flex gap-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
          >
            {isDarkMode ? '🌞' : '🌙'}
          </button>
          <Link href="/login" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
            Get Started
          </Link>
        </div>
      </nav>

      <main className="container px-6 mx-auto mt-20">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Welcome to Captain GUI
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Modern interface for managing your Kubernetes clusters
          </p>
          <div className="flex justify-center gap-4">
            <Link href="/login" className="px-8 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Sign In
            </Link>
            <Link href="/signup" className="px-8 py-3 text-lg font-medium text-gray-900 bg-gray-200 rounded-lg dark:text-white dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600">
              Sign Up
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}