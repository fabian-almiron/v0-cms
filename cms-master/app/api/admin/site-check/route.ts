import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const siteId = searchParams.get('siteId')

    if (!siteId) {
      return NextResponse.json({ 
        error: 'Site ID is required' 
      }, { status: 400 })
    }

    // Check if site exists in database
    const { getSiteById } = await import('@/lib/supabase')
    
    try {
      const site = await getSiteById(siteId)
      
      if (site) {
        return NextResponse.json({
          exists: true,
          name: site.name,
          domain: site.domain,
          status: site.status
        })
      } else {
        return NextResponse.json({
          exists: false
        })
      }
    } catch (error) {
      console.error('Error checking site:', error)
      return NextResponse.json({
        exists: false,
        error: 'Database error'
      })
    }

  } catch (error) {
    console.error('❌ Error in site check API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      exists: false
    }, { status: 500 })
  }
} 