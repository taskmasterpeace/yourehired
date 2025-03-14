import { ClipboardList, FileText, MessageSquare, CheckCircle } from "lucide-react"

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-12 md:py-24 lg:py-32 border-t">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
              <span className="font-medium">Simple Process</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">How it works</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform simplifies your job search in just a few easy steps.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4 mt-12">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-2xl font-bold">1</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <ClipboardList className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Track Applications</h3>
              <p className="text-sm text-muted-foreground">
                Add your job applications to the platform and track their status in real-time.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-2xl font-bold">2</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <FileText className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Optimize Resume</h3>
              <p className="text-sm text-muted-foreground">
                Get AI-powered feedback to tailor your resume for each job application.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-2xl font-bold">3</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Practice Interviews</h3>
              <p className="text-sm text-muted-foreground">
                Prepare for interviews with our AI coach and industry-specific questions.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <span className="text-2xl font-bold">4</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-center">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold">Land the Job</h3>
              <p className="text-sm text-muted-foreground">
                Receive offers and negotiate with confidence using our salary insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
