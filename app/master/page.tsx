'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Plus, Globe, Server, Activity, Users, ExternalLink, Settings, Layers, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { 
  getCMSInstances, 
  getDashboardStats, 
  deleteCMSInstance,
  isMasterSupabaseConfigured,
  type CMSInstance 
} from '@/lib/master-supabase'

interface DashboardStats {
  totalInstances: number
  activeInstances: number
  totalDeployments: number
  successfulDeployments: number
  availableTemplates: number
}

export default function MasterDashboard() {
  const [instances, setInstances] = useState<CMSInstance[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalInstances: 0,
    activeInstances: 0,
    totalDeployments: 0,
    successfulDeployments: 0,
    availableTemplates: 0
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Check if master Supabase is configured
      if (!isMasterSupabaseConfigured()) {
        setError('Master dashboard not configured')
        return
      }
      
      const [instancesData, statsData] = await Promise.all([
        getCMSInstances(10), // Get latest 10 instances
        getDashboardStats()
      ])
      
      setInstances(instancesData)
      setStats(statsData)
    } catch (error) {
      console.error('Error loading dashboard data:', error)
      setError('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: CMSInstance['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'creating': return 'bg-yellow-500'
      case 'inactive': return 'bg-gray-500'
      case 'failed': return 'bg-red-500'
      case 'deleting': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: CMSInstance['status']) => {
    switch (status) {
      case 'active': return 'Active'
      case 'creating': return 'Creating'
      case 'inactive': return 'Inactive'
      case 'failed': return 'Failed'
      case 'deleting': return 'Deleting'
      default: return 'Unknown'
    }
  }

  const handleDelete = async (instance: CMSInstance) => {
    // Confirm deletion
    const confirmed = window.confirm(
      `Are you sure you want to COMPLETELY DELETE "${instance.name}"?\n\nThis will:\n• Delete the Bitbucket repository\n• Delete the Vercel project\n• Remove the CMS instance record\n• Delete ALL associated data\n\nThis action cannot be undone!`
    )
    
    if (!confirmed) return

    try {
      setDeletingId(instance.id)
      
      // Call the full deletion API
      const response = await fetch('/api/master/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instanceId: instance.id
        })
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Deletion failed')
      }

      // Show deletion results
      const { results, message } = result
      let alertMessage = `${message}\n\n`
      
      if (results.database) alertMessage += '✅ Database record deleted\n'
      if (results.bitbucketRepo) alertMessage += '✅ Bitbucket repository deleted\n'
      if (results.vercelProject) alertMessage += '✅ Vercel project deleted\n'
      
      if (results.errors && results.errors.length > 0) {
        alertMessage += '\n⚠️ Some errors occurred:\n' + results.errors.join('\n')
      }

      alert(alertMessage)
      
      // Remove from local state
      setInstances(prev => prev.filter(i => i.id !== instance.id))
      
      // Refresh stats
      loadDashboardData()
      
    } catch (error) {
      console.error('Failed to delete instance:', error)
      alert(`Failed to delete instance: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
            <div className="absolute inset-0 rounded-full h-12 w-12 bg-blue-400/20 blur-md animate-pulse mx-auto"></div>
          </div>
          <p className="text-gray-300">Loading master dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    // Show setup screen if master dashboard is not configured
    if (error === 'Master dashboard not configured') {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
          <Card className="max-w-2xl w-full bg-gray-900/50 backdrop-blur-xl border-gray-800/50">
            <CardHeader className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-full mb-4 relative">
                <Settings className="h-8 w-8 text-blue-400" />
                <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-md"></div>
              </div>
              <CardTitle className="text-2xl text-white">Master Dashboard Setup Required</CardTitle>
              <CardDescription className="text-lg text-gray-300">
                Configure your Master Dashboard database to get started
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 backdrop-blur-sm">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-300">Environment Variables Missing</h3>
                    <p className="mt-1 text-sm text-amber-400/80">
                      The master dashboard requires its own Supabase database to manage CMS instances.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-200">Required Environment Variables:</h4>
                <div className="space-y-2 text-sm font-mono bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
                  <div className="text-green-400">NEXT_PUBLIC_MASTER_SUPABASE_URL=https://your-master-project.supabase.co</div>
                  <div className="text-blue-400">NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=your-anon-key</div>
                  <div className="text-purple-400">MASTER_SUPABASE_SERVICE_ROLE_KEY=your-service-key</div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-200">Setup Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                  <li>Create a new Supabase project for the Master Dashboard</li>
                  <li>Run the <code className="bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50 text-blue-400">master-dashboard-schema.sql</code> file in your new project</li>
                  <li>Copy your project URL and API keys to your <code className="bg-gray-800/50 px-2 py-1 rounded border border-gray-700/50 text-blue-400">.env.local</code> file</li>
                  <li>Restart your development server</li>
                </ol>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={loadDashboardData} 
                  className="flex-1 bg-gray-800 hover:bg-gray-700 border-gray-700 text-white"
                  variant="outline"
                >
                  Check Again
                </Button>
                <Button asChild className="flex-1 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0">
                  <Link href="/SETUP-GUIDE.md" target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Setup Guide
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }
    
    // Show generic error for other issues
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <Card className="max-w-md w-full bg-gray-900/50 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-red-400">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-300 mb-4">{error}</p>
            <Button onClick={loadDashboardData} className="w-full bg-blue-500 hover:bg-blue-600 text-white">
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-gray-900/50 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Master Dashboard
              </h1>
              <p className="text-gray-400">Manage all your CMS instances from one place</p>
            </div>
            <div className="flex space-x-3">
              <Link href="/master/create">
                <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 shadow-lg shadow-blue-500/25">
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Website
                </Button>
              </Link>
              <Link href="/master/settings">
                <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
                  <Globe className="h-6 w-6 text-blue-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Total Websites</p>
                  <p className="text-2xl font-bold text-white">{stats.totalInstances}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-green-500/20 rounded-xl border border-green-500/30">
                  <Activity className="h-6 w-6 text-green-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Active Sites</p>
                  <p className="text-2xl font-bold text-white">{stats.activeInstances}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-purple-500/20 rounded-xl border border-purple-500/30">
                  <Server className="h-6 w-6 text-purple-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Deployments</p>
                  <p className="text-2xl font-bold text-white">{stats.totalDeployments}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-orange-500/20 rounded-xl border border-orange-500/30">
                  <Users className="h-6 w-6 text-orange-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Success Rate</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalDeployments > 0 
                      ? Math.round((stats.successfulDeployments / stats.totalDeployments) * 100) 
                      : '--'}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 group">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
                  <Layers className="h-6 w-6 text-indigo-400" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-wide">Templates</p>
                  <p className="text-2xl font-bold text-white">{stats.availableTemplates}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CMS Instances */}
        <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50">
          <CardHeader>
            <CardTitle className="text-white">Recent CMS Instances</CardTitle>
            <CardDescription className="text-gray-400">
              Latest websites created and their current status
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instances.length === 0 ? (
              <div className="text-center py-16">
                <div className="mx-auto flex items-center justify-center w-16 h-16 bg-gray-800/50 rounded-full mb-6 relative">
                  <Globe className="h-8 w-8 text-gray-400" />
                  <div className="absolute inset-0 bg-gray-400/10 rounded-full blur-md"></div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">No websites yet</h3>
                <p className="text-gray-400 mb-8 max-w-sm mx-auto">
                  Create your first website to get started with the master dashboard. Deploy a complete CMS in minutes!
                </p>
                <Link href="/master/create">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 text-lg px-6 py-3 shadow-lg shadow-blue-500/25">
                    <Plus className="h-5 w-5 mr-2" />
                    Create Your First Website
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {instances.map((instance) => (
                  <div
                    key={instance.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 border border-gray-700/50 rounded-xl hover:bg-gray-800/50 transition-all duration-200 backdrop-blur-sm"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(instance.status)} shadow-lg`}></div>
                      <div>
                        <h3 className="font-medium text-white">{instance.name}</h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span>{instance.owner_email}</span>
                          {instance.domain && (
                            <span className="flex items-center">
                              <Globe className="h-3 w-3 mr-1" />
                              {instance.domain}
                            </span>
                          )}
                          <span>Template: {instance.template_id}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Badge className="bg-gray-700/50 text-gray-300 border-gray-600 hover:bg-gray-700">
                        {getStatusText(instance.status)}
                      </Badge>
                      
                      {instance.vercel_deployment_url && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(instance.vercel_deployment_url, '_blank')}
                          className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Visit
                        </Button>
                      )}
                      
                      <Link href={`/master/instances/${instance.id}`}>
                        <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                          Manage
                        </Button>
                      </Link>

                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDelete(instance)}
                        disabled={deletingId === instance.id}
                        className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:border-red-400"
                      >
                        {deletingId === instance.id ? (
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-red-400 border-t-transparent mr-1" />
                        ) : (
                          <Trash2 className="h-3 w-3 mr-1" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                
                {instances.length >= 10 && (
                  <div className="text-center pt-4">
                    <Link href="/master/instances">
                      <Button variant="outline" className="border-gray-700 text-gray-300 hover:bg-gray-800 hover:text-white">
                        View All Instances
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group">
            <Link href="/master/create">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Plus className="h-12 w-12 text-blue-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 bg-blue-400/20 rounded-full blur-md mx-auto group-hover:bg-blue-400/30 transition-all duration-200"></div>
                </div>
                <h3 className="font-semibold text-white mb-2">Create New Website</h3>
                <p className="text-gray-400 text-sm">Deploy a new CMS instance with one click</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group">
            <Link href="/master/templates">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Globe className="h-12 w-12 text-purple-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 bg-purple-400/20 rounded-full blur-md mx-auto group-hover:bg-purple-400/30 transition-all duration-200"></div>
                </div>
                <h3 className="font-semibold text-white mb-2">Browse Templates</h3>
                <p className="text-gray-400 text-sm">Explore available CMS templates and themes</p>
              </CardContent>
            </Link>
          </Card>

          <Card className="bg-gray-900/40 backdrop-blur-xl border-gray-800/50 hover:bg-gray-800/50 transition-all duration-200 cursor-pointer group">
            <Link href="/master/analytics">
              <CardContent className="p-6 text-center">
                <div className="relative mb-4">
                  <Activity className="h-12 w-12 text-green-400 mx-auto" />
                  <div className="absolute inset-0 h-12 w-12 bg-green-400/20 rounded-full blur-md mx-auto group-hover:bg-green-400/30 transition-all duration-200"></div>
                </div>
                <h3 className="font-semibold text-white mb-2">View Analytics</h3>
                <p className="text-gray-400 text-sm">Monitor performance across all instances</p>
              </CardContent>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  )
} 