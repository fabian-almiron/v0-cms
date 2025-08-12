import Image from "next/image"
import { LineChart, MessageSquare, Shield } from "lucide-react"
import { ComponentInfo } from '@/lib/cms-types'

// Component metadata - exported for automatic registration
export const metadata: ComponentInfo = {
  type: 'Features',
  name: 'Features',
  description: 'Showcase key product features with icons and descriptions',
  category: 'content-blocks',
  icon: 'Star',
}


export default function Features() {
  return (
    <section id="features" className="w-full py-12 mx-auto md:py-24 lg:py-32 bg-muted">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
              Key Features
            </div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Everything you need to succeed
            </h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Our platform provides all the tools you need to streamline your workflow, collaborate with your team,
              and achieve your goals.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
          <div className="grid gap-6">
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <LineChart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Gain valuable insights with real-time data visualization and comprehensive reporting tools.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Team Collaboration</h3>
                <p className="text-muted-foreground">
                  Work together seamlessly with integrated chat, file sharing, and project management features.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Enterprise Security</h3>
                <p className="text-muted-foreground">
                  Rest easy with bank-level encryption, role-based access control, and compliance certifications.
                </p>
              </div>
            </div>
          </div>
          <Image
            src="/placeholder.svg?height=400&width=400&text=Features"
            width={400}
            height={400}
            alt="Features"
            className="mx-auto aspect-square overflow-hidden rounded-xl object-cover object-center sm:w-full"
          />
        </div>
      </div>
    </section>
  )
} 