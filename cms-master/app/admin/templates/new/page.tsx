'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Layout } from 'lucide-react'
import { Template, TemplateType, PageBlock } from '@/lib/cms-types'
import PageBuilder from '@/components/cms/PageBuilder'

export default function NewTemplatePage() {
  const router = useRouter()
  const [templateData, setTemplateData] = useState({
    name: '',
    type: 'page' as TemplateType,
    description: '',
    blocks: [] as PageBlock[]
  })
  const [saving, setSaving] = useState(false)

  const handleBlocksUpdate = (newBlocks: PageBlock[]) => {
    setTemplateData(prev => ({
      ...prev,
      blocks: newBlocks
    }))
  }

  const handleSave = async () => {
    if (!templateData.name.trim()) {
      alert('Please enter a template name')
      return
    }

    setSaving(true)
    
    try {
      // Save to database
      const { saveTemplateToDatabase } = await import('@/lib/cms-data')
      const savedTemplate = await saveTemplateToDatabase({
        name: templateData.name.trim(),
        type: templateData.type,
        description: templateData.description.trim(),
        blocks: templateData.blocks,
        isDefault: false
      })

      if (!savedTemplate) {
        throw new Error('Failed to save template to database')
      }

      // Redirect back to templates page
      router.push('/admin/templates')
    } catch (error) {
      console.error('Error saving template:', error)
      alert('Error saving template. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/admin/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-2">
            <Layout className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Create Template</h1>
              <p className="text-muted-foreground mt-1">
                Build a reusable template with drag-and-drop components
              </p>
            </div>
          </div>
        </div>

        {/* Template Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>
              Configure your template details before building the layout
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  placeholder="Enter template name..."
                  value={templateData.name}
                  onChange={(e) => setTemplateData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-type">Template Type</Label>
                <Select
                  value={templateData.type}
                  onValueChange={(value) => setTemplateData(prev => ({ ...prev, type: value as TemplateType }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="header">Header Template</SelectItem>
                    <SelectItem value="footer">Footer Template</SelectItem>
                    <SelectItem value="page">Page Template</SelectItem>
                    <SelectItem value="post">Post Template</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="template-description">Description (Optional)</Label>
              <Textarea
                id="template-description"
                placeholder="Describe what this template is for..."
                value={templateData.description}
                onChange={(e) => setTemplateData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Template Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Template Builder</CardTitle>
            <CardDescription>
              Drag and drop components to build your template layout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageBuilder
              pageName={templateData.name || 'New Template'}
              initialBlocks={templateData.blocks}
              onSave={(blocks) => handleBlocksUpdate(blocks)}
              showTemplateSelector={false}
            />
          </CardContent>
        </Card>

        {/* Save Actions */}
        <div className="flex justify-end gap-4 mt-8">
          <Button variant="outline" onClick={() => router.push('/admin/templates')}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !templateData.name.trim()}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  )
} 