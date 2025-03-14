import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PricingSection() {
  return (
    <section id="pricing" className="py-12 md:py-24 lg:py-32 border-t">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
              <span className="font-medium">Simple Pricing</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Choose your plan</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Start with our free plan or upgrade for advanced features.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <div className="flex flex-col p-6 border rounded-lg shadow-sm">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="text-muted-foreground">Perfect for getting started</p>
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">$0</span>
              <span className="ml-1 text-muted-foreground">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Track up to 5 job applications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Basic resume feedback</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Calendar integration</span>
              </li>
            </ul>
            <Button className="mt-8" variant="outline" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
          </div>
          <div className="flex flex-col p-6 border rounded-lg shadow-sm bg-primary text-primary-foreground">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="text-primary-foreground/80">For serious job seekers</p>
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">$12</span>
              <span className="ml-1 text-primary-foreground/80">/month</span>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Unlimited job applications</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Advanced AI resume optimization</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Interview practice with AI coach</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Email & notification reminders</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                <span>Priority support</span>
              </li>
            </ul>
            <Button className="mt-8" variant="secondary" asChild>
              <Link href="/login">Start Free Trial</Link>
            </Button>
          </div>
          <div className="flex flex-col p-6 border rounded-lg shadow-sm">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <p className="text-muted-foreground">For teams and organizations</p>
            </div>
            <div className="mt-4 flex items-baseline">
              <span className="text-4xl font-bold">Custom</span>
            </div>
            <ul className="mt-6 space-y-3">
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Everything in Pro</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Bulk application management</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Team collaboration features</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-primary" />
                <span>Dedicated account manager</span>
              </li>
            </ul>
            <Button className="mt-8" variant="outline" asChild>
              <Link href="/contact">Contact Sales</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
