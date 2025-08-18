import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ComponentInfo } from '@/lib/cms-types'

// Component metadata - exported for automatic registration
export const metadata: ComponentInfo = {
  type: 'Hero',
  name: 'Hero Section',
  description: 'Main landing section with headline, CTA buttons, and hero image',
  category: 'content-blocks',
  icon: 'Zap',
}


export default function Hero() {
  return (
    <section className="w-full py-12 mx-auto md:py-24 lg:py-32 xl:py-48">
      <div className="container mx-auto px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Streamline Your Workflow Like Never Before
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Boost productivity, reduce overhead, and focus on what matters most with our all-in-one platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button size="lg" className="gap-1">
                Start Free Trial <ChevronRight className="h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline">
                View Demo
              </Button>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <Image
                      src={`/placeholder.svg?height=32&width=32&text=${i}`}
                      alt="User"
                      width={32}
                      height={32}
                    />
                  </div>
                ))}
              </div>
              <div className="text-muted-foreground">
                Trusted by <span className="font-medium text-foreground">2,000+</span> companies
              </div>
            </div>
          </div>
          <Image
            src="/placeholder.svg?height=550&width=550&text=Platform+Screenshot"
            width={550}
            height={550}
            alt="Hero"
            className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last"
          />
        </div>
      </div>
    </section>
  )
} 