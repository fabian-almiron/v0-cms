import { NextRequest, NextResponse } from 'next/server'
import { loadNavigationFromDatabase } from '@/lib/cms-data-server'

// Cache for 5 minutes, stale-while-revalidate for 10 minutes
const CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
  'Content-Type': 'application/json'
}

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Loading navigation from database...')
    
    // Load navigation from database
    const navigation = await loadNavigationFromDatabase()
    
    console.log(`✅ API: Loaded ${navigation?.length || 0} navigation items`)
    
    // Return with aggressive caching headers
    return NextResponse.json(navigation || [], {
      headers: CACHE_HEADERS
    })
    
  } catch (error) {
    console.error('❌ Navigation API error:', error)
    
    // Return empty array with shorter cache on error
    return NextResponse.json([], {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
        'Content-Type': 'application/json'
      }
    })
  }
}

// Optional: Support POST to force cache refresh
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 API: Force refreshing navigation cache...')
    
    const navigation = await loadNavigationFromDatabase()
    
    // Return fresh data with no-cache headers
    return NextResponse.json(navigation || [], {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })
    
  } catch (error) {
    console.error('❌ Navigation refresh API error:', error)
    return NextResponse.json({ error: 'Failed to refresh navigation' }, { status: 500 })
  }
}
