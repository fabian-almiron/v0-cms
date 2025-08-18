import { loadNavigationFromDatabase, loadPagesFromDatabase, loadTemplatesFromDatabase } from './cms-data'

// Load data from cached API routes (Vercel-compatible)
export async function loadStaticNavigation() {
  try {
    console.log('🔍 Loading navigation from cached API...')
    const response = await fetch('/api/navigation', {
      // Add cache headers for better performance
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    })
    
    if (!response.ok) {
      console.warn('❌ Navigation API failed, status:', response.status)
      throw new Error('Navigation API failed')
    }
    
    const data = await response.json()
    console.log('✅ Navigation loaded from cached API:', data?.length || 0, 'items')
    return data
  } catch (error) {
    console.warn('Failed to load navigation from API, falling back to database:', error.message)
    const dbData = await loadNavigationFromDatabase()
    console.log('🔍 Database fallback loaded:', dbData?.length || 0, 'items')
    return dbData
  }
}

export async function loadStaticPages() {
  try {
    const response = await fetch('/generated/pages.json')
    if (!response.ok) throw new Error('Pages file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static pages, falling back to database')
    return await loadPagesFromDatabase()
  }
}

export async function loadStaticTemplates() {
  try {
    const response = await fetch('/generated/templates.json')
    if (!response.ok) throw new Error('Templates file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static templates, falling back to database')
    return await loadTemplatesFromDatabase()
  }
}

export async function loadStaticSettings() {
  try {
    const response = await fetch('/generated/settings.json')
    if (!response.ok) throw new Error('Settings file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static settings, falling back to database')
    return {}
  }
} 