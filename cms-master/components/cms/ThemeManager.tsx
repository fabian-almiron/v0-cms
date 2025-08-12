'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Palette, 
  Paintbrush, 
  Check, 
  Loader2, 
  Info, 
  User, 
  Package,
  AlertCircle 
} from 'lucide-react'
import { useTheme } from '@/lib/theme-context'

export default function ThemeManager() {
  const { currentTheme, availableThemes, switchTheme, loading, error } = useTheme()
  const [switching, setSwitching] = useState(false)

  const handleThemeSwitch = async (themeId: string) => {
    if (themeId === currentTheme?.id) return
    
    setSwitching(true)
    try {
      await switchTheme(themeId)
    } catch (err) {
      console.error('Failed to switch theme:', err)
    } finally {
      setSwitching(false)
    }
  }

  if (loading && !currentTheme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Manager
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-muted-foreground">Loading themes...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current Theme Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Theme Manager
          </CardTitle>
          <CardDescription>
            Manage and switch between available themes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Theme Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Theme</label>
            <Select
              value={currentTheme?.id || ''}
              onValueChange={handleThemeSwitch}
              disabled={switching || loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a theme" />
              </SelectTrigger>
              <SelectContent>
                {availableThemes.map((themeId) => (
                  <SelectItem key={themeId} value={themeId}>
                    <div className="flex items-center gap-2">
                      <Paintbrush className="h-4 w-4" />
                      <span className="capitalize">{themeId}</span>
                      {currentTheme?.id === themeId && (
                        <Check className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {switching && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Switching themes...
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Theme Details */}
      {currentTheme && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              Current Theme
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Name</span>
                <Badge variant="outline">{currentTheme.name}</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Version</span>
                <span className="text-sm text-muted-foreground">{currentTheme.version}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Author</span>
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  <span className="text-sm text-muted-foreground">{currentTheme.author}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Components</span>
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span className="text-sm text-muted-foreground">
                    {currentTheme.componentInfo.length}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t">
              <p className="text-sm text-muted-foreground">
                {currentTheme.description}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Component Categories */}
      {currentTheme && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Available Components</CardTitle>
            <CardDescription>
              Components available in this theme
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['page-templates', 'layout', 'ui-components'].map((category) => {
                const components = currentTheme.getComponentsByCategory(category)
                return (
                  <div key={category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {category.replace('-', ' ')}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {components.length}
                      </Badge>
                    </div>
                    {components.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {components.slice(0, 5).map((component) => (
                          <Badge key={component.type} variant="outline" className="text-xs">
                            {component.name}
                          </Badge>
                        ))}
                        {components.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{components.length - 5} more
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Theme Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Theme Actions</CardTitle>
          <CardDescription>
            Manage your themes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Package className="h-4 w-4 mr-2" />
            Install New Theme
            <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
          </Button>
          
          <Button variant="outline" size="sm" className="w-full" disabled>
            <Paintbrush className="h-4 w-4 mr-2" />
            Create Custom Theme
            <Badge variant="secondary" className="ml-2 text-xs">Soon</Badge>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
} 