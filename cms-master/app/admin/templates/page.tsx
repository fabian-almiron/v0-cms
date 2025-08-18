'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Layout, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Star,
  Navigation,
  PanelBottom,
  FileText,
  BookOpen,
  Eye,
  Search
} from 'lucide-react'
import { Template, TemplateType } from '@/lib/cms-types'
import { createStarterTemplatesForTheme } from '@/lib/theme-utils'
import { useCurrentTheme } from '@/lib/theme-context'

const templateTypeConfig = {
  header: {
    icon: Navigation,
    label: 'Header',
    description: 'Header sections and navigation',
    color: 'bg-blue-500'
  },
  footer: {
    icon: PanelBottom, 
    label: 'Footer',
    description: 'Footer sections and links',
    color: 'bg-green-500'
  },
  page: {
    icon: FileText,
    label: 'Page',
    description: 'Full page layouts',
    color: 'bg-purple-500'
  },
  post: {
    icon: BookOpen,
    label: 'Post',
    description: 'Blog post layouts',
    color: 'bg-orange-500'
  }
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([])
  const [activeTab, setActiveTab] = useState<TemplateType>('page')
  const [searchTerm, setSearchTerm] = useState('')
  const currentTheme = useCurrentTheme()

  // Load templates from database
  useEffect(() => {
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
  }, [])

  // Save templates to database
  const saveTemplates = async (newTemplates: Template[]) => {
    setTemplates(newTemplates)
    // Note: Individual template operations should use saveTemplateToDatabase
    // This function now mainly updates local state
  }

  // Filter templates by type and search
  const filteredTemplates = templates.filter(template => 
    template.type === activeTab &&
    (template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     template.description?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  // Get template stats
  const getTemplateStats = () => {
    return {
      total: templates.length,
      header: templates.filter(t => t.type === 'header').length,
      footer: templates.filter(t => t.type === 'footer').length,
      page: templates.filter(t => t.type === 'page').length,
      post: templates.filter(t => t.type === 'post').length,
      default: templates.filter(t => t.isDefault).length
    }
  }

  const stats = getTemplateStats()

  // Delete template
  const deleteTemplate = (templateId: string) => {
    const newTemplates = templates.filter(t => t.id !== templateId)
    saveTemplates(newTemplates)
  }

  // Duplicate template
  const duplicateTemplate = (template: Template) => {
    const newTemplate: Template = {
      ...template,
      id: Date.now().toString(),
      name: `${template.name} (Copy)`,
      isDefault: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    saveTemplates([...templates, newTemplate])
  }

  // Set as default template
  const setAsDefault = (templateId: string, type: TemplateType) => {
    const newTemplates = templates.map(template => {
      if (template.type === type) {
        return { ...template, isDefault: template.id === templateId }
      }
      return template
    })
    saveTemplates(newTemplates)
  }

  // Create starter templates
  const createStarterTemplates = () => {
    if (!currentTheme) return
    
    if (confirm('This will create basic Header, Footer, and Page templates. Continue?')) {
      const starterTemplates = createStarterTemplatesForTheme(currentTheme.id)
      setTemplates(starterTemplates)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8  mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
          <Layout className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Manage page templates and layouts
            </p>
            </div>
          </div>
          <div className="flex gap-2">
            {templates.length === 0 ? (
              <Button variant="outline" onClick={createStarterTemplates}>
                <Plus className="h-4 w-4 mr-2" />
                Create Starter Templates
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  if (confirm('Clear all templates? This action cannot be undone.')) {
                    setTemplates([])
                    if (currentTheme) {
                      localStorage.removeItem(`cms-templates-${currentTheme.id}`)
                    }
                  }
                }}
              >
                Clear All Templates
              </Button>
            )}
            <Button asChild>
              <Link href="/admin/templates/new">
                <Plus className="h-4 w-4 mr-2" />
                New Template
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Templates</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-500">{stats.header}</div>
              <div className="text-sm text-muted-foreground">Headers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-500">{stats.footer}</div>
              <div className="text-sm text-muted-foreground">Footers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-purple-500">{stats.page}</div>
              <div className="text-sm text-muted-foreground">Pages</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-orange-500">{stats.post}</div>
              <div className="text-sm text-muted-foreground">Posts</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Actions */}
        <div className="flex flex-col lg:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button asChild className="lg:w-auto">
            <Link href="/admin/templates/new">
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Link>
          </Button>
        </div>

        {/* Template Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TemplateType)}>
          <TabsList className="grid w-full grid-cols-4">
            {Object.entries(templateTypeConfig).map(([type, config]) => {
              const Icon = config.icon
              return (
                <TabsTrigger key={type} value={type} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{config.label}</span>
                </TabsTrigger>
              )
            })}
          </TabsList>

          {Object.entries(templateTypeConfig).map(([type, config]) => (
            <TabsContent key={type} value={type} className="mt-6">
              <div className="mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <config.icon className="h-5 w-5" />
                  {config.label} Templates
                </h3>
                <p className="text-muted-foreground text-sm">{config.description}</p>
              </div>

              {filteredTemplates.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <config.icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No {config.label} Templates</h3>
                    <p className="text-muted-foreground mb-4">
                      Create your first {config.label.toLowerCase()} template to get started.
                    </p>
                    <Button asChild>
                      <Link href="/admin/templates/new">
                        <Plus className="h-4 w-4 mr-2" />
                        Create {config.label} Template
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {filteredTemplates.map((template) => (
                    <Card key={template.id} className="group">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-base">{template.name}</CardTitle>
                            {template.isDefault && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                        </div>
                        {template.description && (
                          <CardDescription className="text-sm">
                            {template.description}
                          </CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <div className="text-xs text-muted-foreground mb-4">
                          {template.blocks.length} components • Created {new Date(template.createdAt).toLocaleDateString()}
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => duplicateTemplate(template)}>
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/admin/templates/${template.id}/edit`}>
                            <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          {!template.isDefault && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => deleteTemplate(template.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>

                        {!template.isDefault && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="w-full mt-2"
                            onClick={() => setAsDefault(template.id, template.type)}
                          >
                            <Star className="h-4 w-4 mr-2" />
                            Set as Default
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Template Builder Info */}
        <Card className="mt-8">
          <CardContent className="text-center py-8">
            <Layout className="h-12 w-12 text-primary mx-auto mb-4" />
            {templates.length === 0 ? (
              <>
                <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                <p className="text-muted-foreground max-w-md mx-auto text-sm lg:text-base mb-4">
                  Get started by creating basic starter templates, or build custom templates from scratch.
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={createStarterTemplates}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Starter Templates
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/templates/new">
                      Custom Template
                    </Link>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <h3 className="text-lg font-semibold mb-2">Template Builder Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm lg:text-base">
                  Create and edit templates with the visual drag-and-drop builder. 
                  Use the DND Area component in header/footer templates to mark where page content should appear.
            </p>
                <Button asChild className="mt-4">
                  <Link href="/admin/templates/new">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Custom Template
                  </Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 