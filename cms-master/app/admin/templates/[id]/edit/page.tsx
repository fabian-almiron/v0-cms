'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ArrowLeft, Save, Layout, Edit } from 'lucide-react'
import { Template, TemplateType, PageBlock } from '@/lib/cms-types'
import PageBuilder from '@/components/cms/PageBuilder'

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string
  
  const [template, setTemplate] = useState<Template | null>(null)
  const [templateData, setTemplateData] = useState({
    name: '',
    type: 'page' as TemplateType,
    description: '',
    blocks: [] as PageBlock[]
  })
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)

  // Load template data from database
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const { loadTemplatesFromDatabase } = await import('@/lib/cms-data')
        const templates = await loadTemplatesFromDatabase()
        const foundTemplate = templates.find(t => t.id === templateId)
        
        if (foundTemplate) {
          setTemplate(foundTemplate)
          setTemplateData({
            name: foundTemplate.name,
            type: foundTemplate.type,
            description: foundTemplate.description || '',
            blocks: foundTemplate.blocks
          })
        } else {
          alert('Template not found')
          router.push('/admin/templates')
        }
      } catch (error) {
        console.error('Error loading template:', error)
        alert('Error loading template')
        router.push('/admin/templates')
      } finally {
        setLoading(false)
      }
    }

    if (templateId) {
      loadTemplate()
    }
  }, [templateId, router])

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
      // Update template in database
      // Note: We would need an updateTemplateInDatabase function
      // For now, we'll delete and recreate the template
      const { saveTemplateToDatabase } = await import('@/lib/cms-data')
      
      // Save updated template
      const savedTemplate = await saveTemplateToDatabase({
        name: templateData.name.trim(),
        type: templateData.type,
        description: templateData.description.trim(),
        blocks: templateData.blocks,
        isDefault: template?.isDefault || false
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

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Layout className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading template...</p>
        </div>
      </div>
    )
  }

  if (!template) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p>Template not found</p>
          <Button onClick={() => router.push('/admin/templates')} className="mt-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8  mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" onClick={() => router.push('/admin/templates')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Templates
          </Button>
          <div className="flex items-center gap-2">
            <Edit className="h-8 w-8" />
            <div>
              <h1 className="text-3xl font-bold">Edit Template</h1>
              <p className="text-muted-foreground mt-1">
                Modify your template with drag-and-drop components
              </p>
            </div>
          </div>
        </div>

        {/* Template Settings */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Template Settings</CardTitle>
            <CardDescription>
              Update your template details and configuration
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
              {templateData.type === 'header' && 'Build your header template. Add navigation, logos, and other header elements. Use the DND Area component to mark where page content should appear.'}
              {templateData.type === 'footer' && 'Build your footer template. Add links, copyright, social media, and other footer elements. Use the DND Area component to mark where page content should appear.'}
              {templateData.type === 'page' && 'Build your page template. Create the overall page structure and layout.'}
              {templateData.type === 'post' && 'Build your post template. Design the layout for blog posts and articles.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <PageBuilder
              pageName={templateData.name || 'Template'}
              initialBlocks={templateData.blocks}
              onSave={(blocks) => handleBlocksUpdate(blocks)}
              showTemplateSelector={false}
              templateType={templateData.type}
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