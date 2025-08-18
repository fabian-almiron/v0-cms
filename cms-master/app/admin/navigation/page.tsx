'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal,
  GripVertical,
  ExternalLink,
  FileText,
  Home,
  Eye,
  Menu
} from 'lucide-react'

// Navigation item type
interface NavigationItem {
  id: string
  label: string
  type: 'internal' | 'external' | 'dropdown'
  href?: string
  pageId?: string
  order: number
  isVisible: boolean
  children?: NavigationItem[]
}

// localStorage utilities
const STORAGE_KEY = 'cms_navigation'
const PAGES_STORAGE_KEY = 'cms_pages'

async function loadNavigationFromDatabase() {
  try {
    const { loadNavigationFromDatabase: dbLoadNavigation } = await import('@/lib/cms-data')
    const result = await dbLoadNavigation()
    console.log('✅ Loaded navigation from database:', result)
    return result
  } catch (error) {
    console.error('❌ Error loading navigation from database:', error)
    return []
  }
}

async function saveNavigationToDatabase(navigation: NavigationItem[]) {
  try {
    console.log('💾 Saving navigation to database:', navigation)
    const { saveNavigationToDatabase: dbSaveNavigation, clearNavigationCache } = await import('@/lib/cms-data')
    const { getCurrentSiteId } = await import('@/lib/site-config')
    
    const siteId = getCurrentSiteId()
    
    const mapped = navigation
      .filter(item => item.type !== 'dropdown') // Filter out dropdown items as database doesn't support them
      .map(item => ({
        id: item.id,
        label: item.label,
        type: item.type as 'internal' | 'external',
        href: item.href,
        pageId: item.pageId,
        order: item.order,
        isVisible: item.isVisible
      }))
    
    console.log('💾 Mapped navigation for database:', mapped)
    const result = await dbSaveNavigation(mapped)
    
    // Clear cache after successful save so changes appear immediately
    if (result) {
      if (siteId) {
        clearNavigationCache(siteId)
        console.log('🗑️ Navigation cache cleared')
      }
    }
    
    console.log('✅ Navigation save result:', result)
    return result
  } catch (error) {
    console.error('❌ Error saving navigation to database:', error)
    return false
  }
}

async function loadPagesFromDatabase() {
  try {
    const { loadPagesFromDatabase } = await import('@/lib/cms-data')
    return await loadPagesFromDatabase()
  } catch (error) {
    console.error('Error loading pages from database:', error)
    return []
  }
}

// Navigation now starts empty - no default items

export default function NavigationManager() {
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [pages, setPages] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<NavigationItem | null>(null)
  const [formData, setFormData] = useState({
    label: '',
    type: 'internal' as NavigationItem['type'],
    href: '',
    pageId: '',
    isVisible: true
  })

  // Load navigation and pages on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedNavigation = await loadNavigationFromDatabase()
        const loadedPages = await loadPagesFromDatabase()
        setNavigation(loadedNavigation)
        setPages(loadedPages)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setIsLoaded(true)
      }
    }

    loadData()
  }, [])

  const handleSave = async () => {
    if (!formData.label) return

    const newItem: NavigationItem = {
      id: editingItem?.id || `nav-${Date.now()}`,
      label: formData.label,
      type: formData.type,
      href: formData.type === 'external' ? formData.href : undefined,
      pageId: formData.type === 'internal' ? formData.pageId : undefined,
      order: editingItem?.order ?? navigation.length,
      isVisible: formData.isVisible
    }

    let updatedNavigation: NavigationItem[]

    // If editing, update existing item
    if (editingItem) {
      updatedNavigation = navigation.map(item => 
        item.id === editingItem.id ? newItem : item
      )
    } else {
      // Adding new item
      updatedNavigation = [...navigation, newItem]
    }

    // Update local state immediately for better UX
      setNavigation(updatedNavigation)

    // Save to database
    console.log('🔄 Saving navigation to database...')
    const success = await saveNavigationToDatabase(updatedNavigation)
    
    if (success) {
      console.log('✅ Navigation saved successfully!')
      
      // Force invalidate ALL navigation caches (including Vercel Edge Cache)
      try {
        console.log('🔄 Invalidating all navigation caches...')
        
        // 1. Clear local memory/localStorage cache
        const { clearNavigationCache } = await import('@/lib/cms-data')
        const { getCurrentSiteId } = await import('@/lib/site-config')
        const siteId = getCurrentSiteId()
        if (siteId) {
          clearNavigationCache(siteId)
          console.log('🗑️ Local navigation cache cleared')
        }
        
        // 2. Force refresh the API cache (invalidates Vercel Edge Cache)
        const response = await fetch('/api/navigation', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          console.log('✅ API navigation cache refreshed')
        } else {
          console.warn('⚠️ Failed to refresh API cache:', response.status)
        }
        
      } catch (error) {
        console.warn('⚠️ Failed to invalidate caches:', error)
      }
    } else {
      console.error('❌ Failed to save navigation')
      alert('Failed to save navigation. Please try again.')
      return
    }

    // Reset form
    setFormData({
      label: '',
      type: 'internal',
      href: '',
      pageId: '',
      isVisible: true
    })
    setEditingItem(null)
    setIsDialogOpen(false)
  }

  const handleEdit = (item: NavigationItem) => {
    setEditingItem(item)
    setFormData({
      label: item.label,
      type: item.type,
      href: item.href || '',
      pageId: item.pageId || '',
      isVisible: item.isVisible
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this navigation item?')) {
      const updatedNavigation = navigation.filter(item => item.id !== itemId)
      setNavigation(updatedNavigation)
      
      console.log('🗑️ Deleting navigation item...')
      const success = await saveNavigationToDatabase(updatedNavigation)
      
      if (success) {
        console.log('✅ Navigation item deleted successfully!')
        
        // Clear frontend cache
        try {
          const { clearNavigationCache } = await import('@/lib/cms-data')
          const { getCurrentSiteId } = await import('@/lib/site-config')
          const siteId = getCurrentSiteId()
          if (siteId) {
            clearNavigationCache(siteId)
          }
        } catch (error) {
          console.warn('⚠️ Failed to clear frontend cache:', error)
        }
      } else {
        console.error('❌ Failed to delete navigation item')
        alert('Failed to delete navigation item. Please try again.')
      }
    }
  }

  const handleToggleVisibility = async (itemId: string) => {
    const updatedNavigation = navigation.map(item => 
      item.id === itemId 
        ? { ...item, isVisible: !item.isVisible }
        : item
    )
    setNavigation(updatedNavigation)
    
    console.log('👁️ Toggling navigation item visibility...')
    const success = await saveNavigationToDatabase(updatedNavigation)
    
    if (success) {
      console.log('✅ Navigation visibility updated successfully!')
      
      // Clear frontend cache
      try {
        const { clearNavigationCache } = await import('@/lib/cms-data')
        const { getCurrentSiteId } = await import('@/lib/site-config')
        const siteId = getCurrentSiteId()
        if (siteId) {
          clearNavigationCache(siteId)
        }
      } catch (error) {
        console.warn('⚠️ Failed to clear frontend cache:', error)
      }
    } else {
      console.error('❌ Failed to update navigation visibility')
      alert('Failed to update navigation visibility. Please try again.')
    }
  }

  const getItemHref = (item: NavigationItem) => {
    if (item.type === 'external') {
      return item.href || '#'
    } else if (item.type === 'internal' && item.pageId) {
      const page = pages.find(p => p.id === item.pageId)
      return page ? `/${page.slug}` : '/'
    }
    return '/'
  }

  if (!isLoaded) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading navigation...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Navigation Manager</h1>
            <p className="text-muted-foreground mt-1">
              Manage your website's navigation menus
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={async () => {
                console.log('🔄 Manually refreshing ALL navigation caches...')
                try {
                  // 1. Clear local caches
                  const { clearNavigationCache } = await import('@/lib/cms-data')
                  const { getCurrentSiteId } = await import('@/lib/site-config')
                  const siteId = getCurrentSiteId()
                  if (siteId) {
                    clearNavigationCache(siteId)
                    console.log('✅ Local navigation cache cleared')
                  }
                  
                  // 2. Force refresh the navigation API cache (invalidates Vercel Edge)
                  const navResponse = await fetch('/api/navigation', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  
                  if (navResponse.ok) {
                    console.log('✅ Navigation API cache refreshed')
                  } else {
                    console.warn('⚠️ Navigation API cache refresh failed:', navResponse.status)
                  }
                  
                  // 3. Also trigger general static file regeneration
                  const response = await fetch('/api/generate-static', { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                  })
                  
                  if (response.ok) {
                    console.log('✅ Static files regenerated')
                    alert('All navigation caches refreshed! Your new nav item should now be visible on the frontend.')
                  } else {
                    console.warn('⚠️ Static file regeneration failed')
                    alert('Navigation caches cleared, but static file regeneration had issues.')
                  }
                } catch (error) {
                  console.error('❌ Failed to refresh caches:', error)
                  alert('Failed to refresh navigation caches.')
                }
              }}
            >
              Refresh Cache
            </Button>
            <Button 
              variant="outline" 
              onClick={async () => {
                if (confirm('Clear all navigation items? This action cannot be undone.')) {
                  setNavigation([])
                  await saveNavigationToDatabase([])
                }
              }}
            >
              Clear Navigation
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingItem(null)
                  setFormData({
                    label: '',
                    type: 'internal',
                    href: '',
                    pageId: '',
                    isVisible: true
                  })
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Navigation Item
                                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Navigation Item' : 'Add Navigation Item'}
                </DialogTitle>
                <DialogDescription>
                  Configure your navigation item settings.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData(prev => ({ ...prev, label: e.target.value }))}
                    placeholder="Navigation label"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="type">Link Type</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value: NavigationItem['type']) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select link type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal">Internal Page</SelectItem>
                      <SelectItem value="external">External URL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {formData.type === 'internal' && (
                  <div className="space-y-2">
                    <Label htmlFor="pageId">Page</Label>
                    <Select 
                      value={formData.pageId} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, pageId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a page" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home">Home Page</SelectItem>
                        {pages
                          .filter(page => page.status === 'published')
                          .map((page) => (
                            <SelectItem key={page.id} value={page.id}>
                              {page.title}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {formData.type === 'external' && (
                  <div className="space-y-2">
                    <Label htmlFor="href">URL</Label>
                    <Input
                      id="href"
                      value={formData.href}
                      onChange={(e) => setFormData(prev => ({ ...prev, href: e.target.value }))}
                      placeholder="https://example.com or #section"
                    />
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={!formData.label}>
                  {editingItem ? 'Update' : 'Add'} Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Items</CardTitle>
              <Menu className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{navigation.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visible Items</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {navigation.filter(item => item.isVisible).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Internal Links</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {navigation.filter(item => item.type === 'internal').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Navigation Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>Navigation Items</CardTitle>
            <CardDescription>
              Manage your website navigation structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Order</TableHead>
                  <TableHead>Label</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Link</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {navigation
                  .sort((a, b) => a.order - b.order)
                  .map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                          <span className="text-sm text-muted-foreground">
                            {index + 1}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.label}</TableCell>
                      <TableCell>
                        <Badge variant={item.type === 'internal' ? 'default' : 'secondary'}>
                          {item.type === 'internal' ? (
                            <>
                              <FileText className="h-3 w-3 mr-1" />
                              Internal
                            </>
                          ) : (
                            <>
                              <ExternalLink className="h-3 w-3 mr-1" />
                              External
                            </>
                          )}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {getItemHref(item)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.isVisible ? 'default' : 'secondary'}>
                          {item.isVisible ? 'Visible' : 'Hidden'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleVisibility(item.id)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {item.isVisible ? 'Hide' : 'Show'}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDelete(item.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>

            {navigation.length === 0 && (
              <div className="text-center py-8">
                <Menu className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No navigation items</h3>
                <p className="text-muted-foreground mb-4">
                  Get started by adding your first navigation item.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Navigation Item
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 