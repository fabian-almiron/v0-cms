import { useState, useEffect } from 'react'
import { loadNavigationFromDatabase, clearNavigationCache } from '@/lib/cms-data'
import { loadStaticNavigation } from '@/lib/static-data-loader'
import { getCurrentSiteId } from '@/lib/site-config'

export interface NavigationItem {
  id: string
  label: string
  type: 'internal' | 'external'
  href?: string
  pageId?: string
  order: number
  isVisible: boolean
}

interface UseNavigationReturn {
  navigation: NavigationItem[]
  isLoading: boolean
  isError: boolean
  refresh: () => Promise<void>
  clearCache: () => void
}

export function useNavigation(): UseNavigationReturn {
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isError, setIsError] = useState(false)

  const loadNavigation = async (showLoading = true) => {
    if (showLoading) setIsLoading(true)
    setIsError(false)

    try {
      // Try static files first (faster), fallback to database
      console.log('🔍 Loading navigation from static files...')
      const data = await loadStaticNavigation()
      console.log(`🔍 Loaded ${data?.length || 0} navigation items from static files`)
      setNavigation(data)
    } catch (error) {
      console.error('Error loading navigation:', error)
      setIsError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const refresh = async () => {
    const siteId = getCurrentSiteId()
    if (siteId) {
      clearNavigationCache(siteId)
    }
    await loadNavigation(false) // Don't show loading state on refresh
  }

  const clearCache = () => {
    const siteId = getCurrentSiteId()
    if (siteId) {
      clearNavigationCache(siteId)
    }
  }

  useEffect(() => {
    loadNavigation()
  }, [])

  return {
    navigation,
    isLoading,
    isError,
    refresh,
    clearCache
  }
} 