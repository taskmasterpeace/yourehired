import Link from "next/link";
import Image from "next/image";
import {
  CheckCircle,
  BarChart3,
  Calendar,
  FileText,
  MessageSquare,
  ChevronRight,
  CheckCheck,
  Briefcase,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AuthModal } from "@/components/auth/AuthModal";

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
            <Link href="/login">
              <Button variant="link" className="text-sm font-medium">Log in</Button>
            </Link>
            <Link href="/login">
              <Button>Get Started</Button>
            </Link>
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
                  <Link href="/login">
                    <Button size="lg">Start Your Job Search Journey</Button>
                  </Link>
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
                  <img
                    src="/feature-tracking.png"
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
        <section id="features" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
                  <span className="font-medium">Key Features</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need for a successful job search
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our AI-powered platform helps you stay organized, optimize your applications, and prepare for
                  interviews.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 md:grid-cols-2 lg:grid-cols-4">
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">AI Resume Assistant</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Get personalized resume feedback tailored to each job description.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <CheckCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Application Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track every application from bookmarked to offer in one organized place.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Interview Coach</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Practice with AI-generated interview questions specific to your roles.
                  </p>
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden">
                <CardHeader className="pb-2">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="mt-4">Progress Analytics</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Gain insights to improve your application success rate.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

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
                    <img
                      src="/feature-tracking.png"
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
                    <img
                      src="/feature-tracking.png"
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
                    <img
                      src="/feature-tracking.png"
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
                    <img
                      src="/feature-tracking.png"
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
        <section id="how-it-works" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
                  <span className="font-medium">Simple Process</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How Hey, You're Hired! works</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform simplifies your job search in just a few steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">1</span>
                </div>
                <h3 className="text-xl font-bold">Import or Create</h3>
                <p className="text-muted-foreground">
                  Upload your existing resume or create a new one with our guided templates.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">2</span>
                </div>
                <h3 className="text-xl font-bold">Optimize & Apply</h3>
                <p className="text-muted-foreground">
                  Use our AI to tailor your resume for each job and track your applications.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span className="text-xl font-bold text-primary">3</span>
                </div>
                <h3 className="text-xl font-bold">Prepare & Succeed</h3>
                <p className="text-muted-foreground">
                  Practice interviews with our AI coach and track your progress until you get hired.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Link href="/login">
                <Button size="lg">
                  Start Your Job Search <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-flex items-center rounded-lg bg-background px-3 py-1 text-sm">
                  <span className="font-medium">Success Stories</span>
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Hear from our users</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  See how Hey, You're Hired! has helped job seekers land their dream roles.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">A</span>
                    </div>
                    <div>
                      <CardTitle>Alex</CardTitle>
                      <CardDescription>Recent Graduate</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    "After sending out dozens of applications with no response, I started using Hey, You're Hired!
                    Within two weeks, I had three interview invitations. The AI resume feedback was a game-changer!"
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">M</span>
                    </div>
                    <div>
                      <CardTitle>Maya</CardTitle>
                      <CardDescription>Career Changer</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    "Changing industries was intimidating, but the platform helped me translate my skills effectively.
                    The interview practice gave me confidence, and I landed a role in my target industry!"
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="font-semibold text-primary">J</span>
                    </div>
                    <div>
                      <CardTitle>James</CardTitle>
                      <CardDescription>Tech Professional</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    "Managing multiple promising leads was overwhelming until I found this platform. The organization
                    tools and reminders kept me on track, and the analytics helped me focus on what was working."
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Simple, transparent pricing</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Choose the plan that's right for your job search journey.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Free</CardTitle>
                  <CardDescription>Get started with basic features</CardDescription>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">$0</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Basic application tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Limited AI resume feedback</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Up to 5 active applications</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Basic analytics</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="w-full">
                    <Button className="w-full" variant="outline">Get Started</Button>
                  </Link>
                </CardFooter>
              </Card>
              <Card className="border-primary">
                <CardHeader>
                  <div className="inline-flex items-center rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                    <span className="font-medium">Most Popular</span>
                  </div>
                  <CardTitle className="mt-4">Premium</CardTitle>
                  <CardDescription>Everything you need for your job search</CardDescription>
                  <div className="mt-4 flex items-baseline">
                    <span className="text-3xl font-bold">$9.99</span>
                    <span className="ml-1 text-sm text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground">Save 20% with annual billing</p>
                </CardHeader>
                <CardContent>
                  <ul className="grid gap-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Unlimited application tracking</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Advanced AI resume optimization</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Unlimited AI interview coaching</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Advanced analytics and insights</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      <span>Cloud sync across all devices</span>
                    </li>
                  </ul>
                </CardContent>
                <CardFooter>
                  <Link href="/login" className="w-full">
                    <Button className="w-full">Start 14-day Free Trial</Button>
                  </Link>
                </CardFooter>
              </Card>
            </div>
            <div className="mx-auto max-w-5xl text-center">
              <p className="text-sm text-muted-foreground">
                All plans include a 14-day free trial of Premium features. No credit card required.
              </p>
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
                <Link href="/login">
                  <Button size="lg">Start Your Free Trial</Button>
                </Link>
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
            <div className="flex gap-4">
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">Twitter</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-foreground">
                <span className="sr-only">LinkedIn</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-5 w-5"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect width="4" height="12" x="2" y="9"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </Link>
            </div>
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
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Integrations
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
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Careers
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
                <li>
                  <Link href="#" className="text-muted-foreground hover:text-foreground">
                    Cookie Policy
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
  );
}
