import '../styles/globals.css'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '../styles/calendar.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { AuthProvider, useAuth } from '../context/auth-context'
import { AppProvider } from '../context/context'
import { useEffect } from 'react'

const SAFE_PATHS = ['/', '/landing', '/login', '/signup', '/app', '/dashboard', '/index']

// Inner component that uses auth
function AppContent({ Component, pageProps }: AppProps) {
  const router = useRouter()
  const { user, isLoading } = useAuth()
  
  console.log('App render state:', {
    user: user?.email,
    isLoading,
    path: router.pathname,
    isReady: router.isReady
  })

  useEffect(() => {
    if (!router.isReady || isLoading) return

    // EMERGENCY FIX: Add emergency page to SAFE_PATHS
    const EMERGENCY_PATHS = [...SAFE_PATHS, '/emergency-fix']
    
    // Completely skip redirects for emergency page
    if (router.pathname === '/emergency-fix') {
      console.log('Accessing emergency page - skipping all redirects');
      return;
    }

    // Ensure redirectPath is always a valid string with a fallback
    let redirectPath = user ? '/app' : '/landing'
    
    console.log('Routing check:', {
      currentPath: router.pathname,
      redirectPath,
      user: !!user,
      isValid: EMERGENCY_PATHS.includes(router.pathname)
    })

    // Handle root path and invalid paths
    // Don't redirect from login page even if user is not authenticated
    if ((router.pathname === '/' || !EMERGENCY_PATHS.includes(router.pathname)) && 
        router.pathname !== '/login') {
      console.log('Executing redirect to:', redirectPath)
      router.push(redirectPath)
        .then(() => console.log('Redirect success'))
        .catch(err => console.error('Redirect failed:', err))
    }
  }, [user, isLoading, router, router.isReady])

  if (isLoading) {
    return <div className="p-4 text-center">Initializing application security...</div>
  }

  return <Component {...pageProps} />
}

// Outer component that provides auth
export default function App(props: AppProps) {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent {...props} />
      </AppProvider>
    </AuthProvider>
  )
}
