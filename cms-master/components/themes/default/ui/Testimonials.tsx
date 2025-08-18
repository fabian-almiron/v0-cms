import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Star } from "lucide-react"
import { ComponentInfo } from '@/lib/cms-types'

// Component metadata - exported for automatic registration
export const metadata: ComponentInfo = {
  type: 'Testimonials',
  name: 'Testimonials',
  description: 'Customer reviews and social proof',
  category: 'content-blocks',
  icon: 'MessageSquare',
}


export default function Testimonials() {
  const testimonials = [
    {
      quote:
        "StreamLine has transformed how our team works. We've seen a 40% increase in productivity since implementing it.",
      author: "Sarah Johnson",
      role: "CTO, TechCorp",
    },
    {
      quote:
        "The analytics features alone are worth the investment. We now have insights we never had access to before.",
      author: "Michael Chen",
      role: "Operations Director, GrowthX",
    },
    {
      quote:
        "Customer support is exceptional. Any issues we've had were resolved quickly and professionally.",
      author: "Emily Rodriguez",
      role: "Project Manager, Innovate Inc.",
    },
  ]

  return (
    <section id="testimonials" className="w-full py-12 mx-auto md:py-24 lg:py-32">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">Testimonials</div>
            <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">Loved by businesses worldwide</h2>
            <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
              Don't just take our word for it. Here's what our customers have to say about StreamLine.
            </p>
          </div>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 py-12 lg:grid-cols-3">
          {testimonials.map((testimonial, i) => (
            <Card key={i} className="relative overflow-hidden">
              <CardHeader className="pb-0">
                <div className="absolute -top-2 -left-2 text-primary">
                  <Star className="h-8 w-8 fill-primary" />
                </div>
                <div className="flex justify-end">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                    ))}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="mb-4 italic">"{testimonial.quote}"</p>
                <div>
                  <p className="font-semibold">{testimonial.author}</p>
                  <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 