import Image from "next/image"
import { Star } from "lucide-react"

export default function TestimonialsSection() {
  return (
    <section id="testimonials" className="py-12 md:py-24 lg:py-32 bg-muted">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-flex items-center rounded-lg bg-background px-3 py-1 text-sm">
              <span className="font-medium">Success Stories</span>
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">What our users say</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Hear from job seekers who have found success with our platform.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-8">
          <div className="flex flex-col p-6 bg-background rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="flex-1 text-muted-foreground">
              "This platform helped me organize my job search and land interviews at top tech companies. I received an
              offer within 2 months!"
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-full bg-muted h-10 w-10 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  width={40}
                  height={40}
                  alt="Sarah J."
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Sarah J.</p>
                <p className="text-sm text-muted-foreground">Software Engineer</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-6 bg-background rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="flex-1 text-muted-foreground">
              "The interview preparation tools were game-changing. I felt confident and prepared for every conversation."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-full bg-muted h-10 w-10 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  width={40}
                  height={40}
                  alt="Michael T."
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Michael T.</p>
                <p className="text-sm text-muted-foreground">Product Manager</p>
              </div>
            </div>
          </div>
          <div className="flex flex-col p-6 bg-background rounded-lg shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-primary text-primary" />
              ))}
            </div>
            <p className="flex-1 text-muted-foreground">
              "I was able to track all my applications in one place and never missed a follow-up. The resume
              optimization feature helped me stand out."
            </p>
            <div className="mt-6 flex items-center gap-3">
              <div className="rounded-full bg-muted h-10 w-10 overflow-hidden">
                <Image
                  src="/placeholder.svg?height=40&width=40"
                  width={40}
                  height={40}
                  alt="Jessica L."
                  className="object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Jessica L.</p>
                <p className="text-sm text-muted-foreground">Marketing Specialist</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
