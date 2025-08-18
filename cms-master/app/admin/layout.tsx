'use client'

import { useState, useEffect } from 'react'
import AdminSidebar from '@/components/cms/AdminSidebar'
import SiteSetup from '@/components/cms/SiteSetup'
import { ThemeProvider } from '@/lib/theme-context'
import { getCurrentSite, SiteConfig } from '@/lib/site-config'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSiteConfig = async () => {
      try {
        const site = await getCurrentSite()
        setSiteConfig(site)
      } catch (error) {
        console.error('Error checking site config:', error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSiteConfig()
  }, [])

  const handleSiteConfigured = (site: SiteConfig) => {
    setSiteConfig(site)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!siteConfig) {
    return <SiteSetup onSiteConfigured={handleSiteConfigured} />
  }

  return (
    <ThemeProvider defaultTheme="default">
      <div className="h-screen overflow-hidden flex">
        <AdminSidebar />
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      </div>
    </ThemeProvider>
  )
} 