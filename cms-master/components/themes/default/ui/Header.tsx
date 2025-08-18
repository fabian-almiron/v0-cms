'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { useNavigation } from '@/hooks/use-navigation'
import { loadPagesFromDatabase } from '@/lib/cms-data'
import { ComponentInfo } from '@/lib/cms-types'

// Component metadata - exported for automatic registration
export const metadata: ComponentInfo = {
  type: 'Header',
  name: 'Header',
  description: 'Site navigation and branding header',
  category: 'layout',
  icon: 'Grip',
}

interface NavigationItem {
  id: string
  label: string
  type: 'internal' | 'external'
  href?: string
  pageId?: string
  order: number
  isVisible: boolean
}

// Loading skeleton component
function NavigationSkeleton() {
  return (
    <>
      <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-14 animate-pulse"></div>
      <div className="h-4 bg-muted rounded w-10 animate-pulse"></div>
    </>
  )
}

export default function Header() {
  const { navigation, isLoading } = useNavigation()
  const [pages, setPages] = useState<any[]>([])

  useEffect(() => {
    const loadData = async () => {
      try {
        const loadedPages = await loadPagesFromDatabase()
        setPages(loadedPages)
      } catch (error) {
        console.error('Error loading pages:', error)
      }
    }

    loadData()
  }, [])

  const getNavigationHref = (item: NavigationItem): string => {
    if (item.type === 'external') {
      return item.href || '#'
    }
    
    if (item.type === 'internal' && item.pageId) {
      const page = pages.find(p => p.id === item.pageId)
      return page ? `/${page.slug}` : '#'
    }
    
    return item.href || '#'
  }

  // Filter visible navigation items
  const visibleNavigation = navigation.filter(item => item.isVisible)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-5 mx-auto flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Zap className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">StreamLineee</span>
        </Link>
        
        <nav className="hidden md:flex gap-6">
          {isLoading ? (
            <NavigationSkeleton />
          ) : (
            visibleNavigation.map((item) => (
              <Link 
                key={item.id}
                href={getNavigationHref(item)} 
                className="text-sm font-medium hover:text-primary"
              >
                {item.label}
              </Link>
            ))
          )}
        </nav>
        
        <div className="flex items-center gap-4">
          <Link href="/admin" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
            Admin
          </Link>
        </div>
      </div>
    </header>
  )
} 