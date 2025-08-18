'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Database, CheckCircle, XCircle, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react'
import { testConnection, adminTestConnection, adminGetAllSites, adminGetSiteStatistics } from '@/lib/supabase'

interface DatabaseInfo {
  connected: boolean
  hasServiceRole: boolean
  projectUrl: string
  totalSites?: number
  totalPages?: number
  totalTemplates?: number
  error?: string
}

interface SiteStats {
  id: string
  name: string
  domain: string
  status: string
  total_pages: number
  published_pages: number
  total_templates: number
  navigation_items: number
}

export default function DatabaseSettings() {
  const [dbInfo, setDbInfo] = useState<DatabaseInfo>({
    connected: false,
    hasServiceRole: false,
    projectUrl: ''
  })
  const [siteStats, setSiteStats] = useState<SiteStats[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)
  const [showEnvVars, setShowEnvVars] = useState(false)

  // Check connection on component mount
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setIsLoading(true)
    console.log('🔧 Testing database connection...')
    
    try {
      // Test regular connection
      console.log('📡 Testing regular connection...')
      const regularTest = await testConnection()
      console.log('📡 Regular test result:', regularTest)
      
      // Test admin connection
      console.log('🔐 Testing admin connection...')
      const adminTest = await adminTestConnection()
      console.log('🔐 Admin test result:', adminTest)
      
      // Get site statistics if admin connection works
      let sites: SiteStats[] = []
      let totalSites = 0
      let totalPages = 0
      let totalTemplates = 0
      
      if (adminTest.success) {
        try {
          const stats = await adminGetSiteStatistics()
          sites = stats || []
          totalSites = sites.length
          totalPages = sites.reduce((sum, site) => sum + (site.total_pages || 0), 0)
          totalTemplates = sites.reduce((sum, site) => sum + (site.total_templates || 0), 0)
        } catch (error) {
          console.error('Error fetching site stats:', error)
        }
      }

      setDbInfo({
        connected: regularTest.success,
        hasServiceRole: adminTest.success,
        projectUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        totalSites,
        totalPages,
        totalTemplates,
        error: !regularTest.success ? regularTest.message : undefined
      })
      
      setSiteStats(sites)
      
      // Connection test completed successfully
      console.log('✅ Connection test completed successfully')
      
    } catch (error) {
      console.error('❌ Connection test failed:', error)
      const errorMessage = (error as Error).message
      setDbInfo({
        connected: false,
        hasServiceRole: false,
        projectUrl: '',
        error: errorMessage
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getProjectId = () => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    try {
      const urlObj = new URL(url)
      return urlObj.hostname.split('.')[0]
    } catch {
      return 'Invalid URL'
    }
  }

  const getConnectionStatusColor = () => {
    if (isLoading) return 'bg-yellow-500'
    if (dbInfo.connected && dbInfo.hasServiceRole) return 'bg-green-500'
    if (dbInfo.connected) return 'bg-blue-500'
    return 'bg-red-500'
  }

  const getConnectionStatusText = () => {
    if (isLoading) return 'Testing connection...'
    if (dbInfo.connected && dbInfo.hasServiceRole) return 'Full admin access'
    if (dbInfo.connected) return 'Basic connection only'
    return 'Connection failed'
  }

  return (
    <div className="space-y-6">
      {/* Main Database Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Connection
          </CardTitle>
          <CardDescription>
            Supabase multi-tenant database status and management
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Connection Status */}
          <div className="space-y-2">
            <Label>Connection Status</Label>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
              <span className="text-sm">{getConnectionStatusText()}</span>
              {dbInfo.hasServiceRole && (
                <Badge variant="secondary" className="ml-2">Admin</Badge>
              )}
            </div>
          </div>

          {/* Project Info */}
          <div className="space-y-2">
            <Label>Project ID</Label>
            <Input value={getProjectId()} disabled />
          </div>

          {/* Multi-tenant Statistics */}
          {dbInfo.hasServiceRole && (
            <div className="space-y-2">
              <Label>Multi-Tenant Statistics</Label>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold text-lg">{dbInfo.totalSites || 0}</div>
                  <div className="text-muted-foreground">Sites</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold text-lg">{dbInfo.totalPages || 0}</div>
                  <div className="text-muted-foreground">Pages</div>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <div className="font-semibold text-lg">{dbInfo.totalTemplates || 0}</div>
                  <div className="text-muted-foreground">Templates</div>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {dbInfo.error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{dbInfo.error}</AlertDescription>
            </Alert>
          )}

          {/* Test Connection Button */}
          <Button 
            variant="outline" 
            className="w-full" 
            onClick={checkConnection}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testing...
              </>
            ) : (
              'Test Connection'
            )}
          </Button>

          {/* Show Details Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="w-full"
          >
            {showDetails ? (
              <>
                <EyeOff className="mr-2 h-4 w-4" />
                Hide Details
              </>
            ) : (
              <>
                <Eye className="mr-2 h-4 w-4" />
                Show Details
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Detailed Information (Admin Only) */}
      {showDetails && dbInfo.hasServiceRole && (
        <>
          {/* Site Statistics Table */}
          <Card>
            <CardHeader>
              <CardTitle>Site Statistics</CardTitle>
              <CardDescription>
                Overview of all sites in the multi-tenant database
              </CardDescription>
            </CardHeader>
            <CardContent>
              {siteStats.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2">Site Name</th>
                        <th className="text-left py-2">Domain</th>
                        <th className="text-left py-2">Status</th>
                        <th className="text-right py-2">Pages</th>
                        <th className="text-right py-2">Templates</th>
                        <th className="text-right py-2">Navigation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {siteStats.map((site) => (
                        <tr key={site.id} className="border-b">
                          <td className="py-2 font-medium">{site.name}</td>
                          <td className="py-2 text-muted-foreground">{site.domain}</td>
                          <td className="py-2">
                            <Badge 
                              variant={site.status === 'active' ? 'default' : 'secondary'}
                            >
                              {site.status}
                            </Badge>
                          </td>
                          <td className="py-2 text-right">
                            {site.published_pages}/{site.total_pages}
                          </td>
                          <td className="py-2 text-right">{site.total_templates}</td>
                          <td className="py-2 text-right">{site.navigation_items}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No sites found in database
                </div>
              )}
            </CardContent>
          </Card>

          {/* Environment Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>
                Current database configuration and keys
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Supabase URL</Label>
                <Input 
                  value={process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'} 
                  disabled 
                />
              </div>
              
              <div className="space-y-2">
                <Label>Anonymous Key Status</Label>
                <div className="flex items-center gap-2">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Configured</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Missing</span>
                    </>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Service Role Key Status</Label>
                <div className="flex items-center gap-2">
                  {dbInfo.hasServiceRole ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Configured & Working</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Missing or Invalid</span>
                    </>
                  )}
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEnvVars(!showEnvVars)}
                className="w-full"
              >
                {showEnvVars ? 'Hide' : 'Show'} Required Environment Variables
              </Button>

              {showEnvVars && (
                <div className="mt-4 p-4 bg-muted rounded-lg">
                  <pre className="text-xs whitespace-pre-wrap">
{`# Required in .env.local
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key`}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Limited Access Warning */}
      {showDetails && !dbInfo.hasServiceRole && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Service role key not configured. Some admin features are unavailable. 
            Add SUPABASE_SERVICE_ROLE_KEY to your environment variables for full access.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
} 