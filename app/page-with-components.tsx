import Link from "next/link"
import Image from "next/image"
import { Briefcase, CheckCircle, Calendar } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import FeaturesSection from "@/components/features-section"
import HowItWorksSection from "@/components/how-it-works-section"
import PricingSection from "@/components/pricing-section"
import TestimonialsSection from "@/components/testimonials-section"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <Briefcase className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">Hey, You're Hired!</span>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
              Features
            </Link>
            <Link href="#how-it-works" className="text-sm font-medium hover:underline underline-offset-4">
              How It Works
            </Link>
            <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
              Pricing
            </Link>
            <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
              Testimonials
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link
              href="https://app.heyourehired.com/login"
              className="text-sm font-medium hover:underline underline-offset-4"
            >
              Log in
            </Link>
            <Button asChild>
              <Link href="https://app.heyourehired.com/signup">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-gradient-to-b from-background to-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_600px] lg:gap-12 xl:grid-cols-[1fr_700px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
                  <span className="font-medium">AI-Powered Job Search Assistant</span>
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Streamline your job search journey
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Organize applications, optimize your resume, and get personalized coaching - all in one place.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="https://app.heyourehired.com/signup">Start Your Job Search Journey</Link>
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <Link href="#demo">Try the Resume Analyzer</Link>
                  </Button>
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
                <div className="relative w-full overflow-hidden rounded-lg border bg-background shadow-xl">
                  <Image
                    src="/placeholder.svg?height=600&width=800"
                    width={800}
                    height={600}
                    alt="Application dashboard showing job tracking board"
                    className="aspect-video w-full object-cover"
                  />
                </div>
                <div className="absolute -bottom-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-xl" />
                <div className="absolute -top-6 -right-6 h-24 w-24 rounded-full bg-primary/20 blur-xl" />
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t border-b bg-muted/50">
          <div className="container py-12">
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-8">
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold">40%</div>
                <div className="text-sm text-muted-foreground">More interview invitations</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold">10,000+</div>
                <div className="text-sm text-muted-foreground">Job seekers helped</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold">85%</div>
                <div className="text-sm text-muted-foreground">Application success rate</div>
              </div>
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="text-3xl font-bold">30+</div>
                <div className="text-sm text-muted-foreground">Days saved on average</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <FeaturesSection />

        {/* UI Showcase Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">See the platform in action</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Explore our intuitive interface designed to make your job search efficient and effective.
                </p>
              </div>
            </div>
            <div className="mx-auto mt-8 max-w-5xl">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
                  <TabsTrigger value="resume">Resume AI</TabsTrigger>
                  <TabsTrigger value="interview">Interview Prep</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                </TabsList>
                <TabsContent value="dashboard" className="mt-6">
                  <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
                    <Image
                      src="/placeholder.svg?height=600&width=1200"
                      width={1200}
                      height={600}
                      alt="Application tracking dashboard"
                      className="w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold">Application Tracking Board</h3>
                      <p className="mt-2 text-muted-foreground">
                        Organize your job applications with our intuitive kanban board. Move applications through
                        different stages and never lose track of your progress.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="resume" className="mt-6">
                  <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
                    <Image
                      src="/placeholder.svg?height=600&width=1200"
                      width={1200}
                      height={600}
                      alt="AI resume feedback interface"
                      className="w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold">AI Resume Assistant</h3>
                      <p className="mt-2 text-muted-foreground">
                        Get personalized feedback on your resume based on the job description. Our AI highlights areas
                        for improvement and suggests tailored changes.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="interview" className="mt-6">
                  <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
                    <Image
                      src="/placeholder.svg?height=600&width=1200"
                      width={1200}
                      height={600}
                      alt="Interview preparation interface"
                      className="w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold">Interview Coach</h3>
                      <p className="mt-2 text-muted-foreground">
                        Practice interviews with our AI coach. Get industry-specific questions and feedback on your
                        responses to improve your interview skills.
                      </p>
                    </div>
                  </div>
                </TabsContent>
                <TabsContent value="analytics" className="mt-6">
                  <div className="overflow-hidden rounded-lg border bg-background shadow-lg">
                    <Image
                      src="/placeholder.svg?height=600&width=1200"
                      width={1200}
                      height={600}
                      alt="Job search analytics dashboard"
                      className="w-full object-cover"
                    />
                    <div className="p-6">
                      <h3 className="text-xl font-bold">Progress Analytics</h3>
                      <p className="mt-2 text-muted-foreground">
                        Track your job search metrics and identify patterns to improve your strategy. See response
                        rates, interview conversions, and more.
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <HowItWorksSection />

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Pricing Section */}
        <PricingSection />

        {/* Security Section */}
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center rounded-lg bg-background px-3 py-1 text-sm">
                    <span className="font-medium">Data Privacy First</span>
                  </div>
                  <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Your data, your choice</h2>
                  <p className="text-muted-foreground md:text-xl/relaxed">
                    We take your privacy seriously. Choose between cloud sync for convenience or local-only storage for
                    maximum privacy.
                  </p>
                </div>
                <ul className="grid gap-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Military-grade encryption for all cloud-stored data</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Secure authentication via Supabase</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>Local-only storage option available</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    <span>We never sell your data to third parties</span>
                  </li>
                </ul>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full overflow-hidden rounded-lg border bg-background p-8 shadow-lg">
                  <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
                      <Calendar className="h-10 w-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold">Secure Cloud Sync</h3>
                    <p className="text-sm text-muted-foreground">
                      Access your job search data from any device with our secure cloud synchronization.
                    </p>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm">End-to-end encryption</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-primary/10 p-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                      </div>
                      <span className="text-sm">Automatic backups</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 md:py-24 lg:py-32 border-t">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Ready to transform your job search?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join thousands of job seekers who have streamlined their path to employment.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Button size="lg" asChild>
                  <Link href="https://app.heyourehired.com/signup">Start Your Free Trial</Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="#demo">See How It Works</Link>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                No credit card required. 14-day free trial of all premium features.
              </p>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t bg-background">
        <div className="container flex flex-col gap-6 py-12 px-4 md:px-6 md:flex-row md:justify-between">
          <div className="flex flex-col gap-6 md:max-w-sm">
            <div className="flex items-center gap-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="text-xl font-bold">Hey, You're Hired!</span>
            </div>
            <p className="text-sm text-muted-foreground">
              The complete platform for your job search journey. Organize applications, optimize your resume, and get
              personalized coaching.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Product</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#features" className="text-muted-foreground hover:text-foreground">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-muted-foreground hover:text-foreground">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Company</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
        <div className="border-t py-6">
          <div className="container flex flex-col items-center justify-between gap-4 px-4 md:px-6 md:flex-row">
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Hey, You're Hired! All rights reserved.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-muted-foreground hover:text-foreground">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

