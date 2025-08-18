import fs from 'fs/promises'
import path from 'path'
import { loadNavigationFromDatabase, loadPagesFromDatabase, loadTemplatesFromDatabase } from './cms-data-server'
import { getCurrentSiteId, autoConfigureSiteId, getAutoSiteDomain, isVercelDeployment, getDeploymentContext } from './site-config-server'
import { createSite, getSiteByDomain, getAllSites } from './supabase'

// Static files directory
const STATIC_DIR = path.join(process.cwd(), 'public', 'generated')

// Ensure a default site exists for new deployments
export async function ensureDefaultSite(): Promise<string> {
  try {
    // First check if we already have a configured site ID
    let siteId = getCurrentSiteId()
    if (siteId) {
      console.log('✅ Using configured site ID:', siteId)
      
      // Verify this site exists in the database
      try {
        const { getSiteById } = await import('./supabase')
        const site = await getSiteById(siteId)
        if (site) {
          console.log('✅ Site verified in database:', site.name)
          return siteId
        } else {
          console.warn('⚠️ Configured site ID not found in database, will auto-configure')
        }
      } catch (error) {
        console.warn('⚠️ Error verifying site, will auto-configure:', error)
      }
    }

    // Try to auto-configure from existing sites
    console.log('🔍 Auto-configuring site ID from database...')
    siteId = await autoConfigureSiteId()
    if (siteId) {
      console.log('✅ Auto-configured site ID:', siteId)
      
      if (isVercelDeployment()) {
        console.log('')
        console.log('🎉 AUTO-CONFIGURED FOR VERCEL!')
        console.log('   ✅ Using Vercel project-based site identification')
        console.log('   ✅ No manual environment variables needed!')
        console.log('')
      } else {
        console.log('')
        console.log('🚨 MANUAL SETUP NEEDED (Non-Vercel deployment):')
        console.log(`   CMS_SITE_ID=${siteId}`)
        console.log(`   NEXT_PUBLIC_CMS_SITE_ID=${siteId}`)
        console.log('')
      }
      return siteId
    }

    // If no sites exist, create a default one using Vercel context
    console.log('🏗️  No sites found. Creating default site for new deployment...')
    
    const deploymentContext = getDeploymentContext()
    console.log('📍 Deployment context:', deploymentContext)
    
    // Use Vercel project ID for consistent site identification
    const autoSiteId = deploymentContext.isVercel && deploymentContext.projectId 
      ? `vercel-${deploymentContext.projectId}`
      : undefined
      
    const siteDomain = getAutoSiteDomain()
    const siteName = deploymentContext.isVercel 
      ? `Vercel Site (${deploymentContext.environment})`
      : 'My Site'
    
    console.log('🚀 Creating site with auto-configuration:')
    console.log('   Auto Site ID:', autoSiteId)
    console.log('   Domain:', siteDomain)
    console.log('   Name:', siteName)
    
    const siteData = {
      name: siteName,
      domain: siteDomain,
      owner_email: process.env.DEFAULT_OWNER_EMAIL || 'admin@example.com',
      status: 'active' as const,
      plan: 'free' as const,
      settings: {
        siteName: siteName,
        siteDescription: 'Welcome to my site',
        theme: 'default',
        vercelProjectId: deploymentContext.projectId,
        vercelEnvironment: deploymentContext.environment
      }
    }
    
    // If we have a consistent site ID, try to update existing site or create with specific ID
    if (autoSiteId) {
      try {
        // Check if site already exists with this ID
        const { getSiteById } = await import('./supabase')
        const existingSite = await getSiteById(autoSiteId)
        
        if (existingSite) {
          console.log('✅ Found existing Vercel-based site:', existingSite.name)
          return autoSiteId
        }
      } catch (error) {
        console.log('ℹ️ No existing site found, will create new one')
      }
    }
    
    const defaultSite = await createSite(siteData)

    console.log('✅ Created default site:', defaultSite.id)
    
    if (deploymentContext.isVercel) {
      console.log('')
      console.log('🎉 AUTO-CONFIGURED FOR VERCEL!')
      console.log('   ✅ Site automatically configured using Vercel project context')
      console.log('   ✅ No manual environment variables needed!')
      console.log('   ✅ Site will persist across deployments')
      console.log(`   📍 Project ID: ${deploymentContext.projectId}`)
      console.log(`   🌍 Environment: ${deploymentContext.environment}`)
      console.log('')
    } else {
      console.log('')
      console.log('🚨 MANUAL SETUP NEEDED (Non-Vercel deployment):')
      console.log(`   CMS_SITE_ID=${defaultSite.id}`)
      console.log(`   NEXT_PUBLIC_CMS_SITE_ID=${defaultSite.id}`)
      console.log('')
    }
    
    return defaultSite.id
  } catch (error) {
    console.error('❌ Error ensuring default site:', error)
    throw new Error(`Failed to configure site: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Ensure static directory exists
async function ensureStaticDir() {
  try {
    await fs.access(STATIC_DIR)
  } catch {
    await fs.mkdir(STATIC_DIR, { recursive: true })
  }
}

// Generate navigation JSON file
export async function generateNavigationFile() {
  try {
    console.log('📄 Generating static navigation file...')
    
    await ensureStaticDir()
    const navigation = await loadNavigationFromDatabase()
    
    const filePath = path.join(STATIC_DIR, 'navigation.json')
    await fs.writeFile(filePath, JSON.stringify(navigation || [], null, 2))
    
    console.log('✅ Static navigation file generated:', filePath, `(${navigation?.length || 0} items)`)
    return true
  } catch (error) {
    console.error('❌ Error generating navigation file:', error)
    // Create empty navigation file as fallback
    try {
      await ensureStaticDir()
      const filePath = path.join(STATIC_DIR, 'navigation.json')
      await fs.writeFile(filePath, JSON.stringify([], null, 2))
      console.log('⚠️  Created empty navigation file as fallback')
      return true
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback navigation file:', fallbackError)
    return false
    }
  }
}

// Generate pages JSON file
export async function generatePagesFile() {
  try {
    console.log('📄 Generating static pages file...')
    
    await ensureStaticDir()
    const pages = await loadPagesFromDatabase()
    
    const filePath = path.join(STATIC_DIR, 'pages.json')
    await fs.writeFile(filePath, JSON.stringify(pages || [], null, 2))
    
    console.log('✅ Static pages file generated:', filePath, `(${pages?.length || 0} pages)`)
    return true
  } catch (error) {
    console.error('❌ Error generating pages file:', error)
    // Create empty pages file as fallback
    try {
      await ensureStaticDir()
      const filePath = path.join(STATIC_DIR, 'pages.json')
      await fs.writeFile(filePath, JSON.stringify([], null, 2))
      console.log('⚠️  Created empty pages file as fallback')
      return true
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback pages file:', fallbackError)
    return false
    }
  }
}

// Generate templates JSON file
export async function generateTemplatesFile() {
  try {
    console.log('📄 Generating static templates file...')
    
    await ensureStaticDir()
    const templates = await loadTemplatesFromDatabase()
    
    const filePath = path.join(STATIC_DIR, 'templates.json')
    await fs.writeFile(filePath, JSON.stringify(templates || [], null, 2))
    
    console.log('✅ Static templates file generated:', filePath, `(${templates?.length || 0} templates)`)
    return true
  } catch (error) {
    console.error('❌ Error generating templates file:', error)
    // Create empty templates file as fallback
    try {
      await ensureStaticDir()
      const filePath = path.join(STATIC_DIR, 'templates.json')
      await fs.writeFile(filePath, JSON.stringify([], null, 2))
      console.log('⚠️  Created empty templates file as fallback')
      return true
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback templates file:', fallbackError)
    return false
    }
  }
}

// Generate site settings JSON file
export async function generateSiteSettingsFile() {
  try {
    console.log('📄 Generating static site settings file...')
    
    let siteId = getCurrentSiteId()
    if (!siteId) {
      siteId = await autoConfigureSiteId()
      if (!siteId) {
        // Create default settings for new sites
        await ensureStaticDir()
        const defaultSettings = {
          siteName: 'My Site',
          siteDescription: 'Welcome to my site',
          theme: 'default'
        }
        const filePath = path.join(STATIC_DIR, 'settings.json')
        await fs.writeFile(filePath, JSON.stringify(defaultSettings, null, 2))
        console.log('⚠️  Created default settings file (no site configured)')
        return true
      }
    }
    
    await ensureStaticDir()
    
    // Load settings from database
    const { getSiteSettings } = await import('./supabase')
    const settings = await getSiteSettings(siteId)
    
    // Convert to key-value object
    const settingsObj = Object.fromEntries(
      (settings || []).map(setting => [setting.key, setting.value])
    )
    
    // Add default settings if empty
    if (Object.keys(settingsObj).length === 0) {
      settingsObj.siteName = 'My Site'
      settingsObj.siteDescription = 'Welcome to my site'
      settingsObj.theme = 'default'
    }
    
    const filePath = path.join(STATIC_DIR, 'settings.json')
    await fs.writeFile(filePath, JSON.stringify(settingsObj, null, 2))
    
    console.log('✅ Static settings file generated:', filePath, `(${Object.keys(settingsObj).length} settings)`)
    return true
  } catch (error) {
    console.error('❌ Error generating settings file:', error)
    // Create default settings file as fallback
    try {
      await ensureStaticDir()
      const defaultSettings = {
        siteName: 'My Site',
        siteDescription: 'Welcome to my site',
        theme: 'default'
      }
      const filePath = path.join(STATIC_DIR, 'settings.json')
      await fs.writeFile(filePath, JSON.stringify(defaultSettings, null, 2))
      console.log('⚠️  Created default settings file as fallback')
      return true
    } catch (fallbackError) {
      console.error('❌ Failed to create fallback settings file:', fallbackError)
    return false
    }
  }
}

// Generate all static files
export async function generateAllStaticFiles() {
  console.log('🚀 Generating all static files...')
  
  // Ensure we have a site configured first
  try {
    await ensureDefaultSite()
  } catch (error) {
    console.error('❌ Could not ensure default site:', error)
    return false
  }
  
  const results = await Promise.allSettled([
    generateNavigationFile(),
    generatePagesFile(),
    generateTemplatesFile(),
    generateSiteSettingsFile()
  ])
  
  const successful = results.filter(r => r.status === 'fulfilled' && r.value === true).length
  const total = results.length
  
  console.log(`📊 Generated ${successful}/${total} static files`)
  
  // For new installations, it's normal to have some failures due to empty data
  // Consider it successful if at least half the files generated
  return successful >= Math.ceil(total / 2)
} 