import React from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUpDown, Layers, MousePointer } from 'lucide-react'

export default function DNDArea() {
  return (
    <div className="w-full py-16 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <div className="flex justify-center items-center gap-4 mb-6">
          <div className="p-3 bg-primary/10 rounded-full">
            <Layers className="h-8 w-8 text-primary" />
          </div>
          <ArrowUpDown className="h-6 w-6 text-muted-foreground animate-pulse" />
          <div className="p-3 bg-primary/10 rounded-full">
            <MousePointer className="h-8 w-8 text-primary" />
          </div>
        </div>
        
        <Badge variant="secondary" className="mb-4 text-sm font-medium">
          Dynamic Content Area
        </Badge>
        
        <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-4">
          Drag and Drop Area
        </h2>
        
        <p className="text-lg text-slate-600 dark:text-slate-300 mb-6 max-w-2xl mx-auto">
          This area represents where users can drag and drop components when creating pages. 
          Content placed here will be dynamic and editable on each individual page.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <Card className="p-4 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium">Flexible Layout</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Users can add any combination of components
            </p>
          </Card>
          
          <Card className="p-4 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-sm font-medium">Reorderable</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Drag to reorder components as needed
            </p>
          </Card>
          
          <Card className="p-4 bg-white/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              <span className="text-sm font-medium">Customizable</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Each component can be individually configured
            </p>
          </Card>
        </div>
        
        <div className="mt-8 p-4 bg-white/30 dark:bg-slate-800/30 rounded-lg border border-slate-200 dark:border-slate-700">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            <strong>Template Note:</strong> When this template is used, this DND Area will be replaced 
            with the actual page content that users create in the page builder.
          </p>
        </div>
      </div>
    </div>
  )
} 