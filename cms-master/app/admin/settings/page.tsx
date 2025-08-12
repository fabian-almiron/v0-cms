'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Settings, Globe, Shield, Palette, Crown, Loader2, Save, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import DatabaseSettings from '@/components/cms/DatabaseSettings'
import StaticFileManager from '@/components/cms/StaticFileManager'
import SiteConfigDiagnostics from '@/components/cms/SiteConfigDiagnostics'
import AdminGuard from '@/components/cms/AdminGuard'
import { getCurrentSiteId } from '@/lib/site-config'
import { getSiteSettings, setSiteSetting } from '@/lib/supabase'
import { useTheme } from '@/lib/theme-context'

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  currentTheme: string
  darkMode: boolean
  compactMode: boolean
  primaryColor: string
  twoFactorAuth: boolean
  loginNotifications: boolean
  sessionTimeout: string
}

const defaultSettings: SiteSettings = {
  siteName: 'StreamLine',
  siteDescription: 'Streamline your workflow like never before',
  siteUrl: 'https://yoursite.com',
  currentTheme: 'default',
  darkMode: false,
  compactMode: false,
  primaryColor: 'blue',
  twoFactorAuth: false,
  loginNotifications: true,
  sessionTimeout: '1 day'
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const [saveStatus, setSaveStatus] = useState<{
    site: 'idle' | 'saving' | 'saved' | 'error'
    theme: 'idle' | 'saving' | 'saved' | 'error'
    security: 'idle' | 'saving' | 'saved' | 'error'
  }>({
    site: 'idle',
    theme: 'idle',
    security: 'idle'
  })
  const { switchTheme } = useTheme()

  // Handle theme change - update settings and switch active theme
  const handleThemeChange = async (themeId: string) => {
    setSettings(prev => ({ ...prev, currentTheme: themeId }))
    try {
      await switchTheme(themeId)
    } catch (error) {
      console.error('Error switching theme:', error)
    }
  }

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const siteId = getCurrentSiteId()
        if (!siteId) {
          console.warn('No site ID found, using default settings')
          setIsLoading(false)
          return
        }

        const siteSettings = await getSiteSettings(siteId)
        const settingsMap = Object.fromEntries(
          siteSettings.map(setting => [setting.key, setting.value])
        )

        setSettings({
          siteName: settingsMap.siteName || defaultSettings.siteName,
          siteDescription: settingsMap.siteDescription || defaultSettings.siteDescription,
          siteUrl: settingsMap.siteUrl || defaultSettings.siteUrl,
          currentTheme: settingsMap.currentTheme || defaultSettings.currentTheme,
          darkMode: settingsMap.darkMode || defaultSettings.darkMode,
          compactMode: settingsMap.compactMode || defaultSettings.compactMode,
          primaryColor: settingsMap.primaryColor || defaultSettings.primaryColor,
          twoFactorAuth: settingsMap.twoFactorAuth || defaultSettings.twoFactorAuth,
          loginNotifications: settingsMap.loginNotifications !== undefined ? settingsMap.loginNotifications : defaultSettings.loginNotifications,
          sessionTimeout: settingsMap.sessionTimeout || defaultSettings.sessionTimeout
        })
      } catch (error) {
        console.error('Error loading settings:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  const saveSiteSettings = async () => {
    const siteId = getCurrentSiteId()
    if (!siteId) {
      alert('No site configuration found. Please set up your site first.')
      return
    }

    setSaveStatus(prev => ({ ...prev, site: 'saving' }))
    
    try {
      await Promise.all([
        setSiteSetting(siteId, 'siteName', settings.siteName),
        setSiteSetting(siteId, 'siteDescription', settings.siteDescription),
        setSiteSetting(siteId, 'siteUrl', settings.siteUrl)
      ])
      
      setSaveStatus(prev => ({ ...prev, site: 'saved' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, site: 'idle' })), 2000)
    } catch (error) {
      console.error('Error saving site settings:', error)
      setSaveStatus(prev => ({ ...prev, site: 'error' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, site: 'idle' })), 3000)
    }
  }

  const saveThemeSettings = async () => {
    const siteId = getCurrentSiteId()
    if (!siteId) {
      alert('No site configuration found. Please set up your site first.')
      return
    }

    setSaveStatus(prev => ({ ...prev, theme: 'saving' }))
    
    try {
      await Promise.all([
        setSiteSetting(siteId, 'currentTheme', settings.currentTheme),
        setSiteSetting(siteId, 'darkMode', settings.darkMode),
        setSiteSetting(siteId, 'compactMode', settings.compactMode),
        setSiteSetting(siteId, 'primaryColor', settings.primaryColor)
      ])
      
      setSaveStatus(prev => ({ ...prev, theme: 'saved' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, theme: 'idle' })), 2000)
    } catch (error) {
      console.error('Error saving theme settings:', error)
      setSaveStatus(prev => ({ ...prev, theme: 'error' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, theme: 'idle' })), 3000)
    }
  }

  const saveSecuritySettings = async () => {
    const siteId = getCurrentSiteId()
    if (!siteId) {
      alert('No site configuration found. Please set up your site first.')
      return
    }

    setSaveStatus(prev => ({ ...prev, security: 'saving' }))
    
    try {
      await Promise.all([
        setSiteSetting(siteId, 'twoFactorAuth', settings.twoFactorAuth),
        setSiteSetting(siteId, 'loginNotifications', settings.loginNotifications),
        setSiteSetting(siteId, 'sessionTimeout', settings.sessionTimeout)
      ])
      
      setSaveStatus(prev => ({ ...prev, security: 'saved' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, security: 'idle' })), 2000)
    } catch (error) {
      console.error('Error saving security settings:', error)
      setSaveStatus(prev => ({ ...prev, security: 'error' }))
      setTimeout(() => setSaveStatus(prev => ({ ...prev, security: 'idle' })), 3000)
    }
  }

  const getSaveButtonContent = (status: string, text: string) => {
    switch (status) {
      case 'saving':
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving...
          </>
        )
      case 'saved':
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Saved!
          </>
        )
      case 'error':
        return (
          <>
            <AlertCircle className="mr-2 h-4 w-4" />
            Error
          </>
        )
      default:
        return (
          <>
            <Save className="mr-2 h-4 w-4" />
            {text}
          </>
        )
    }
  }

  const getSaveButtonVariant = (status: string) => {
    switch (status) {
      case 'saved':
        return 'default'
      case 'error':
        return 'destructive'
      default:
        return 'default'
    }
  }

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-4 lg:p-8 mx-auto">
        <div className="flex items-center gap-2 mb-8">
          <Settings className="h-8 w-8" />
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground mt-1">
              Configure your CMS and website settings
            </p>
          </div>
        </div>

        {/* Admin Notice */}
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="flex items-center gap-3 pt-6">
            <Crown className="h-5 w-5 text-amber-600" />
            <div className="flex-1">
              <p className="font-medium text-amber-900 dark:text-amber-100">Admin Settings</p>
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Advanced configuration options for system administrators
              </p>
            </div>
            <Badge variant="secondary" className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
              Sudo Access
            </Badge>
          </CardContent>
        </Card>

        {/* Site Configuration Diagnostics */}
        <AdminGuard>
          <SiteConfigDiagnostics />
        </AdminGuard>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
          {/* Site Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Site Settings
              </CardTitle>
              <CardDescription>
                Basic configuration for your website
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="site-name">Site Name</Label>
                <Input 
                  id="site-name" 
                  value={settings.siteName}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-description">Site Description</Label>
                <Input 
                  id="site-description" 
                  value={settings.siteDescription}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteDescription: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="site-url">Site URL</Label>
                <Input 
                  id="site-url" 
                  value={settings.siteUrl}
                  onChange={(e) => setSettings(prev => ({ ...prev, siteUrl: e.target.value }))}
                />
              </div>
              <Button 
                className="w-full"
                onClick={saveSiteSettings}
                disabled={saveStatus.site === 'saving'}
                variant={getSaveButtonVariant(saveStatus.site)}
              >
                {getSaveButtonContent(saveStatus.site, 'Save Site Settings')}
              </Button>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Theme & Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of your CMS
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Current Theme</Label>
                <Select 
                  value={settings.currentTheme}
                  onValueChange={handleThemeChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="default">Default Theme</SelectItem>
                    <SelectItem value="modern">Modern Theme</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">Choose your site's visual theme</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Toggle dark/light theme</p>
                </div>
                <Switch 
                  checked={settings.darkMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, darkMode: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduce spacing for more content</p>
                </div>
                <Switch 
                  checked={settings.compactMode}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, compactMode: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Color</Label>
                <div className="flex gap-2">
                  {['blue', 'green', 'purple', 'red'].map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-md border-2 ${
                        settings.primaryColor === color ? 'border-white shadow-lg' : 'border-gray-300'
                      } ${
                        color === 'blue' ? 'bg-blue-500' :
                        color === 'green' ? 'bg-green-500' :
                        color === 'purple' ? 'bg-purple-500' :
                        'bg-red-500'
                      }`}
                      onClick={() => setSettings(prev => ({ ...prev, primaryColor: color }))}
                    />
                  ))}
                </div>
              </div>
              <Button 
                className="w-full"
                onClick={saveThemeSettings}
                disabled={saveStatus.theme === 'saving'}
                variant={getSaveButtonVariant(saveStatus.theme)}
              >
                {getSaveButtonContent(saveStatus.theme, 'Save Theme Settings')}
              </Button>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security
              </CardTitle>
              <CardDescription>
                Authentication and access control
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">Add extra security to your account</p>
                </div>
                <Switch 
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, twoFactorAuth: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label>Login Notifications</Label>
                  <p className="text-sm text-muted-foreground">Get notified of new logins</p>
                </div>
                <Switch 
                  checked={settings.loginNotifications}
                  onCheckedChange={(checked) => setSettings(prev => ({ ...prev, loginNotifications: checked }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Session Timeout</Label>
                <Select 
                  value={settings.sessionTimeout}
                  onValueChange={(value) => setSettings(prev => ({ ...prev, sessionTimeout: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1 hour">1 hour</SelectItem>
                    <SelectItem value="4 hours">4 hours</SelectItem>
                    <SelectItem value="1 day">1 day</SelectItem>
                    <SelectItem value="1 week">1 week</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={saveSecuritySettings}
                disabled={saveStatus.security === 'saving'}
              >
                {getSaveButtonContent(saveStatus.security, 'Save Security Settings')}
              </Button>
              <Button variant="outline" className="w-full">Change Password</Button>
            </CardContent>
          </Card>
        </div>

        {/* Database Settings - Admin Only */}
        <AdminGuard>
          <DatabaseSettings />
        </AdminGuard>

        {/* Static File Cache - Admin Only */}
        <AdminGuard>
          <StaticFileManager />
        </AdminGuard>

        {/* Coming Soon Notice */}
        <Card className="mt-6 lg:mt-8">
          <CardContent className="text-center py-8">
            <Settings className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Advanced Settings Coming Soon</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm lg:text-base">
              We're working on additional configuration options including custom domains, 
              email settings, backup management, and more.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 