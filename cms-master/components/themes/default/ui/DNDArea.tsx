'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Layers, ArrowDown, RotateCcw, Palette } from 'lucide-react'
import { ComponentInfo } from '@/lib/cms-types'

// Component metadata - exported for automatic registration
export const metadata: ComponentInfo = {
  type: 'DNDArea',
  name: 'Dynamic Content Area',
  description: 'Placeholder for dynamic page content in templates',
  category: 'layout',
  icon: 'Grip',
}


export default function DNDArea() {
  return (
    <div className="w-full py-8 md:py-12">
      <Card className="border-2 border-dashed border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors">
        <CardContent className="p-8 md:p-12 text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Layers className="h-12 w-12 text-primary animate-pulse" />
              <ArrowDown className="h-4 w-4 text-primary/60 absolute -bottom-1 -right-1 animate-bounce" />
            </div>
          </div>
          
          <h3 className="text-lg font-semibold text-primary mb-2">
            Dynamic Content Area
          </h3>
          
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            This is where your page content will be inserted when this template is used. 
            Content blocks will replace this area dynamically.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <RotateCcw className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-primary">Flexible Layout</div>
                <div className="text-xs text-muted-foreground">Adapts to any content</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <ArrowDown className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-primary">Reorderable</div>
                <div className="text-xs text-muted-foreground">Drag & drop support</div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/50 border-primary/20">
              <CardContent className="p-4 text-center">
                <Palette className="h-6 w-6 text-primary mx-auto mb-2" />
                <div className="text-sm font-medium text-primary">Customizable</div>
                <div className="text-xs text-muted-foreground">Style each component</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 