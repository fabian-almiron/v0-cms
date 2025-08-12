'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import PageBuilder from '@/components/cms/PageBuilder'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import Link from 'next/link'
import { CMSPage } from '@/lib/cms-data'
import { PageBlock } from '@/lib/cms-types'

function BuilderContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pageId = searchParams.get('page')
  
  const [page, setPage] = useState<CMSPage | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load page data
  useEffect(() => {
    if (!pageId) {
      setError('No page selected. Please select a page to edit.')
      setLoading(false)
      return
    }

    const loadPageData = async () => {
      try {
        console.log('🔄 Loading page data for ID:', pageId)
        const { loadPageFromDatabase } = await import('@/lib/cms-data')
        const pageData = await loadPageFromDatabase(pageId)
        
        if (!pageData) {
          setError('Page not found.')
          return
        }
        
        console.log('✅ Page data loaded:', pageData)
        setPage(pageData)
      } catch (err) {
        console.error('❌ Error loading page:', err)
        setError('Failed to load page data.')
      } finally {
        setLoading(false)
      }
    }

    loadPageData()
  }, [pageId])

  // Save page data
  const handleSave = async (blocks: PageBlock[], headerTemplateId?: string, footerTemplateId?: string, pageTemplateId?: string) => {
    if (!page || !pageId) {
      alert('No page to save')
      return
    }

    setSaving(true)
    
    try {
      console.log('💾 Saving page blocks:', blocks)
      
      const { updatePageInDatabase } = await import('@/lib/cms-data')
      const updatedPage = await updatePageInDatabase(pageId, {
        blocks,
        headerTemplateId,
        footerTemplateId,
        pageTemplateId
      })

      if (updatedPage) {
        console.log('✅ Page saved successfully')
        setPage(updatedPage)
        
        // Show success message
        alert('Page saved successfully!')
        
        // Trigger static file regeneration
        try {
          const response = await fetch('/api/generate-static', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
          })
          
          if (response.ok) {
            console.log('✅ Static files regenerated')
          } else {
            console.warn('⚠️ Static file regeneration failed, but page was saved')
          }
        } catch (staticError) {
          console.warn('⚠️ Static file regeneration error (page still saved):', staticError)
        }
      } else {
        throw new Error('Failed to save page')
      }
    } catch (err) {
      console.error('❌ Error saving page:', err)
      alert('Failed to save page. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error || 'Page not found'}</AlertDescription>
            </Alert>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" asChild className="flex-1">
                <Link href="/admin/pages">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Pages
                </Link>
              </Button>
              
              {pageId && (
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Try Again
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PageBuilder
      key={page.id}
      pageName={page.title}
      initialBlocks={page.blocks || []}
      initialHeaderTemplateId={page.headerTemplateId}
      initialFooterTemplateId={page.footerTemplateId}
      initialPageTemplateId={page.pageTemplateId}
      onSave={handleSave}
      showTemplateSelector={true}
    />
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading page builder...</p>
        </div>
      </div>
    }>
      <BuilderContent />
    </Suspense>
  )
} 