import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'CAPTAIN - Career Application Tracking Assistant',
  description: 'AI-powered job application tracking and career management tool',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="light">
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
      <body>{children}</body>
    </html>
  )
}
