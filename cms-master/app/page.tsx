'use client'

import { useEffect, useState } from 'react'
import { PageBlock } from '@/lib/cms-types'
import PageRenderer from '@/components/cms/PageRenderer'
import { useThemeComponents, useCurrentTheme } from '@/lib/theme-context'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Homepage component that checks for CMS pages
function Homepage() {
  const { componentInfo, renderComponent } = useThemeComponents()
  const currentTheme = useCurrentTheme()
  const [pages, setPages] = useState<any[]>([])
  const [homePage, setHomePage] = useState<any>(null)

  useEffect(() => {
    // Load pages from database
    const loadPages = async () => {
      try {
        const { loadPagesFromDatabase } = await import('@/lib/cms-data')
        const loadedPages = await loadPagesFromDatabase()
        setPages(loadedPages)
        
        // Look for a homepage (slug 'home' or '/')
        const home = loadedPages.find((page: any) => 
          page.slug === 'home' || page.slug === '/' || page.slug === ''
        )
        setHomePage(home)
      } catch (error) {
        console.error('Error loading pages from database:', error)
        setPages([])
      }
    }

    loadPages()
  }, [])

  if (!currentTheme) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Loading Theme...</h1>
          <p className="text-gray-600">Please wait while we load your theme components.</p>
        </div>
      </div>
    )
  }

  // If there's a homepage, render it
  if (homePage) {
    return (
      <PageRenderer 
        blocks={homePage.blocks || []}
        headerTemplateId={homePage.headerTemplateId}
        footerTemplateId={homePage.footerTemplateId}
        pageTemplateId={homePage.pageTemplateId}
      />
    )
  }

  // If no pages exist, show welcome screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header if available */}
      {currentTheme.getComponent('Header') && (
        <header>
          {renderComponent('Header')}
        </header>
      )}
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            Welcome to Your CMS
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            No pages have been created yet. Start building your website!
          </p>
          
          <div className="bg-white rounded-lg p-8 shadow-lg mb-8">
            <h2 className="text-2xl font-semibold mb-4">Current Theme: {currentTheme.name}</h2>
            <p className="text-gray-600 mb-6">{currentTheme.description}</p>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {componentInfo.map(comp => (
                <div key={comp.type} className="p-3 bg-gray-50 rounded-md">
                  <div className="font-medium text-sm">{comp.name}</div>
                  <div className="text-xs text-gray-500 capitalize">{comp.category}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <Link href="/admin/pages/new">
                <Button size="lg" className="mr-4">
                  Create Your First Page
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" size="lg">
                  Go to Admin Panel
                </Button>
              </Link>
            </div>
            <p className="text-sm text-gray-500">
              Create pages using the {currentTheme.name} theme components available above.
            </p>
          </div>
        </div>
      </div>
      
      {/* Footer if available */}
      {currentTheme.getComponent('Footer') && (
        <footer>
          {renderComponent('Footer')}
        </footer>
      )}
    </div>
  )
}

export default function LandingPage() {
  return <Homepage />
}
