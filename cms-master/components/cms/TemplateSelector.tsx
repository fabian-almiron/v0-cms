'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Template, TemplateType } from '@/lib/cms-types'
import { useCurrentTheme } from '@/lib/theme-context'
import { loadThemeTemplates } from '@/lib/theme-utils'
import { Navigation, PanelBottom, Layout, Star } from 'lucide-react'

interface TemplateSelectorProps {
  headerTemplateId?: string
  footerTemplateId?: string
  pageTemplateId?: string
  onHeaderTemplateChange: (templateId: string | undefined) => void
  onFooterTemplateChange: (templateId: string | undefined) => void
  onPageTemplateChange: (templateId: string | undefined) => void
}

export default function TemplateSelector({
  headerTemplateId,
  footerTemplateId,
  pageTemplateId,
  onHeaderTemplateChange,
  onFooterTemplateChange,
  onPageTemplateChange
}: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<Template[]>([])
  const currentTheme = useCurrentTheme()

  // Load templates from database
  useEffect(() => {
    if (!currentTheme) return
    
    const loadTemplates = async () => {
      try {
        const { loadTemplatesFromDatabase } = await import('@/lib/cms-data')
        const dbTemplates = await loadTemplatesFromDatabase()
        setTemplates(dbTemplates)
      } catch (error) {
        console.error('Error loading templates:', error)
        setTemplates([])
      }
    }

    loadTemplates()
  }, [currentTheme])

  if (!currentTheme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Templates...</CardTitle>
          <CardDescription>Please wait while theme templates are loaded.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const headerTemplates = templates.filter(t => t.type === 'header')
  const footerTemplates = templates.filter(t => t.type === 'footer')
  const pageTemplates = templates.filter(t => t.type === 'page')
  const defaultHeaderTemplate = headerTemplates.find(t => t.isDefault)
  const defaultFooterTemplate = footerTemplates.find(t => t.isDefault)
  const defaultPageTemplate = pageTemplates.find(t => t.isDefault)

  const getTemplatePreview = (template: Template | undefined) => {
    if (!template || !template.blocks) {
      return 'No template available'
    }
    
    // Validate that template blocks use components available in current theme
    const validBlocks = template.blocks.filter(block => {
      return currentTheme.getComponent(block.type) !== undefined
    })
    
    const blockCount = validBlocks.length
    const hasDNDArea = validBlocks.some(block => block.type === 'DNDArea')
    const hasInvalidBlocks = validBlocks.length !== template.blocks.length
    
    let preview = `${blockCount} components`
    if (hasDNDArea) preview += ' • Has DND Area'
    if (hasInvalidBlocks) preview += ' • Some components unavailable'
    
    return preview
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Layout className="h-5 w-5" />
          Page Templates
        </CardTitle>
        <CardDescription>
          Choose header and footer templates for this page. Templates with DND Areas will wrap your page content.
        </CardDescription>
        <div className="flex items-center gap-2 mt-2">
          <Badge variant="outline" className="text-xs">
            Theme: {currentTheme.name}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Page Template */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layout className="h-4 w-4 text-purple-500" />
            <Label className="text-sm font-medium">Page Template</Label>
          </div>
          <Select 
            value={pageTemplateId || 'none'} 
            onValueChange={(value) => onPageTemplateChange(value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select page template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Page Template</SelectItem>
              {pageTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.name}
                    {template.isDefault && <Star className="h-3 w-3 fill-current" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {!pageTemplateId && defaultPageTemplate && (
            <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
              <strong>Default will be used:</strong> {defaultPageTemplate?.name || 'None'} ({getTemplatePreview(defaultPageTemplate)})
            </div>
          )}
        </div>

        {/* Header Template */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-blue-500" />
            <Label className="text-sm font-medium">Header Template</Label>
          </div>
          <Select 
            value={headerTemplateId || (defaultHeaderTemplate?.id || 'none')} 
            onValueChange={(value) => onHeaderTemplateChange(value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select header template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Header</SelectItem>
              {headerTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.name}
                    {template.isDefault && <Star className="h-3 w-3 fill-current" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
                          <strong>Preview:</strong> {getTemplatePreview(headerTemplates.find(t => t.id === (headerTemplateId || defaultHeaderTemplate?.id)) || defaultHeaderTemplate)}
          </div>
        </div>

        {/* Footer Template */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PanelBottom className="h-4 w-4 text-green-500" />
            <Label className="text-sm font-medium">Footer Template</Label>
          </div>
          <Select 
            value={footerTemplateId || (defaultFooterTemplate?.id || 'none')} 
            onValueChange={(value) => onFooterTemplateChange(value === 'none' ? undefined : value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select footer template" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No Footer</SelectItem>
              {footerTemplates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  <div className="flex items-center gap-2">
                    {template.name}
                    {template.isDefault && <Star className="h-3 w-3 fill-current" />}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="text-sm text-muted-foreground">
                          <strong>Preview:</strong> {getTemplatePreview(footerTemplates.find(t => t.id === (footerTemplateId || defaultFooterTemplate?.id)) || defaultFooterTemplate)}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 