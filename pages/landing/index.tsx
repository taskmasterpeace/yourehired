import Link from 'next/link';
import Image from 'next/image';
import { Briefcase, CheckCircle } from 'lucide-react';

export default function Landing() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Hey, You're Hired!</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline">Features</Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline">Pricing</Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline">Log in</Link>
            <Link href="/login" className="px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <h1 className="text-3xl font-bold sm:text-5xl">Streamline your job search</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Organize applications, optimize your resume, and get coaching—all in one place.
                </p>
                <div className="flex gap-2">
                  <Link href="/login" className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                    Start Your Journey
                  </Link>
                  <Link href="#demo" className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                    Try the Resume Analyzer
                  </Link>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>14-day free trial</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    <span>No credit card required</span>
                  </div>
                </div>
              </div>
              <div className="relative flex items-center justify-center">
                <div className="w-full h-[400px] bg-gray-100 rounded-lg border flex items-center justify-center">
                  <p className="text-gray-500">Dashboard Preview</p>
                </div>
              </div>
            </div>
          </div>
        </section>
        {/* Add more sections as needed */}
      </main>
      <footer className="border-t py-6 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Hey, You're Hired! All rights reserved.
      </footer>
    </div>
  );
}
