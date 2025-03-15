import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { AuthProvider, useAuth } from '../context/auth-context'
import { useEffect } from 'react'
import { useRouter } from 'next/router'

function AppWrapper({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <AppContent Component={Component} pageProps={pageProps} />
    </AuthProvider>
  )
}

function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  const validPaths = ['/app', '/landing', '/login', '/signup']

  useEffect(() => {
    if (!isLoading) {
      const currentPath = router.pathname
      const isAuthorizedPath = validPaths.includes(currentPath)
      const redirectPath = user ? '/app' : '/landing'

      // Only redirect if current path is invalid or doesn't match auth state
      if (!isAuthorizedPath || currentPath !== redirectPath) {
        router.push(redirectPath).catch((error) => {
          console.error('Routing error:', error)
          router.push('/landing') // Fallback redirect
        })
      }
    }
  }, [user, isLoading, router, validPaths])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return <Component {...pageProps} />
}

export default AppWrapper