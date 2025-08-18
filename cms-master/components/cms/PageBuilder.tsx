'use client'

import { useState, useCallback } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDroppable,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { PageBlock, ComponentType, DraggedComponent } from '@/lib/cms-types'
import { useThemeComponents } from '@/lib/theme-context'
import ComponentPalette from './ComponentPalette'
import DraggableBlock from './DraggableBlock'
import TemplateSelector from './TemplateSelector'
import PageRenderer from './PageRenderer'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Eye, Code, Save, Undo2, Redo2, Layout, Loader2 } from 'lucide-react'

// Droppable area component for empty drop zone
function DroppableArea({ children }: { children: React.ReactNode }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'drop-zone',
  })

  return (
    <div
      ref={setNodeRef}
      className={`transition-colors ${isOver ? 'bg-primary/5 border-primary/25' : ''}`}
    >
      {children}
    </div>
  )
}

interface PageBuilderProps {
  initialBlocks?: PageBlock[]
  onSave?: (blocks: PageBlock[], headerTemplateId?: string, footerTemplateId?: string, pageTemplateId?: string) => Promise<void>
  pageName?: string
  initialHeaderTemplateId?: string
  initialFooterTemplateId?: string
  initialPageTemplateId?: string
  showTemplateSelector?: boolean
  templateType?: 'header' | 'footer' | 'page' | 'post'
}

export default function PageBuilder({ 
  initialBlocks = [], 
  onSave,
  pageName = 'Untitled Page',
  initialHeaderTemplateId,
  initialFooterTemplateId,
  initialPageTemplateId,
  showTemplateSelector = true,
  templateType
}: PageBuilderProps) {
  const [blocks, setBlocks] = useState<PageBlock[]>(initialBlocks)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedComponent, setDraggedComponent] = useState<DraggedComponent | null>(null)
  const [headerTemplateId, setHeaderTemplateId] = useState<string | undefined>(initialHeaderTemplateId)
  const [footerTemplateId, setFooterTemplateId] = useState<string | undefined>(initialFooterTemplateId)
  const [pageTemplateId, setPageTemplateId] = useState<string | undefined>(initialPageTemplateId)
  const [saving, setSaving] = useState(false)
  
  // Theme context for rendering components
  const { renderComponent } = useThemeComponents()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 3,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 3,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    console.log('🟢 Drag started:', active.id)
    setActiveId(active.id as string)

    // Check if dragging a new component from palette
    if (typeof active.id === 'string' && active.id.startsWith('new-')) {
      const componentType = active.id.replace('new-', '') as ComponentType
      console.log('🔵 Dragging new component:', componentType)
      setDraggedComponent({
        type: componentType,
        isNewComponent: true,
      })
    } else {
      // Dragging existing block
      const block = blocks.find(b => b.id === active.id)
      if (block) {
        console.log('🟡 Dragging existing block:', block.type)
        setDraggedComponent({
          type: block.type,
          isNewComponent: false,
          sourceId: block.id,
        })
      }
    }
  }, [blocks])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    console.log('🔴 Drag ended. Active:', active.id, 'Over:', over?.id)

    setActiveId(null)
    setDraggedComponent(null)

    if (!over) {
      console.log('❌ No drop target found')
      return
    }

    // Handle dropping new component from palette
    if (typeof active.id === 'string' && active.id.startsWith('new-')) {
      const componentType = active.id.replace('new-', '') as ComponentType
      const newBlock: PageBlock = {
        id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: componentType,
        order: blocks.length,
        props: {},
        isVisible: true,
      }

      if (over.id === 'drop-zone') {
        // Add to end
        setBlocks(prev => [...prev, newBlock])
      } else {
        // Insert at specific position
        const overIndex = blocks.findIndex(block => block.id === over.id)
        if (overIndex !== -1) {
          setBlocks(prev => {
            const updated = [...prev]
            updated.splice(overIndex, 0, newBlock)
            return updated.map((block, index) => ({ ...block, order: index }))
          })
        }
      }
      return
    }

    // Handle reordering existing blocks
    if (active.id !== over.id) {
      const activeIndex = blocks.findIndex(block => block.id === active.id)
      const overIndex = blocks.findIndex(block => block.id === over.id)

      if (activeIndex !== -1 && overIndex !== -1) {
        setBlocks(prev => {
          const newBlocks = arrayMove(prev, activeIndex, overIndex)
          return newBlocks.map((block, index) => ({ ...block, order: index }))
        })
      }
    }
  }, [blocks])

  const handleToggleVisibility = useCallback((blockId: string) => {
    setBlocks(prev =>
      prev.map(block =>
        block.id === blockId
          ? { ...block, isVisible: !block.isVisible }
          : block
      )
    )
  }, [])

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks(prev => prev.filter(block => block.id !== blockId))
  }, [])

  const handleSave = useCallback(async () => {
    if (onSave && !saving) {
      setSaving(true)
      try {
        await onSave(blocks, headerTemplateId, footerTemplateId, pageTemplateId)
      } catch (error) {
        console.error('Error saving:', error)
      } finally {
        setSaving(false)
      }
    }
  }, [blocks, headerTemplateId, footerTemplateId, pageTemplateId, onSave, saving])

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="h-screen flex">
        {/* Component Palette */}
        <ComponentPalette />

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-semibold">Page Builder</h1>
                  <span className="text-sm text-muted-foreground">
                    {blocks.length} components
                  </span>
                </div>
                <div className="text-sm text-muted-foreground">
                  • Editing: <span className="font-medium">{pageName}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Undo2 className="h-4 w-4 mr-1" />
                  Undo
                </Button>
                <Button variant="outline" size="sm">
                  <Redo2 className="h-4 w-4 mr-1" />
                  Redo
                </Button>
                <Button onClick={handleSave} size="sm" disabled={saving}>
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                  <Save className="h-4 w-4 mr-1" />
                  )}
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 overflow-hidden">
            <Tabs defaultValue="builder" className="h-full flex flex-col">
              <TabsList className="mx-4 mt-4 w-fit">
                <TabsTrigger value="builder" className="gap-2">
                  <Code className="h-4 w-4" />
                  Builder
                </TabsTrigger>
                <TabsTrigger value="preview" className="gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
                {showTemplateSelector && (
                  <TabsTrigger value="templates" className="gap-2">
                    <Layout className="h-4 w-4" />
                    Templates
                  </TabsTrigger>
                )}
              </TabsList>

              <TabsContent value="builder" className="flex-1 p-4 overflow-y-auto">
                <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                  <DroppableArea>
                    <div className="max-w-7xl mx-auto space-y-4 min-h-[400px]">
                      {blocks.length === 0 ? (
                        <Card className="p-12 text-center border-2 border-dashed border-muted-foreground/25">
                          <p className="text-muted-foreground">
                            Drag components here to start building your page
                          </p>
                        </Card>
                      ) : (
                        blocks.map((block) => (
                          <DraggableBlock
                            key={block.id}
                            block={block}
                            onToggleVisibility={handleToggleVisibility}
                            onDelete={handleDeleteBlock}
                          />
                        ))
                      )}
                    </div>
                  </DroppableArea>
                </SortableContext>
              </TabsContent>

              <TabsContent value="preview" className="flex-1 overflow-y-auto">
                <div className="max-w-7xl mx-auto">
                  <PageRenderer 
                    blocks={blocks}
                    headerTemplateId={headerTemplateId}
                    footerTemplateId={footerTemplateId}
                    pageTemplateId={pageTemplateId}
                    isTemplatePreview={!showTemplateSelector}
                    templateType={!showTemplateSelector ? templateType : undefined}
                      />
                </div>
              </TabsContent>

              {showTemplateSelector && (
                <TabsContent value="templates" className="flex-1 overflow-y-auto p-4">
                  <div className="max-w-3xl mx-auto">
                    <TemplateSelector
                      headerTemplateId={headerTemplateId}
                      footerTemplateId={footerTemplateId}
                      pageTemplateId={pageTemplateId}
                      onHeaderTemplateChange={setHeaderTemplateId}
                      onFooterTemplateChange={setFooterTemplateId}
                      onPageTemplateChange={setPageTemplateId}
                    />
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId && draggedComponent ? (
            <div className="opacity-75 rotate-3 transform scale-105">
              {draggedComponent.isNewComponent ? (
                <Card className="p-4 shadow-lg">
                  <div className="text-sm font-medium">
                    Adding {draggedComponent.type}
                  </div>
                </Card>
              ) : (
                renderComponent(draggedComponent.type)
              )}
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  )
} 