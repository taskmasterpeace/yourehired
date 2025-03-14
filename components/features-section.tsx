import { BarChart2, Calendar, Users, Shield, Zap, Briefcase } from "lucide-react"

export default function FeaturesSection() {
  return (
    <section id="features" className="py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm">
              <span className="font-medium">Powerful Features</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Everything you need to succeed</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Our platform provides all the tools you need to organize your job search, prepare for interviews, and land
              your dream job.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <BarChart2 className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Application Tracking</h3>
              <p className="text-muted-foreground">
                Keep track of all your job applications in one place with status updates and reminders.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Zap className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">AI Resume Optimization</h3>
              <p className="text-muted-foreground">
                Get personalized feedback on your resume based on the job description and industry standards.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Interview Scheduler</h3>
              <p className="text-muted-foreground">
                Never miss an interview with our integrated calendar and notification system.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Networking Tools</h3>
              <p className="text-muted-foreground">
                Manage your professional connections and follow up with recruiters effortlessly.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Privacy Controls</h3>
              <p className="text-muted-foreground">
                Choose between cloud sync for convenience or local-only storage for maximum privacy.
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start space-y-4 p-6 border rounded-lg">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Briefcase className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Career Resources</h3>
              <p className="text-muted-foreground">
                Access a library of templates, guides, and resources to help you in your job search.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
