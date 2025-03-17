"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import FeaturesSection from "@/components/features-section"
import HowItWorksSection from "@/components/how-it-works-section"
import PricingSection from "@/components/pricing-section"
import TestimonialsSection from "@/components/testimonials-section"
import { useAuth } from "@/context/auth-context"
import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/router"
import { AuthModal } from "@/components/auth/AuthModal"

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const authTriggerRef = useRef(null);
  
  // If user is already logged in, redirect to the main application
  useEffect(() => {
    if (!isLoading && user) {
      router.push('/app');
    }
  }, [user, isLoading, router]);
  
  // Check for showAuth parameter to open auth modal
  useEffect(() => {
    if (router.query.showAuth === 'true' && authTriggerRef.current) {
      authTriggerRef.current.click();
    }
  }, [router.query]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 py-12 md:py-24">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <div className="inline-flex items-center rounded-lg bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                <span>Job Search Made Simple</span>
              </div>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl">
                Hey, You're Hired!
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                The all-in-one platform to organize your job search, optimize your resume, and land your dream job faster.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="/login">Get Started</Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            <div className="mx-auto lg:ml-auto flex justify-center">
              <div className="relative">
                <img
                  src="/dashboard-preview.png"
                  alt="Application Dashboard Preview"
                  width={550}
                  height={413}
                  className="rounded-lg shadow-xl"
                  style={{ objectFit: "cover" }}
                />
                <div className="absolute -bottom-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-2">
                  <div className="bg-green-500 rounded-full h-3 w-3"></div>
                  <span className="text-sm font-medium">Track 100+ applications</span>
                </div>
                <div className="absolute -top-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center gap-2">
                  <div className="bg-blue-500 rounded-full h-3 w-3"></div>
                  <span className="text-sm font-medium">AI-powered insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats Section */}
      <section className="py-12 border-y">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">10k+</h3>
              <p className="text-muted-foreground">Active Users</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">250k+</h3>
              <p className="text-muted-foreground">Applications Tracked</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">85%</h3>
              <p className="text-muted-foreground">Interview Success Rate</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-3xl font-bold">30+</h3>
              <p className="text-muted-foreground">Days Average to Hire</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <FeaturesSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Testimonials Section */}
      <TestimonialsSection />

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="py-12 md:py-24 lg:py-32 bg-primary text-primary-foreground">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Ready to transform your job search?</h2>
              <p className="max-w-[600px] text-primary-foreground/80 md:text-xl/relaxed">
                Join thousands of job seekers who have already found success with our platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/login">Get Started for Free</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#pricing">View Pricing</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Hidden auth modal trigger */}
      <div className="hidden">
        <AuthModal 
          trigger={<button ref={authTriggerRef}>Sign In</button>}
          defaultTab="sign-in"
        />
      </div>
      
      {/* Footer */}
      <footer className="py-6 md:py-12 border-t">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">About</Link></li>
                <li><Link href="#" className="hover:underline">Careers</Link></li>
                <li><Link href="#" className="hover:underline">Press</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">Blog</Link></li>
                <li><Link href="#" className="hover:underline">Guides</Link></li>
                <li><Link href="#" className="hover:underline">Support</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">Privacy</Link></li>
                <li><Link href="#" className="hover:underline">Terms</Link></li>
                <li><Link href="#" className="hover:underline">Cookie Policy</Link></li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Connect</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:underline">Twitter</Link></li>
                <li><Link href="#" className="hover:underline">LinkedIn</Link></li>
                <li><Link href="#" className="hover:underline">Instagram</Link></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center mt-8 pt-8 border-t">
            <p className="text-sm text-muted-foreground">© 2025 Hey, You're Hired! All rights reserved.</p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="#" className="text-sm text-muted-foreground hover:underline">Privacy Policy</Link>
              <Link href="#" className="text-sm text-muted-foreground hover:underline">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
