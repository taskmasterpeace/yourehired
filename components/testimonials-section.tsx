import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function TestimonialsSection() {
  return (
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
                "After sending out dozens of applications with no response, I started using Hey, You're Hired! Within
                two weeks, I had three interview invitations. The AI resume feedback was a game-changer!"
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
                "Changing industries was intimidating, but the platform helped me translate my skills effectively. The
                interview practice gave me confidence, and I landed a role in my target industry!"
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
                "Managing multiple promising leads was overwhelming until I found this platform. The organization tools
                and reminders kept me on track, and the analytics helped me focus on what was working."
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}

