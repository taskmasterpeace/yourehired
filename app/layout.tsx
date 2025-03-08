import type { Metadata } from 'next'
import '../styles/globals.css'
import { AuthProvider } from '@/context/auth-context'

export const metadata: Metadata = {
  title: "You're Hired! - Job Application Tracker",
  description: 'AI-powered job application tracking and career management tool',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <style>{`
          :root {
            --background: 0 0% 100%;
            --foreground: 222.2 84% 4.9%;
          }
          
          .dark {
            --background: 222.2 84% 4.9%;
            --foreground: 210 40% 98%;
            color-scheme: dark;
          }
          
          body {
            background-color: hsl(var(--background));
            color: hsl(var(--foreground));
          }
        `}</style>
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
