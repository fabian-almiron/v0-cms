import { Button } from "@/components/ui/button"
import { ChevronRight } from "lucide-react"
import { ComponentInfo } from '@/lib/cms-types'

// Component metadata - exported for automatic registration
export const metadata: ComponentInfo = {
  type: 'CTA',
  name: 'Call to Action',
  description: 'Compelling call-to-action section with button',
  category: 'content-blocks',
  icon: 'ArrowRight',
}


export default function CTA() {
  return (
    <section className="w-full py-12 mx-auto md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
              Ready to streamline your workflow?
            </h2>
            <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed">
              Join thousands of satisfied customers who have transformed their business with StreamLine.
            </p>
          </div>
          <div className="flex flex-col gap-2 min-[400px]:flex-row">
            <Button size="lg" className="gap-1">
              Start Your Free Trial <ChevronRight className="h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline">
              Contact Sales
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">No credit card required. 14-day free trial.</p>
        </div>
      </div>
    </section>
  )
} 