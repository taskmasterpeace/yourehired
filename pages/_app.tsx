import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { useRouter } from 'next/router'
import { useAuth } from '../context/auth-context'
import { useEffect } from 'react'

const SAFE_PATHS = ['/landing', '/login', '/signup', '/app']

export default function App({ Component, pageProps }: AppProps) {
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

    // Ensure redirectPath is always a valid string with a fallback
    let redirectPath = '/landing' // Default fallback
    
    if (user) {
      redirectPath = '/app'
    }
    
    console.log('Routing check:', {
      currentPath: router.pathname,
      redirectPath,
      user: !!user,
      isValid: SAFE_PATHS.includes(router.pathname)
    })

    // Only redirect if needed and path is valid
    if (redirectPath && (!SAFE_PATHS.includes(router.pathname) || router.pathname !== redirectPath)) {
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
