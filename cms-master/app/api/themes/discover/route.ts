import { NextResponse } from 'next/server'
import { discoverThemes } from '@/lib/theme-registry-server'

export async function GET() {
  try {
    const themes = discoverThemes()
    
    return NextResponse.json({
      success: true,
      themes,
      count: themes.length
    })
    
  } catch (error) {
    console.error('Error in theme discovery API:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to discover themes',
      themes: ['default', 'modern'] // Safe fallback
    }, { status: 500 })
  }
} 