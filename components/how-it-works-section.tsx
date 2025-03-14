import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function HowItWorksSection() {
  return (
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
          <Button size="lg" asChild>
            <Link href="https://app.heyourehired.com/signup">
              Start Your Job Search <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}

