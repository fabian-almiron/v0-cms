'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { RefreshCw, FileText, CheckCircle, AlertCircle, Database, Zap } from 'lucide-react'

interface StaticFileStatus {
  navigation: boolean
  pages: boolean
  templates: boolean
  settings: boolean
  lastGenerated?: string
}

export default function StaticFileManager() {
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [status, setStatus] = useState<StaticFileStatus>({
    navigation: false,
    pages: false,
    templates: false,
    settings: false
  })
  const [lastRegenerated, setLastRegenerated] = useState<string | null>(null)

  const checkStaticFiles = async () => {
    try {
      const checks = await Promise.allSettled([
        fetch('/generated/navigation.json'),
        fetch('/generated/pages.json'),
        fetch('/generated/templates.json'),
        fetch('/generated/settings.json')
      ])

      setStatus({
        navigation: checks[0].status === 'fulfilled' && checks[0].value.ok,
        pages: checks[1].status === 'fulfilled' && checks[1].value.ok,
        templates: checks[2].status === 'fulfilled' && checks[2].value.ok,
        settings: checks[3].status === 'fulfilled' && checks[3].value.ok
      })
    } catch (error) {
      console.error('Error checking static files:', error)
    }
  }

  const regenerateStaticFiles = async () => {
    setIsRegenerating(true)
    
    try {
      const response = await fetch('/api/generate-static', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()
      
      if (result.success) {
        setLastRegenerated(new Date().toLocaleString())
        await checkStaticFiles()
      } else {
        // Handle specific error cases
        if (result.needsSiteSetup) {
          alert('Site setup required. Please complete your site configuration first.\n\nGo to the Admin Dashboard and set up your site.')
        } else if (response.status === 422) {
          alert(`Setup needed: ${result.message}`)
        } else {
          // For new deployments, partial failures are normal
          if (result.message?.includes('new installation')) {
            setLastRegenerated(new Date().toLocaleString())
            await checkStaticFiles()
            console.log('ℹ️ Partial generation success (normal for new deployments):', result.message)
          } else {
        alert(`Failed to regenerate static files: ${result.message}`)
          }
        }
      }
    } catch (error) {
      console.error('Error regenerating static files:', error)
      alert('Error regenerating static files. Please try again.\n\nIf this is a new deployment, try completing the site setup first.')
    } finally {
      setIsRegenerating(false)
    }
  }

  // Check file status on component mount
  useState(() => {
    checkStaticFiles()
  })

  const allFilesExist = Object.values(status).every(Boolean)
  const filesCount = Object.values(status).filter(Boolean).length

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Static File Cache
        </CardTitle>
        <CardDescription>
          Manage static JSON files for ultra-fast loading and reduced database costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Overview */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-2">
            {allFilesExist ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-orange-500" />
            )}
            <span className="font-medium">
              Static Files Status: {filesCount}/4 Generated
            </span>
          </div>
          <Badge variant={allFilesExist ? 'default' : 'secondary'}>
            {allFilesExist ? 'All Ready' : 'Incomplete'}
          </Badge>
        </div>

        {/* Individual File Status */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Navigation</span>
            </div>
            <Badge variant={status.navigation ? 'default' : 'outline'}>
              {status.navigation ? '✓' : '✗'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Pages</span>
            </div>
            <Badge variant={status.pages ? 'default' : 'outline'}>
              {status.pages ? '✓' : '✗'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Templates</span>
            </div>
            <Badge variant={status.templates ? 'default' : 'outline'}>
              {status.templates ? '✓' : '✗'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm">Settings</span>
            </div>
            <Badge variant={status.settings ? 'default' : 'outline'}>
              {status.settings ? '✓' : '✗'}
            </Badge>
          </div>
        </div>

        {/* Benefits Info */}
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            <strong>Cost Optimization:</strong> Static files load instantly and reduce database read operations by ~90%, 
            significantly lowering your Supabase costs while improving performance.
          </AlertDescription>
        </Alert>

        {/* Last Regenerated */}
        {lastRegenerated && (
          <div className="text-sm text-muted-foreground">
            Last regenerated: {lastRegenerated}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={regenerateStaticFiles}
            disabled={isRegenerating}
            className="flex-1"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            {isRegenerating ? 'Regenerating...' : 'Regenerate All Files'}
          </Button>
          
          <Button 
            onClick={checkStaticFiles}
            variant="outline"
          >
            Check Status
          </Button>
        </div>

        {/* How it works */}
        <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
          <p><strong>How it works:</strong></p>
          <p>• Admin updates content → Database saves changes</p>
          <p>• Static files auto-regenerate in background</p>
          <p>• Frontend reads from fast JSON files, not database</p>
          <p>• Massive performance boost + lower costs</p>
        </div>
      </CardContent>
    </Card>
  )
} 