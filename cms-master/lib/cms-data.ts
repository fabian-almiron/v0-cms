'use client'

import { supabase } from './supabase'
import { getCurrentSiteId } from './site-config'
import { PageBlock, ComponentType } from './cms-types'

// =============================================
// PAGES OPERATIONS
// =============================================

export interface CMSPage {
  id: string
  title: string
  slug: string
  description?: string
  status: 'draft' | 'published'
  blocks: PageBlock[]
  templateId?: string
  headerTemplateId?: string
  footerTemplateId?: string
  pageTemplateId?: string
  createdAt: string
  updatedAt: string
}

export async function loadPagesFromDatabase(): Promise<CMSPage[]> {
  const siteId = getCurrentSiteId()
  if (!siteId) return []

  try {
    // Get pages for this site
    const { data: pages, error: pagesError } = await supabase
      .from('pages')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })

    if (pagesError) throw pagesError

    // Get blocks for all pages
    const pageIds = pages.map(p => p.id)
    const { data: blocks, error: blocksError } = await supabase
      .from('page_blocks')
      .select('*')
      .in('page_id', pageIds)
      .order('order_index')

    if (blocksError) throw blocksError

    // Combine pages with their blocks
    return pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.meta_description,
      status: page.status as 'draft' | 'published',
      blocks: blocks
        .filter(block => block.page_id === page.id)
        .map(block => ({
          id: block.id,
          type: block.component_type,
          order: block.order_index,
          props: block.props || {},
          isVisible: block.is_visible
        })),
      templateId: page.theme_id,
      headerTemplateId: page.header_template_id,
      footerTemplateId: page.footer_template_id,
      pageTemplateId: page.page_template_id,
      createdAt: page.created_at,
      updatedAt: page.updated_at
    }))

  } catch (error) {
    console.error('Error loading pages from database:', error)
    return []
  }
}

export async function loadPageFromDatabase(pageId: string): Promise<CMSPage | null> {
  const siteId = getCurrentSiteId()
  if (!siteId) return null

  try {
    // Get the specific page
    const { data: page, error: pageError } = await supabase
      .from('pages')
      .select('*')
      .eq('id', pageId)
      .eq('site_id', siteId)
      .single()

    if (pageError) throw pageError

    // Get blocks for this page
    const { data: blocks, error: blocksError } = await supabase
      .from('page_blocks')
      .select('*')
      .eq('page_id', pageId)
      .order('order_index')

    if (blocksError) throw blocksError

    return {
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.meta_description,
      status: page.status as 'draft' | 'published',
      blocks: blocks.map(block => ({
        id: block.id,
        type: block.component_type,
        order: block.order_index,
        props: block.props || {},
        isVisible: block.is_visible
      })),
      templateId: page.theme_id,
      headerTemplateId: page.header_template_id,
      footerTemplateId: page.footer_template_id,
      pageTemplateId: page.page_template_id,
      createdAt: page.created_at,
      updatedAt: page.updated_at
    }

  } catch (error) {
    console.error('Error loading page from database:', error)
    return null
  }
}

export async function savePageToDatabase(page: Omit<CMSPage, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSPage | null> {
  const siteId = getCurrentSiteId()
  if (!siteId) return null

  try {
    // Insert page
    const { data: savedPage, error: pageError } = await supabase
      .from('pages')
      .insert([{
        site_id: siteId,
        title: page.title,
        slug: page.slug,
        meta_description: page.description,
        status: page.status,
        theme_id: 'default', // Set default theme
        header_template_id: page.headerTemplateId || null,
        footer_template_id: page.footerTemplateId || null,
        page_template_id: page.pageTemplateId || null
      }])
      .select()
      .single()

    if (pageError) throw pageError

    // Insert blocks
    if (page.blocks.length > 0) {
      const blocksToInsert = page.blocks.map((block, index) => ({
        site_id: siteId,
        page_id: savedPage.id,
        component_type: block.type,
        order_index: index,
        props: block.props,
        is_visible: block.isVisible
      }))

      const { error: blocksError } = await supabase
        .from('page_blocks')
        .insert(blocksToInsert)

      if (blocksError) throw blocksError
    }

    const result = {
      id: savedPage.id,
      title: savedPage.title,
      slug: savedPage.slug,
      description: savedPage.meta_description,
      status: savedPage.status,
      blocks: page.blocks,
      templateId: savedPage.theme_id,
      headerTemplateId: savedPage.header_template_id,
      footerTemplateId: savedPage.footer_template_id,
      pageTemplateId: savedPage.page_template_id,
      createdAt: savedPage.created_at,
      updatedAt: savedPage.updated_at
    }

    // Regenerate static files in the background
    try {
      if (typeof window === 'undefined') {
        // Server-side: Direct regeneration
        const { generatePagesFile } = await import('./static-generator-server')
        await generatePagesFile()
      } else {
        // Client-side: Call API endpoint
        fetch('/api/generate-static', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.warn('Failed to regenerate static files:', err))
      }
    } catch (error) {
      console.warn('Failed to regenerate static files:', error)
    }

    return result

  } catch (error) {
    console.error('Error saving page to database:', error)
    return null
  }
}

export async function updatePageInDatabase(pageId: string, updates: Partial<CMSPage>): Promise<CMSPage | null> {
  const siteId = getCurrentSiteId()
  if (!siteId) return null

  try {
    // Update page
    const { error: pageError } = await supabase
      .from('pages')
      .update({
        title: updates.title,
        slug: updates.slug,
        meta_description: updates.description,
        status: updates.status,
        theme_id: updates.templateId || 'default',
        header_template_id: updates.headerTemplateId,
        footer_template_id: updates.footerTemplateId,
        page_template_id: updates.pageTemplateId
      })
      .eq('id', pageId)
      .eq('site_id', siteId)

    if (pageError) throw pageError

    // Update blocks if provided
    if (updates.blocks) {
      // Delete existing blocks
      await supabase
        .from('page_blocks')
        .delete()
        .eq('page_id', pageId)
        .eq('site_id', siteId)

      // Insert new blocks
      if (updates.blocks.length > 0) {
        const blocksToInsert = updates.blocks.map((block, index) => ({
          site_id: siteId,
          page_id: pageId,
          component_type: block.type,
          order_index: index,
          props: block.props,
          is_visible: block.isVisible
        }))

        const { error: blocksError } = await supabase
          .from('page_blocks')
          .insert(blocksToInsert)

        if (blocksError) throw blocksError
      }
    }

    // Regenerate static files in the background
    try {
      if (typeof window === 'undefined') {
        // Server-side: Direct regeneration
        const { generatePagesFile } = await import('./static-generator-server')
        await generatePagesFile()
      } else {
        // Client-side: Call API endpoint
        fetch('/api/generate-static', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }).catch(err => console.warn('Failed to regenerate static files:', err))
      }
    } catch (error) {
      console.warn('Failed to regenerate static files:', error)
    }

    // Return the updated page data
    return await loadPageFromDatabase(pageId)

  } catch (error) {
    console.error('Error updating page in database:', error)
    return null
  }
}

export async function deletePageFromDatabase(pageId: string): Promise<boolean> {
  const siteId = getCurrentSiteId()
  if (!siteId) return false

  try {
    const { error } = await supabase
      .from('pages')
      .delete()
      .eq('id', pageId)
      .eq('site_id', siteId)

    if (error) throw error
    return true

  } catch (error) {
    console.error('Error deleting page from database:', error)
    return false
  }
}

// =============================================
// TEMPLATES OPERATIONS  
// =============================================

export interface CMSTemplate {
  id: string
  name: string
  type: 'header' | 'footer' | 'page' | 'post'
  description?: string
  blocks: PageBlock[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export async function loadTemplatesFromDatabase(): Promise<CMSTemplate[]> {
  const siteId = getCurrentSiteId()
  if (!siteId) return []

  try {
    // Get templates for this site
    const { data: templates, error: templatesError } = await supabase
      .from('templates')
      .select('*')
      .eq('site_id', siteId)
      .order('created_at', { ascending: false })

    if (templatesError) throw templatesError

    // Get blocks for all templates
    const templateIds = templates.map(t => t.id)
    const { data: blocks, error: blocksError } = await supabase
      .from('template_blocks')
      .select('*')
      .in('template_id', templateIds)
      .order('order_index')

    if (blocksError) throw blocksError

    // Combine templates with their blocks
    return templates.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type,
      description: '', // Templates table doesn't have description field
      blocks: blocks
        .filter(block => block.template_id === template.id)
        .map(block => ({
          id: block.id,
          type: block.component_type,
          order: block.order_index,
          props: block.props || {},
          isVisible: block.is_visible
        })),
      isDefault: template.is_default,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    }))

  } catch (error) {
    console.error('Error loading templates from database:', error)
    return []
  }
}

export async function saveTemplateToDatabase(template: Omit<CMSTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<CMSTemplate | null> {
  const siteId = getCurrentSiteId()
  if (!siteId) return null

  try {
    // Insert template
    const { data: savedTemplate, error: templateError } = await supabase
      .from('templates')
      .insert([{
        site_id: siteId,
        name: template.name,
        type: template.type,
        theme_id: 'default',
        is_default: template.isDefault || false
      }])
      .select()
      .single()

    if (templateError) throw templateError

    // Insert blocks
    if (template.blocks.length > 0) {
      const blocksToInsert = template.blocks.map((block, index) => ({
        site_id: siteId,
        template_id: savedTemplate.id,
        component_type: block.type,
        order_index: index,
        props: block.props,
        is_visible: block.isVisible
      }))

      const { error: blocksError } = await supabase
        .from('template_blocks')
        .insert(blocksToInsert)

      if (blocksError) throw blocksError
    }

    return {
      id: savedTemplate.id,
      name: savedTemplate.name,
      type: savedTemplate.type,
      description: template.description || '', // Keep original description from input
      blocks: template.blocks,
      isDefault: savedTemplate.is_default,
      createdAt: savedTemplate.created_at,
      updatedAt: savedTemplate.updated_at
    }

  } catch (error) {
    console.error('Error saving template to database:', error)
    return null
  }
}

// =============================================
// NAVIGATION OPERATIONS
// =============================================

export interface CMSNavigationItem {
  id: string
  label: string
  type: 'internal' | 'external'
  href?: string
  pageId?: string
  order: number
  isVisible: boolean
}

// =============================================
// NAVIGATION CACHE SYSTEM
// =============================================
let navigationCache: CMSNavigationItem[] | null = null
let navigationCacheTimestamp: number = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

export async function loadNavigationFromDatabase(): Promise<CMSNavigationItem[]> {
  const siteId = getCurrentSiteId()
  if (!siteId) return []

  // Check memory cache first
  const now = Date.now()
  if (navigationCache && (now - navigationCacheTimestamp) < CACHE_DURATION) {
    console.log('📋 Navigation loaded from memory cache')
    return navigationCache
  }

  // Check localStorage cache
  if (typeof window !== 'undefined') {
    try {
      const cachedData = localStorage.getItem(`cms_navigation_cache_${siteId}`)
      const cacheTime = localStorage.getItem(`cms_navigation_cache_time_${siteId}`)
      
      if (cachedData && cacheTime) {
        const timeDiff = now - parseInt(cacheTime)
        if (timeDiff < CACHE_DURATION) {
          const parsed = JSON.parse(cachedData)
          navigationCache = parsed
          navigationCacheTimestamp = now
          console.log('📋 Navigation loaded from localStorage cache')
          return parsed
        }
      }
    } catch (error) {
      console.warn('Failed to load navigation from cache:', error)
    }
  }

  try {
    console.log('📋 Loading navigation from database...')
    const { data, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('site_id', siteId)
      .order('order_index')

    if (error) throw error

    const navigation: CMSNavigationItem[] = (data || []).map(item => ({
      id: item.id,
      label: item.label,
      type: item.type as 'internal' | 'external',
      href: item.href,
      pageId: item.page_id,
      order: item.order_index,
      isVisible: item.is_visible
    }))

    // Update caches
    navigationCache = navigation
    navigationCacheTimestamp = now

    // Update localStorage cache
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(`cms_navigation_cache_${siteId}`, JSON.stringify(navigation))
        localStorage.setItem(`cms_navigation_cache_time_${siteId}`, now.toString())
      } catch (error) {
        console.warn('Failed to cache navigation:', error)
      }
    }

    console.log('📋 Navigation loaded from database and cached')
    return navigation

  } catch (error) {
    console.error('Error loading navigation from database:', error)
    return []
  }
}

export async function saveNavigationToDatabase(navigation: CMSNavigationItem[]): Promise<boolean> {
  const siteId = getCurrentSiteId()
  if (!siteId) {
    console.error('❌ No site ID available for navigation save')
    return false
  }

  try {
    console.log('💾 Saving navigation to database:', navigation.length, 'items')
    
    // Delete existing navigation items
    const { error: deleteError } = await supabase
      .from('navigation_items')
      .delete()
      .eq('site_id', siteId)

    if (deleteError) {
      console.error('❌ Error deleting existing navigation:', deleteError)
      throw deleteError
    }

    console.log('🗑️ Deleted existing navigation items')

    // Insert new navigation items
    if (navigation.length > 0) {
      const itemsToInsert = navigation.map(item => ({
        site_id: siteId,
        label: item.label,
        type: item.type,
        href: item.href,
        page_id: item.pageId,
        order_index: item.order,
        is_visible: item.isVisible
      }))

      console.log('📝 Inserting navigation items:', itemsToInsert)

      const { error } = await supabase
        .from('navigation_items')
        .insert(itemsToInsert)

      if (error) {
        console.error('❌ Error inserting navigation items:', error)
        throw error
      }

      console.log('✅ Navigation items inserted successfully')
    }

    // Clear caches after successful save
    clearNavigationCache(siteId)

    // Regenerate static files in the background
    console.log('🔄 Regenerating static navigation files...')
    try {
      if (typeof window === 'undefined') {
        // Server-side: Direct regeneration
        const { generateNavigationFile } = await import('./static-generator-server')
        const success = await generateNavigationFile()
        console.log('📄 Static navigation file generation:', success ? 'SUCCESS' : 'FAILED')
      } else {
        // Client-side: Force refresh navigation API cache (invalidates Vercel Edge)
        console.log('🌐 Force refreshing navigation API cache...')
        const navResponse = await fetch('/api/navigation', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (navResponse.ok) {
          console.log('✅ Navigation API cache refreshed')
        } else {
          console.warn('⚠️ Navigation API cache refresh failed:', navResponse.status)
        }
        
        // Also call general static generation API
        const response = await fetch('/api/generate-static', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })
        
        if (response.ok) {
          const result = await response.json()
          console.log('✅ Static files regenerated:', result)
        } else {
          console.warn('⚠️ Static file regeneration API returned error:', response.status)
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to regenerate static files (navigation still saved):', error)
    }

    console.log('✅ Navigation saved to database successfully')
    return true

  } catch (error) {
    console.error('❌ Error saving navigation to database:', error)
    return false
  }
}

// Clear navigation cache
export function clearNavigationCache(siteId?: string) {
  console.log('🗑️ Clearing navigation cache...')
  navigationCache = null
  navigationCacheTimestamp = 0
  
  if (typeof window !== 'undefined' && siteId) {
    try {
    localStorage.removeItem(`cms_navigation_cache_${siteId}`)
    localStorage.removeItem(`cms_navigation_cache_time_${siteId}`)
      console.log('✅ Navigation cache cleared successfully')
    } catch (error) {
      console.warn('⚠️ Failed to clear navigation localStorage cache:', error)
    }
  }
  
  console.log('📋 Navigation cache cleared')
}

// =============================================
// MIGRATION UTILITIES
// =============================================

export async function migrateFromLocalStorage(): Promise<{ pages: number, templates: number, navigation: number }> {
  let migratedCounts = { pages: 0, templates: 0, navigation: 0 }

  try {
    // Migrate pages
    const storedPages = localStorage.getItem('cms_pages')
    if (storedPages) {
      const pages = JSON.parse(storedPages)
      for (const page of pages) {
        const saved = await savePageToDatabase({
          title: page.title,
          slug: page.slug,
          description: page.description || '',
          status: page.status || 'draft',
          blocks: page.blocks || [],
          templateId: page.templateId,
          headerTemplateId: page.headerTemplateId,
          footerTemplateId: page.footerTemplateId,
          pageTemplateId: page.pageTemplateId
        })
        if (saved) migratedCounts.pages++
      }
    }

    // Migrate templates
    const storedTemplates = localStorage.getItem('cms-templates')
    if (storedTemplates) {
      const templates = JSON.parse(storedTemplates)
      for (const template of templates) {
        const saved = await saveTemplateToDatabase({
          name: template.name,
          type: template.type,
          description: template.description,
          blocks: template.blocks || [],
          isDefault: template.isDefault
        })
        if (saved) migratedCounts.templates++
      }
    }

    // Migrate navigation
    const storedNavigation = localStorage.getItem('cms_navigation')
    if (storedNavigation) {
      const navigation = JSON.parse(storedNavigation)
      const success = await saveNavigationToDatabase(navigation.map((item: any) => ({
        id: item.id,
        label: item.label,
        type: item.type,
        href: item.href,
        pageId: item.pageId,
        order: item.order,
        isVisible: item.isVisible
      })))
      if (success) migratedCounts.navigation = navigation.length
    }

  } catch (error) {
    console.error('Error migrating from localStorage:', error)
  }

  return migratedCounts
}

export async function createStarterTemplatesWithNavigation(): Promise<boolean> {
  const siteId = getCurrentSiteId()
  if (!siteId) return false

  try {
    console.log('Creating starter templates with navigation...')

    // Check if templates already exist
    const existingTemplates = await loadTemplatesFromDatabase()
    if (existingTemplates.length > 0) {
      console.log('Templates already exist, skipping creation')
      return true
    }

    // Load the navigation items we just created
    const navigationItems = await loadNavigationFromDatabase()
    console.log(`Found ${navigationItems.length} navigation items to include in header`)

    // Convert navigation items to the format expected by the header component
    const navigationLinks = navigationItems.map(item => ({
      label: item.label,
      href: item.href || `/page/${item.pageId}` // Use href if available, otherwise construct from pageId
    }))

    // Create enhanced starter templates with actual navigation
    const starterTemplates = [
      {
        name: 'Default Header',
        type: 'header' as const,
        description: 'Professional header with navigation and logo',
        blocks: [
          {
            id: 'header-block',
            type: 'Header' as ComponentType,
            order: 0,
            props: {
              logo: {
                text: 'Your Logo',
                image: '/placeholder-logo.svg'
              },
              navigation: navigationLinks, // Use actual navigation from database
              ctaButton: {
                text: 'Get Started',
                href: '/contact'
              }
            },
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Default Footer',
        type: 'footer' as const,
        description: 'Complete footer with links and contact info',
        blocks: [
          {
            id: 'footer-block',
            type: 'Footer' as ComponentType,
            order: 0,
            props: {
              companyName: 'Your Company',
              description: 'Building amazing websites with powerful tools.',
              links: [
                {
                  title: 'Company',
                  items: navigationLinks.slice(0, 3) // Use first 3 nav items
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Blog', href: '/blog' },
                    { label: 'Support', href: '/support' },
                    { label: 'Privacy', href: '/privacy' }
                  ]
                }
              ],
              socialMedia: [
                { platform: 'twitter', url: '#' },
                { platform: 'facebook', url: '#' },
                { platform: 'linkedin', url: '#' }
              ],
              contact: {
                email: 'hello@example.com',
                phone: '+1 (555) 123-4567'
              }
            },
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Blank Page',
        type: 'page' as const,
        description: 'Empty page template for custom layouts',
        blocks: [
          {
            id: 'page-dnd',
            type: 'DNDArea' as ComponentType,
            order: 0,
            props: {
              minHeight: '400px',
              placeholder: 'Drag components here to build your page'
            },
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Landing Page',
        type: 'page' as const,
        description: 'High-converting landing page with Hero, Features, and CTA',
        blocks: [
          {
            id: 'hero-block',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Welcome to Our Platform',
              subtitle: 'Build amazing websites with our powerful page builder',
              ctaText: 'Get Started Free',
              ctaLink: '/contact',
              secondaryCtaText: 'Learn More',
              secondaryCtaLink: '/about',
              backgroundImage: '/placeholder.jpg'
            },
            isVisible: true
          },
          {
            id: 'features-block',
            type: 'Features' as ComponentType,
            order: 1,
            props: {
              title: 'Why Choose Our Platform',
              subtitle: 'Everything you need to build professional websites',
              features: [
                {
                  title: 'Easy to Use',
                  description: 'Intuitive drag-and-drop interface that anyone can master',
                  icon: 'Zap'
                },
                {
                  title: 'Mobile Ready',
                  description: 'All designs are responsive and mobile-optimized',
                  icon: 'Smartphone'
                },
                {
                  title: 'Fast & Secure',
                  description: 'Lightning-fast loading with enterprise-grade security',
                  icon: 'Shield'
                }
              ]
            },
            isVisible: true
          },
          {
            id: 'cta-block',
            type: 'CTA' as ComponentType,
            order: 2,
            props: {
              title: 'Ready to Get Started?',
              subtitle: 'Join thousands of users who trust our platform',
              primaryButtonText: 'Start Your Free Trial',
              primaryButtonLink: '/contact',
              secondaryButtonText: 'View Pricing',
              secondaryButtonLink: '/services'
            },
            isVisible: true
          }
        ],
        isDefault: false
      },
      {
        name: 'Business Page',
        type: 'page' as const,
        description: 'Professional business page with testimonials and pricing',
        blocks: [
          {
            id: 'business-hero',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Grow Your Business Online',
              subtitle: 'Professional solutions tailored to your needs',
              ctaText: 'Get Quote',
              ctaLink: '/contact'
            },
            isVisible: true
          },
          {
            id: 'business-testimonials',
            type: 'Testimonials' as ComponentType,
            order: 1,
            props: {
              title: 'What Our Clients Say',
              subtitle: 'Don\'t just take our word for it',
              testimonials: [
                {
                  quote: 'Outstanding service and incredible results. Highly recommended!',
                  author: 'Sarah Johnson',
                  position: 'CEO, TechCorp',
                  avatar: '/placeholder-user.jpg'
                },
                {
                  quote: 'Professional, reliable, and always delivers on time.',
                  author: 'Mike Chen',
                  position: 'Founder, StartupXYZ',
                  avatar: '/placeholder-user.jpg'
                }
              ]
            },
            isVisible: true
          },
          {
            id: 'business-pricing',
            type: 'Pricing' as ComponentType,
            order: 2,
            props: {
              title: 'Choose Your Plan',
              subtitle: 'Flexible pricing for businesses of all sizes',
              plans: [
                {
                  name: 'Basic',
                  price: '$49',
                  period: '/month',
                  features: ['Up to 5 pages', 'Basic support', 'SSL included'],
                  highlighted: false
                },
                {
                  name: 'Pro',
                  price: '$99',
                  period: '/month',
                  features: ['Unlimited pages', 'Priority support', 'Advanced features', 'Analytics'],
                  highlighted: true
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  period: '',
                  features: ['Everything in Pro', 'Custom development', 'Dedicated support'],
                  highlighted: false
                }
              ]
            },
            isVisible: true
          }
        ],
        isDefault: false
      }
    ]

    // Save each template to database
    for (const template of starterTemplates) {
      const saved = await saveTemplateToDatabase(template)
      if (saved) {
        console.log(`Created template: ${template.name}`)
      }
    }

    console.log('✅ Starter templates with navigation created successfully!')
    return true

  } catch (error) {
    console.error('Error creating starter templates with navigation:', error)
    return false
  }
}

export async function setupCompleteStarterSite(): Promise<boolean> {
  console.log('')
  console.log('🚀 Setting up complete starter site...')
  console.log('   This will create templates, pages, and navigation')
  console.log('')
  
  try {
    // Create content in the correct order: pages first, then navigation, then templates
    console.log('📄 Step 1: Creating placeholder pages...')
    const pagesCreated = await createPlaceholderPagesInDatabase()
    
    console.log('🧭 Step 2: Creating navigation menu...')
    const navigationCreated = await createDefaultNavigationInDatabase()
    
    console.log('🎨 Step 3: Creating templates with navigation...')
    const templatesCreated = await createStarterTemplatesWithNavigation()
    
    if (templatesCreated && pagesCreated && navigationCreated) {
      console.log('🔄 Step 4: Regenerating static files for frontend...')
      
      // Regenerate static files so the frontend can see the new content
      try {
        if (typeof window === 'undefined') {
          // Server-side: Direct regeneration
          const { generateAllStaticFiles } = await import('./static-generator-server')
          const success = await generateAllStaticFiles()
          console.log('📄 Static files regeneration:', success ? 'SUCCESS' : 'PARTIAL')
        } else {
          // Client-side: Call API endpoint with site ID
          const currentSiteId = getCurrentSiteId()
          console.log('🔍 Sending site ID to API:', currentSiteId)
          
          const response = await fetch('/api/generate-static', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ siteId: currentSiteId })
          })
          
          if (response.ok) {
            const result = await response.json()
            console.log('✅ Static files regenerated via API:', result)
          } else {
            console.warn('⚠️ Static file regeneration API returned error:', response.status)
          }
        }
      } catch (error) {
        console.warn('⚠️ Failed to regenerate static files (content still created):', error)
      }
      
      console.log('')
      console.log('🎉 COMPLETE STARTER SITE SETUP SUCCESSFUL!')
      console.log('')
      console.log('✅ What was created:')
      console.log('   • Professional header and footer templates with branding')
      console.log('   • Home page with Hero, Features, and CTA sections')
      console.log('   • About page with company story and mission')
      console.log('   • Services page with pricing and feature comparison')
      console.log('   • Contact page with contact information')
      console.log('   • Navigation menu properly linked to header template')
      console.log('   • Rich placeholder content ready for customization')
      console.log('   • Static files regenerated for optimal performance')
      console.log('')
      console.log('🎯 Next steps:')
      console.log('   1. Refresh the page to see your new navigation')
      console.log('   2. Visit /admin to customize content')
      console.log('   3. Update placeholder text and images')
      console.log('   4. Add your branding and colors')
      console.log('')
      return true
    } else {
      console.log('⚠️ Some components failed to create')
      return false
    }
    
  } catch (error) {
    console.error('❌ Error setting up starter site:', error)
    return false
  }
}

export async function createPlaceholderPagesInDatabase(): Promise<boolean> {
  const siteId = getCurrentSiteId()
  if (!siteId) return false

  try {
    console.log('Creating placeholder pages in database...')

    // Check if pages already exist
    const existingPages = await loadPagesFromDatabase()
    if (existingPages.length > 0) {
      console.log('Pages already exist, skipping placeholder creation')
      return true
    }

    // Create placeholder pages with actual content
    const placeholderPages = [
      {
        title: 'Home',
        slug: 'home',
        status: 'published' as const,
        blocks: [
          {
            id: 'home-hero',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Welcome to Our Website',
              subtitle: 'Build amazing websites with our powerful page builder',
              ctaText: 'Get Started',
              ctaLink: '/about',
              backgroundImage: '/placeholder.jpg'
            },
            isVisible: true
          },
          {
            id: 'home-features',
            type: 'Features' as ComponentType,
            order: 1,
            props: {
              title: 'Why Choose Us',
              subtitle: 'Discover what makes us different',
              features: [
                {
                  title: 'Easy to Use',
                  description: 'Intuitive drag-and-drop interface',
                  icon: 'Zap'
                },
                {
                  title: 'Responsive Design',
                  description: 'Looks great on all devices',
                  icon: 'Smartphone'
                },
                {
                  title: '24/7 Support',
                  description: 'Get help whenever you need it',
                  icon: 'HeadphonesIcon'
                }
              ]
            },
            isVisible: true
          },
          {
            id: 'home-cta',
            type: 'CTA' as ComponentType,
            order: 2,
            props: {
              title: 'Ready to Get Started?',
              subtitle: 'Join thousands of satisfied customers',
              primaryButtonText: 'Start Free Trial',
              primaryButtonLink: '/contact',
              secondaryButtonText: 'Learn More',
              secondaryButtonLink: '/about'
            },
            isVisible: true
          }
        ]
      },
      {
        title: 'About Us',
        slug: 'about',
        status: 'published' as const,
        blocks: [
          {
            id: 'about-hero',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'About Our Company',
              subtitle: 'Learn more about our mission, vision, and values',
              backgroundImage: '/placeholder.jpg',
              showCTA: false
            },
            isVisible: true
          },
          {
            id: 'about-content',
            type: 'Features' as ComponentType,
            order: 1,
            props: {
              title: 'Our Story',
              subtitle: 'Founded with a vision to make web development accessible to everyone',
              features: [
                {
                  title: 'Our Mission',
                  description: 'To empower businesses and individuals to create stunning websites without technical expertise.',
                  icon: 'Target'
                },
                {
                  title: 'Our Vision',
                  description: 'A world where anyone can build professional websites quickly and easily.',
                  icon: 'Eye'
                },
                {
                  title: 'Our Values',
                  description: 'Innovation, simplicity, and customer success drive everything we do.',
                  icon: 'Heart'
                }
              ]
            },
            isVisible: true
          }
        ]
      },
      {
        title: 'Contact Us',
        slug: 'contact',
        status: 'published' as const,
        blocks: [
          {
            id: 'contact-hero',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Get in Touch',
              subtitle: 'We\'d love to hear from you. Send us a message and we\'ll respond as soon as possible.',
              showCTA: false
            },
            isVisible: true
          },
          {
            id: 'contact-cta',
            type: 'CTA' as ComponentType,
            order: 1,
            props: {
              title: 'Contact Information',
              subtitle: 'Reach out to us through any of these channels',
              primaryButtonText: 'Send Email',
              primaryButtonLink: 'mailto:hello@example.com',
              secondaryButtonText: 'Call Us',
              secondaryButtonLink: 'tel:+1234567890'
            },
            isVisible: true
          }
        ]
      },
      {
        title: 'Services',
        slug: 'services',
        status: 'published' as const,
        blocks: [
          {
            id: 'services-hero',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Our Services',
              subtitle: 'Comprehensive solutions to meet all your needs',
              showCTA: false
            },
            isVisible: true
          },
          {
            id: 'services-features',
            type: 'Features' as ComponentType,
            order: 1,
            props: {
              title: 'What We Offer',
              subtitle: 'Professional services tailored to your business',
              features: [
                {
                  title: 'Web Development',
                  description: 'Custom websites built with modern technologies',
                  icon: 'Code'
                },
                {
                  title: 'Design Services',
                  description: 'Beautiful, user-friendly designs that convert',
                  icon: 'Palette'
                },
                {
                  title: 'Consulting',
                  description: 'Strategic guidance to grow your online presence',
                  icon: 'Users'
                }
              ]
            },
            isVisible: true
          },
          {
            id: 'services-pricing',
            type: 'Pricing' as ComponentType,
            order: 2,
            props: {
              title: 'Simple Pricing',
              subtitle: 'Choose the plan that works for you',
              plans: [
                {
                  name: 'Starter',
                  price: '$29',
                  period: '/month',
                  features: ['5 Pages', 'Basic Support', 'SSL Certificate'],
                  highlighted: false
                },
                {
                  name: 'Professional',
                  price: '$79',
                  period: '/month',
                  features: ['Unlimited Pages', 'Priority Support', 'Advanced Features', 'Analytics'],
                  highlighted: true
                },
                {
                  name: 'Enterprise',
                  price: '$199',
                  period: '/month',
                  features: ['Everything in Pro', 'Custom Development', 'Dedicated Support', 'SLA'],
                  highlighted: false
                }
              ]
            },
            isVisible: true
          }
        ]
      }
    ]

    // Save each page to database
    for (const page of placeholderPages) {
      const saved = await savePageToDatabase(page)
      if (saved) {
        console.log(`Created placeholder page: ${page.title}`)
      }
    }

    console.log('✅ Placeholder pages created successfully!')
    return true

  } catch (error) {
    console.error('Error creating placeholder pages:', error)
    return false
  }
}

export async function createDefaultNavigationInDatabase(): Promise<boolean> {
  const siteId = getCurrentSiteId()
  if (!siteId) {
    console.error('❌ No site ID available for navigation creation')
    return false
  }

  try {
    console.log('Creating default navigation in database...')
    console.log('🔍 Using site ID for navigation:', siteId)

    // Check if navigation already exists
    const existingNavigation = await loadNavigationFromDatabase()
    console.log(`🔍 Found ${existingNavigation.length} existing navigation items`)
    if (existingNavigation.length > 0) {
      console.log('Navigation already exists, skipping creation')
      return true
    }

    // Get the pages we just created to link to them
    const pages = await loadPagesFromDatabase()
    const homePageId = pages.find(p => p.slug === 'home')?.id
    const aboutPageId = pages.find(p => p.slug === 'about')?.id
    const servicesPageId = pages.find(p => p.slug === 'services')?.id
    const contactPageId = pages.find(p => p.slug === 'contact')?.id

    // Create default navigation items
    const defaultNavigation = [
      {
        label: 'Home',
        type: 'internal' as const,
        page_id: homePageId || null,
        href: homePageId ? null : '/home',
        order_index: 0,
        is_visible: true
      },
      {
        label: 'About',
        type: 'internal' as const,
        page_id: aboutPageId || null,
        href: aboutPageId ? null : '/about',
        order_index: 1,
        is_visible: true
      },
      {
        label: 'Services',
        type: 'internal' as const,
        page_id: servicesPageId || null,
        href: servicesPageId ? null : '/services',
        order_index: 2,
        is_visible: true
      },
      {
        label: 'Contact',
        type: 'internal' as const,
        page_id: contactPageId || null,
        href: contactPageId ? null : '/contact',
        order_index: 3,
        is_visible: true
      }
    ]

    // Save all navigation items to database at once
    const navigationItems = defaultNavigation.map(navItem => ({
      id: `nav-${navItem.label.toLowerCase()}`,
      label: navItem.label,
      type: navItem.type,
      href: navItem.href || undefined,
      pageId: navItem.page_id || undefined,
      order: navItem.order_index,
      isVisible: navItem.is_visible
    }))
    
    const saved = await saveNavigationToDatabase(navigationItems)
    if (saved) {
      console.log(`Created ${navigationItems.length} navigation items`)
    }

    console.log('✅ Default navigation created successfully!')
    return true

  } catch (error) {
    console.error('Error creating default navigation:', error)
    return false
  }
}

export async function createStarterTemplatesInDatabase(): Promise<boolean> {
  const siteId = getCurrentSiteId()
  if (!siteId) return false

  try {
    console.log('Creating starter templates in database...')

    // Check if templates already exist (only for manual calls, not automatic site creation)
    const existingTemplates = await loadTemplatesFromDatabase()
    if (existingTemplates.length > 0) {
      console.log('Templates already exist, skipping creation')
      return true
    }

    // Create enhanced starter templates with default content
    const starterTemplates = [
      {
        name: 'Default Header',
        type: 'header' as const,
        description: 'Professional header with navigation and logo',
        blocks: [
          {
            id: 'header-block',
            type: 'Header' as ComponentType,
            order: 0,
            props: {
              logo: {
                text: 'Your Logo',
                image: '/placeholder-logo.svg'
              },
              navigation: [
                { label: 'Home', href: '/home' },
                { label: 'About', href: '/about' },
                { label: 'Services', href: '/services' },
                { label: 'Contact', href: '/contact' }
              ],
              ctaButton: {
                text: 'Get Started',
                href: '/contact'
              }
            },
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Default Footer',
        type: 'footer' as const,
        description: 'Complete footer with links and contact info',
        blocks: [
          {
            id: 'footer-block',
            type: 'Footer' as ComponentType,
            order: 0,
            props: {
              companyName: 'Your Company',
              description: 'Building amazing websites with powerful tools.',
              links: [
                {
                  title: 'Company',
                  items: [
                    { label: 'About Us', href: '/about' },
                    { label: 'Services', href: '/services' },
                    { label: 'Contact', href: '/contact' }
                  ]
                },
                {
                  title: 'Resources',
                  items: [
                    { label: 'Blog', href: '/blog' },
                    { label: 'Support', href: '/support' },
                    { label: 'Privacy', href: '/privacy' }
                  ]
                }
              ],
              socialMedia: [
                { platform: 'twitter', url: '#' },
                { platform: 'facebook', url: '#' },
                { platform: 'linkedin', url: '#' }
              ],
              contact: {
                email: 'hello@example.com',
                phone: '+1 (555) 123-4567'
              }
            },
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Blank Page',
        type: 'page' as const,
        description: 'Empty page template for custom layouts',
        blocks: [
          {
            id: 'page-dnd',
            type: 'DNDArea' as ComponentType,
            order: 0,
            props: {
              minHeight: '400px',
              placeholder: 'Drag components here to build your page'
            },
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Landing Page',
        type: 'page' as const,
        description: 'High-converting landing page with Hero, Features, and CTA',
        blocks: [
          {
            id: 'hero-block',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Welcome to Our Platform',
              subtitle: 'Build amazing websites with our powerful page builder',
              ctaText: 'Get Started Free',
              ctaLink: '/contact',
              secondaryCtaText: 'Learn More',
              secondaryCtaLink: '/about',
              backgroundImage: '/placeholder.jpg'
            },
            isVisible: true
          },
          {
            id: 'features-block',
            type: 'Features' as ComponentType,
            order: 1,
            props: {
              title: 'Why Choose Our Platform',
              subtitle: 'Everything you need to build professional websites',
              features: [
                {
                  title: 'Easy to Use',
                  description: 'Intuitive drag-and-drop interface that anyone can master',
                  icon: 'Zap'
                },
                {
                  title: 'Mobile Ready',
                  description: 'All designs are responsive and mobile-optimized',
                  icon: 'Smartphone'
                },
                {
                  title: 'Fast & Secure',
                  description: 'Lightning-fast loading with enterprise-grade security',
                  icon: 'Shield'
                }
              ]
            },
            isVisible: true
          },
          {
            id: 'cta-block',
            type: 'CTA' as ComponentType,
            order: 2,
            props: {
              title: 'Ready to Get Started?',
              subtitle: 'Join thousands of users who trust our platform',
              primaryButtonText: 'Start Your Free Trial',
              primaryButtonLink: '/contact',
              secondaryButtonText: 'View Pricing',
              secondaryButtonLink: '/services'
            },
            isVisible: true
          }
        ],
        isDefault: false
      },
      {
        name: 'Business Page',
        type: 'page' as const,
        description: 'Professional business page with testimonials and pricing',
        blocks: [
          {
            id: 'business-hero',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {
              title: 'Grow Your Business Online',
              subtitle: 'Professional solutions tailored to your needs',
              ctaText: 'Get Quote',
              ctaLink: '/contact'
            },
            isVisible: true
          },
          {
            id: 'business-testimonials',
            type: 'Testimonials' as ComponentType,
            order: 1,
            props: {
              title: 'What Our Clients Say',
              subtitle: 'Don\'t just take our word for it',
              testimonials: [
                {
                  quote: 'Outstanding service and incredible results. Highly recommended!',
                  author: 'Sarah Johnson',
                  position: 'CEO, TechCorp',
                  avatar: '/placeholder-user.jpg'
                },
                {
                  quote: 'Professional, reliable, and always delivers on time.',
                  author: 'Mike Chen',
                  position: 'Founder, StartupXYZ',
                  avatar: '/placeholder-user.jpg'
                }
              ]
            },
            isVisible: true
          },
          {
            id: 'business-pricing',
            type: 'Pricing' as ComponentType,
            order: 2,
            props: {
              title: 'Choose Your Plan',
              subtitle: 'Flexible pricing for businesses of all sizes',
              plans: [
                {
                  name: 'Basic',
                  price: '$49',
                  period: '/month',
                  features: ['Up to 5 pages', 'Basic support', 'SSL included'],
                  highlighted: false
                },
                {
                  name: 'Pro',
                  price: '$99',
                  period: '/month',
                  features: ['Unlimited pages', 'Priority support', 'Advanced features', 'Analytics'],
                  highlighted: true
                },
                {
                  name: 'Enterprise',
                  price: 'Custom',
                  period: '',
                  features: ['Everything in Pro', 'Custom development', 'Dedicated support'],
                  highlighted: false
                }
              ]
            },
            isVisible: true
          }
        ],
        isDefault: false
      }
    ]

    // Save each template to database
    for (const template of starterTemplates) {
      const saved = await saveTemplateToDatabase(template)
      if (saved) {
        console.log(`Created template: ${template.name}`)
      }
    }

    console.log('✅ Starter templates created successfully!')
    return true

  } catch (error) {
    console.error('Error creating starter templates:', error)
    return false
  }
} 