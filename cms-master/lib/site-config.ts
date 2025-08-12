'use client'

import { supabase } from './supabase'

// Site configuration for multi-tenant setup
export interface SiteConfig {
  id: string
  name: string
  domain: string
  isActive: boolean
}

// Get or create site configuration
export async function getCurrentSite(): Promise<SiteConfig | null> {
  if (typeof window === 'undefined') return null

  try {
    // Check if site is already configured in localStorage
    const storedSiteId = localStorage.getItem('cms_site_id')
    
    if (storedSiteId) {
      // Verify site exists in database
      const { data: site, error } = await supabase
        .from('sites')
        .select('id, name, domain, status')
        .eq('id', storedSiteId)
        .single()

      if (!error && site) {
        return {
          id: site.id,
          name: site.name,
          domain: site.domain,
          isActive: site.status === 'active'
        }
      } else {
        // Site doesn't exist, clear invalid ID
        localStorage.removeItem('cms_site_id')
      }
    }

    // No valid site found, return null (will trigger site setup)
    return null
  } catch (error) {
    console.error('Error getting current site:', error)
    return null
  }
}

// Create a new site
export async function createSite(siteData: {
  name: string
  domain: string
  owner_email: string
}): Promise<SiteConfig | null> {
  try {
    const { data: site, error } = await supabase
      .from('sites')
      .insert([{
        name: siteData.name,
        domain: siteData.domain,
        owner_email: siteData.owner_email,
        status: 'active',
        plan: 'free'
      }])
      .select()
      .single()

    if (error) throw error

    // Store site ID in localStorage
    localStorage.setItem('cms_site_id', site.id)

    // Show environment variable setup instructions
    console.log('')
    console.log('🎉 Site created successfully!')
    console.log('🚨 IMPORTANT: To make this site persistent across deployments,')
    console.log('   set these environment variables in Vercel:')
    console.log('')
    console.log(`   CMS_SITE_ID=${site.id}`)
    console.log(`   NEXT_PUBLIC_CMS_SITE_ID=${site.id}`)
    console.log('')
    console.log('   Steps:')
    console.log('   1. Go to Vercel Dashboard → Project Settings → Environment Variables')
    console.log('   2. Add both variables above')
    console.log('   3. Redeploy your project')
    console.log('')

    // Create starter templates for the new site
    try {
      console.log('Creating starter templates for new site...')
      const { createStarterTemplatesInDatabase } = await import('./cms-data')
      const templatesCreated = await createStarterTemplatesInDatabase()
      
      if (templatesCreated) {
        console.log('✅ Starter templates created successfully for new site')
      } else {
        console.warn('⚠️ Failed to create starter templates for new site')
      }
    } catch (templateError) {
      console.error('Error creating starter templates for new site:', templateError)
      // Don't fail site creation if template creation fails
    }

    return {
      id: site.id,
      name: site.name,
      domain: site.domain,
      isActive: site.status === 'active'
    }
  } catch (error) {
    console.error('Error creating site:', error)
    return null
  }
}

// Set current site
export function setCurrentSite(siteId: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cms_site_id', siteId)
  }
}

// Get current site ID (synchronous)
export function getCurrentSiteId(): string | null {
  // Server-side: check environment variables
  if (typeof window === 'undefined') {
    return process.env.CMS_SITE_ID || process.env.DEFAULT_SITE_ID || null
  }
  
  // Client-side: check environment variables first, then localStorage
  const envSiteId = process.env.NEXT_PUBLIC_CMS_SITE_ID
  if (envSiteId) {
    return envSiteId
  }
  
  return localStorage.getItem('cms_site_id')
} 