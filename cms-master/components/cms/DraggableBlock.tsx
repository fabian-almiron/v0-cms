'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { PageBlock } from '@/lib/cms-types'
import { useThemeComponents } from '@/lib/theme-context'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GripVertical, 
  Eye, 
  EyeOff, 
  Settings, 
  Trash2,
  Zap, 
  Star, 
  MessageSquare, 
  DollarSign, 
  FileText, 
  ArrowRight,
} from 'lucide-react'

const iconMap = {
  Zap,
  Star,
  MessageSquare,
  DollarSign,
  FileText,
  ArrowRight,
}

interface DraggableBlockProps {
  block: PageBlock
  onToggleVisibility: (blockId: string) => void
  onDelete: (blockId: string) => void
  onEdit?: (blockId: string) => void
  isPreview?: boolean
}

export default function DraggableBlock({ 
  block, 
  onToggleVisibility, 
  onDelete, 
  onEdit,
  isPreview = false 
}: DraggableBlockProps) {
  // Theme context for rendering components
  const { renderComponent, getComponentInfo } = useThemeComponents()
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: block.id,
    data: {
      type: block.type,
      block,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const componentInfo = getComponentInfo(block.type)
  const Icon = componentInfo ? iconMap[componentInfo.icon as keyof typeof iconMap] : GripVertical

  if (isPreview) {
    // In preview mode, just render the component
    return (
      <div className={`${!block.isVisible ? 'opacity-50' : ''}`}>
        {renderComponent(block.type, block.props)}
      </div>
    )
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative ${isDragging ? 'z-50' : ''}`}
    >
      {/* Block Header with Controls */}
      <div className="absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <Card className="flex items-center gap-1 p-1 shadow-lg border bg-background/95 backdrop-blur">
          <div
            className="cursor-grab hover:bg-muted p-1 rounded flex items-center gap-1"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-3 w-3" />
            {Icon && <Icon className="h-3 w-3" />}
            <span className="text-xs font-medium">{componentInfo?.name}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0"
              onClick={() => onToggleVisibility(block.id)}
              title={block.isVisible ? 'Hide component' : 'Show component'}
            >
              {block.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
            </Button>
            
            {onEdit && (
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0"
                onClick={() => onEdit(block.id)}
                title="Edit component"
              >
                <Settings className="h-3 w-3" />
              </Button>
            )}
            
            <Button
              size="sm"
              variant="ghost"
              className="h-6 w-6 p-0 hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => onDelete(block.id)}
              title="Delete component"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </Card>
      </div>

      {/* Component Content */}
      <div 
        className={`
          ${!block.isVisible ? 'opacity-50' : ''}
          ${isDragging ? 'ring-2 ring-primary ring-opacity-50' : ''}
          hover:ring-1 hover:ring-primary/30 transition-all
          relative
        `}
      >
        {renderComponent(block.type, block.props)}
      </div>

      {/* Overlay for interaction */}
      <div className="absolute inset-0 pointer-events-none group-hover:bg-primary/5 transition-colors" />
    </div>
  )
} 