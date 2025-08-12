'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Copy, ExternalLink, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react'
import { getCurrentSiteId } from '@/lib/site-config'

interface SiteDiagnostics {
  hasEnvSiteId: boolean
  currentSiteId: string | null
  siteExists: boolean
  siteName?: string
  envVarName: string
  vercelProjectUrl?: string
}

export default function SiteConfigDiagnostics() {
  const [diagnostics, setDiagnostics] = useState<SiteDiagnostics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const loadDiagnostics = async () => {
    try {
      // Check current site configuration  
      const siteId = getCurrentSiteId()
      
      // Check if we can detect if env var is set (this will be null on client for server vars)
      // We'll determine this based on whether we have a site ID without localStorage
      const hasLocalStorageSiteId = typeof window !== 'undefined' && !!localStorage.getItem('cms_site_id')
      const hasEnvSiteId = !!siteId && !hasLocalStorageSiteId
      
      let siteExists = false
      let siteName = undefined

      if (siteId) {
        try {
          // Try to fetch site details
          const response = await fetch(`/api/admin/site-check?siteId=${siteId}`)
          if (response.ok) {
            const result = await response.json()
            siteExists = result.exists
            siteName = result.name
          }
        } catch (error) {
          console.warn('Could not verify site existence:', error)
        }
      }

      // Determine Vercel project URL
      const vercelProjectUrl = process.env.NEXT_PUBLIC_VERCEL_URL 
        ? `https://vercel.com/dashboard`
        : undefined

      setDiagnostics({
        hasEnvSiteId,
        currentSiteId: siteId,
        siteExists,
        siteName,
        envVarName: 'CMS_SITE_ID',
        vercelProjectUrl
      })
    } catch (error) {
      console.error('Error loading diagnostics:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    loadDiagnostics()
  }, [])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await loadDiagnostics()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span>Loading diagnostics...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!diagnostics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Site Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Failed to load site configuration diagnostics.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    )
  }

  const isConfigured = diagnostics.hasEnvSiteId && diagnostics.currentSiteId && diagnostics.siteExists
  const needsEnvVar = diagnostics.currentSiteId && !diagnostics.hasEnvSiteId

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Site Configuration
          {isConfigured ? (
            <Badge variant="default" className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Configured
            </Badge>
          ) : (
            <Badge variant="destructive">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Needs Setup
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Diagnostic information for your site configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Current Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Environment Variable</div>
            <div className="text-lg font-semibold mt-1">
              {diagnostics.hasEnvSiteId ? (
                <span className="text-green-600">Set</span>
              ) : (
                <span className="text-red-600">Missing</span>
              )}
            </div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Site ID</div>
            <div className="text-lg font-semibold mt-1">
              {diagnostics.currentSiteId ? (
                <span className="text-green-600">Found</span>
              ) : (
                <span className="text-red-600">None</span>
              )}
            </div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-sm font-medium text-muted-foreground">Database</div>
            <div className="text-lg font-semibold mt-1">
              {diagnostics.siteExists ? (
                <span className="text-green-600">Connected</span>
              ) : (
                <span className="text-red-600">Not Found</span>
              )}
            </div>
          </div>
        </div>

        {/* Site Details */}
        {diagnostics.currentSiteId && (
          <div className="space-y-2">
            <div className="text-sm font-medium">Current Site ID:</div>
            <div className="flex items-center gap-2">
              <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                {diagnostics.currentSiteId}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(diagnostics.currentSiteId!)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            {diagnostics.siteName && (
              <div className="text-sm text-muted-foreground">
                Site Name: {diagnostics.siteName}
              </div>
            )}
          </div>
        )}

        {/* Setup Instructions */}
        {needsEnvVar && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-3">
                <div>
                  <strong>Action Required:</strong> Set both environment variables in Vercel to fix site persistence issues.
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-medium">Environment Variables (Both Required):</div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                        CMS_SITE_ID={diagnostics.currentSiteId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`CMS_SITE_ID=${diagnostics.currentSiteId}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex items-center gap-2">
                      <code className="bg-muted px-2 py-1 rounded text-sm flex-1">
                        NEXT_PUBLIC_CMS_SITE_ID={diagnostics.currentSiteId}
                      </code>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(`NEXT_PUBLIC_CMS_SITE_ID=${diagnostics.currentSiteId}`)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Steps:</div>
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Go to your Vercel Dashboard</li>
                    <li>Select your project</li>
                    <li>Go to Settings → Environment Variables</li>
                    <li>Add both environment variables above</li>
                    <li>Redeploy your project</li>
                  </ol>
                </div>

                {diagnostics.vercelProjectUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={diagnostics.vercelProjectUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open Vercel Dashboard
                    </a>
                  </Button>
                )}
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Success Message */}
        {isConfigured && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your site is properly configured! Navigation and page data should persist correctly across deployments.
            </AlertDescription>
          </Alert>
        )}

        {/* Refresh Button */}
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 