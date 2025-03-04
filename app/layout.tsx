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
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
