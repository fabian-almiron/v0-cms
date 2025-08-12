'use client'

import { useDraggable } from '@dnd-kit/core'
import { ComponentInfo, ComponentType } from '@/lib/cms-types'
import { useThemeComponents } from '@/lib/theme-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Zap, 
  Star, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  ArrowRight,
  Grip
} from 'lucide-react'

const iconMap = {
  Zap,
  Star,
  MessageSquare,
  DollarSign,
  FileText,
  ArrowRight,
  Grip,
}

interface DraggableComponentProps {
  component: ComponentInfo
}

function DraggableComponent({ component }: DraggableComponentProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    isDragging,
  } = useDraggable({
    id: `new-${component.type}`,
    data: {
      type: component.type,
      isNewComponent: true,
    },
  })

  const Icon = iconMap[component.icon as keyof typeof iconMap] || Grip

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`cursor-grab ${isDragging ? 'opacity-50' : ''}`}
    >
      <Card className="border-dashed border-2 hover:border-primary hover:bg-primary/5 transition-colors">
        <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">{component.name}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-3 pt-0">
        <CardDescription className="text-xs">
          {component.description}
        </CardDescription>
        <div className="mt-2">
          <span className="inline-block px-2 py-1 text-xs bg-muted rounded-md capitalize">
            {component.category}
          </span>
        </div>
      </CardContent>
    </Card>
    </div>
  )
}

export default function ComponentPalette() {
  const { getComponentsByCategory, componentInfo } = useThemeComponents()
  
  const contentBlockComponents = getComponentsByCategory('content-blocks')
  const layoutComponents = getComponentsByCategory('layout')
  const uiPrimitiveComponents = getComponentsByCategory('ui-primitives')

  if (!componentInfo.length) {
    return (
      <div className="w-80 bg-background border-r h-full overflow-y-auto">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Components</h2>
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading theme components...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-80 bg-background border-r h-full overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Components</h2>
        
        {contentBlockComponents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Content Blocks
            </h3>
            <div className="space-y-3">
              {contentBlockComponents.map((component) => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>
        )}

        {layoutComponents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Layout
            </h3>
            <div className="space-y-3">
              {layoutComponents.map((component) => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>
        )}

        {uiPrimitiveComponents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              UI Primitives
            </h3>
            <div className="space-y-3">
              {uiPrimitiveComponents.map((component) => (
                <DraggableComponent key={component.type} component={component} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 