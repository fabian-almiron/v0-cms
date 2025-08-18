'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Database, Upload, Plus, CheckCircle, AlertCircle, ExternalLink, Copy } from 'lucide-react'
import { getCurrentSite, createSite, SiteConfig } from '@/lib/site-config'
import { migrateFromLocalStorage } from '@/lib/cms-data'
import { isSupabaseConfigured } from '@/lib/supabase'

interface SiteSetupProps {
  onSiteConfigured: (site: SiteConfig) => void
}

export default function SiteSetup({ onSiteConfigured }: SiteSetupProps) {
  const [currentSite, setCurrentSite] = useState<SiteConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isCreating, setIsCreating] = useState(false)
  const [isMigrating, setIsMigrating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [migrationResults, setMigrationResults] = useState<{ pages: number, templates: number, navigation: number } | null>(null)
  const [dbConfigured, setDbConfigured] = useState(false)
  const [showEnvSetup, setShowEnvSetup] = useState(false)
  const [isAutoFilled, setIsAutoFilled] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    domain: '',
    owner_email: ''
  })

  // Check if user has existing localStorage data
  const [hasLocalStorageData, setHasLocalStorageData] = useState(false)

  useEffect(() => {
    const checkConfiguration = async () => {
      try {
        // First check if Supabase is configured
        const configured = isSupabaseConfigured()
        setDbConfigured(configured)

        if (configured) {
          // Check for environment variable site ID (from master dashboard deployment)
          // Note: Only NEXT_PUBLIC_ env vars are available in client components
          const envSiteId = process.env.NEXT_PUBLIC_CMS_SITE_ID
          
          if (envSiteId) {
            console.log('🎯 Found site ID from environment:', envSiteId)
            console.log('🔍 Attempting to load site data from master dashboard deployment...')
            // Try to load the site data from the database using the env site ID
            try {
              const { getSiteById } = await import('@/lib/supabase')
              const existingSite = await getSiteById(envSiteId)
              
              if (existingSite) {
                console.log('✅ Auto-loading site from master dashboard:', existingSite.name)
                // Store in localStorage for persistence
                localStorage.setItem('cms_site_id', existingSite.id)
                
                const siteConfig = {
                  id: existingSite.id,
                  name: existingSite.name,
                  domain: existingSite.domain,
                  isActive: existingSite.status === 'active'
                }
                
                setCurrentSite(siteConfig)
                
                // Auto-fill form with existing data
                setFormData({
                  name: existingSite.name,
                  domain: existingSite.domain,
                  owner_email: existingSite.owner_email || ''
                })
                setIsAutoFilled(true)
                
                onSiteConfigured(siteConfig)
                return
              }
            } catch (error) {
              console.log('⚠️ Could not load site from environment ID:', error)
              console.log('This is normal if the site is not yet created in the database.')
            }
          } else {
            console.log('ℹ️ No NEXT_PUBLIC_CMS_SITE_ID found - this means the site was not deployed from the master dashboard')
          }
          
          // Fallback to checking existing site configuration
          const site = await getCurrentSite()
          if (site) {
            setCurrentSite(site)
            onSiteConfigured(site)
          }
        }
      } catch (error) {
        console.error('Error checking configuration:', error)
      } finally {
        setIsLoading(false)
      }
    }

    // Check for existing localStorage data
    const checkLocalStorage = () => {
      const hasPages = !!localStorage.getItem('cms_pages')
      const hasTemplates = !!localStorage.getItem('cms-templates')
      const hasNavigation = !!localStorage.getItem('cms_navigation')
      setHasLocalStorageData(hasPages || hasTemplates || hasNavigation)
    }

    checkConfiguration()
    checkLocalStorage()
  }, [onSiteConfigured])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handleCreateSite = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsCreating(true)

    try {
      const site = await createSite({
        name: formData.name,
        domain: formData.domain,
        owner_email: formData.owner_email
      })

      if (site) {
        setCurrentSite(site)
        
        // Show environment variable setup alert
        const envVarMessage = `🎉 Site created successfully!\n\n` +
          `To make this site persistent across deployments, add these environment variables in Vercel:\n\n` +
          `CMS_SITE_ID=${site.id}\n` +
          `NEXT_PUBLIC_CMS_SITE_ID=${site.id}\n\n` +
          `Steps:\n` +
          `1. Go to Vercel Dashboard → Project Settings → Environment Variables\n` +
          `2. Add both variables above\n` +
          `3. Redeploy your project\n\n` +
          `The site ID has been copied to your console for easy reference.`
        
        alert(envVarMessage)
        
        onSiteConfigured(site)
      } else {
        alert('Failed to create site. Please try again.')
      }
    } catch (error) {
      console.error('Error creating site:', error)
      alert('Error creating site. Please check your database connection and try again.')
    } finally {
      setIsCreating(false)
    }
  }

  const handleMigrateData = async () => {
    setIsMigrating(true)

    try {
      const results = await migrateFromLocalStorage()
      setMigrationResults(results)
      
      // Clear localStorage after successful migration
      localStorage.removeItem('cms_pages')
      localStorage.removeItem('cms-templates')
      localStorage.removeItem('cms_navigation')
      
      setHasLocalStorageData(false)
      
    } catch (error) {
      console.error('Error migrating data:', error)
      alert('Error migrating data. Please try again.')
    } finally {
      setIsMigrating(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Database className="h-8 w-8 animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Checking configuration...</p>
        </div>
      </div>
    )
  }

  // Show database setup instructions if not configured
  if (!dbConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Setup Required
            </CardTitle>
            <CardDescription>
              Configure your Supabase database to start using the CMS
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {!showEnvSetup ? (
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your database connection is not configured. Follow these steps to set up Supabase.
                  </AlertDescription>
                </Alert>

                <div className="space-y-3">
                  <h4 className="font-medium">Setup Steps:</h4>
                  <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                    <li>Create a Supabase project at <a href="https://supabase.com" target="_blank" className="text-blue-600 hover:underline inline-flex items-center gap-1">supabase.com <ExternalLink className="h-3 w-3" /></a></li>
                    <li>Run the database schema (see documentation)</li>
                    <li>Add environment variables to your deployment</li>
                    <li>Restart your application</li>
                  </ol>
                </div>

                <Button 
                  onClick={() => setShowEnvSetup(true)} 
                  className="w-full"
                >
                  Show Environment Variables Setup
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Required Environment Variables</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add these to your Vercel deployment in <strong>Project Settings → Environment Variables</strong>:
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-medium">NEXT_PUBLIC_SUPABASE_URL</Label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_URL')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground">https://[project-ref].supabase.co</code>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-medium">NEXT_PUBLIC_SUPABASE_ANON_KEY</Label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard('NEXT_PUBLIC_SUPABASE_ANON_KEY')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground">eyJhbGciOiJIUzI1NiIs...</code>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-md">
                    <div className="flex items-center justify-between mb-1">
                      <Label className="text-xs font-medium">SUPABASE_SERVICE_ROLE_KEY</Label>
                      <Button variant="ghost" size="sm" onClick={() => copyToClipboard('SUPABASE_SERVICE_ROLE_KEY')}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <code className="text-xs text-muted-foreground">eyJhbGciOiJIUzI1NiIs...</code>
                  </div>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> After adding environment variables, you must redeploy your application for changes to take effect.
                  </AlertDescription>
                </Alert>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowEnvSetup(false)}
                    className="flex-1"
                  >
                    Back
                  </Button>
                  <Button 
                    onClick={() => window.location.reload()}
                    className="flex-1"
                  >
                    Check Configuration
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  if (currentSite) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Site Configured
            </CardTitle>
            <CardDescription>
              {isAutoFilled 
                ? "🎉 Automatically configured from Master Dashboard!"
                : "Your site is ready to use"
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium">Site Name</Label>
              <p className="text-sm text-muted-foreground">{currentSite.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Domain</Label>
              <p className="text-sm text-muted-foreground">{currentSite.domain}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Status</Label>
              <Badge variant={currentSite.isActive ? "default" : "secondary"}>
                {currentSite.isActive ? "Active" : "Inactive"}
              </Badge>
            </div>

            {/* Migration Section */}
            {hasLocalStorageData && (
              <>
                <Separator />
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    <h4 className="font-medium">Migrate Local Data</h4>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    We found existing data in your browser. Migrate it to your database?
                  </p>
                  <Button 
                    onClick={handleMigrateData} 
                    disabled={isMigrating}
                    className="w-full"
                  >
                    {isMigrating ? 'Migrating...' : 'Migrate Data to Database'}
                  </Button>
                </div>
              </>
            )}

            {/* Migration Results */}
            {migrationResults && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Successfully migrated: {migrationResults.pages} pages, {migrationResults.templates} templates, {migrationResults.navigation} navigation items
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Create Your Site
          </CardTitle>
          <CardDescription>
            Set up your first site to start using the CMS
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          
          {isAutoFilled && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Auto-configured!</strong> Your site details have been pre-filled from the Master Dashboard. You can modify them if needed or proceed with the current settings.
              </AlertDescription>
            </Alert>
          )}
          
          {hasLocalStorageData && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                We found existing data in your browser that will be migrated after site creation.
              </AlertDescription>
            </Alert>
          )}

          {!showCreateForm && !isAutoFilled ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Your database is configured! Create your first site to start building.
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)} 
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create New Site
              </Button>
            </div>
          ) : (
            <form onSubmit={handleCreateSite} className="space-y-4">
              <div>
                <Label htmlFor="site-name">Site Name</Label>
                <Input
                  id="site-name"
                  type="text"
                  placeholder="My Awesome Website"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="domain">Domain</Label>
                <Input
                  id="domain"
                  type="text"
                  placeholder="mysite.com"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="email">Owner Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@mysite.com"
                  value={formData.owner_email}
                  onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                  required
                />
              </div>

              <div className="flex gap-2">
                {!isAutoFilled && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <Button 
                  type="submit" 
                  disabled={isCreating}
                  className={isAutoFilled ? "w-full" : "flex-1"}
                >
                  {isCreating 
                    ? 'Creating...' 
                    : isAutoFilled 
                      ? 'Confirm & Create Site' 
                      : 'Create Site'
                  }
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 