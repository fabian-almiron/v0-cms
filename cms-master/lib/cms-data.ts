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
        // Client-side: Call API endpoint
        console.log('🌐 Calling static generation API...')
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

    // Create basic starter templates
    const starterTemplates = [
      {
        name: 'Basic Header',
        type: 'header' as const,
        description: 'Simple header with navigation',
        blocks: [
          {
            id: 'header-block',
            type: 'Header' as ComponentType,
            order: 0,
            props: {},
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Basic Footer',
        type: 'footer' as const,
        description: 'Simple footer with links',
        blocks: [
          {
            id: 'footer-block',
            type: 'Footer' as ComponentType,
            order: 0,
            props: {},
            isVisible: true
          }
        ],
        isDefault: true
      },
      {
        name: 'Blank Page',
        type: 'page' as const,
        description: 'Empty page template',
        blocks: [],
        isDefault: true
      },
      {
        name: 'Landing Page',
        type: 'page' as const,
        description: 'Marketing landing page with Hero and Features',
        blocks: [
          {
            id: 'hero-block',
            type: 'Hero' as ComponentType,
            order: 0,
            props: {},
            isVisible: true
          },
          {
            id: 'features-block',
            type: 'Features' as ComponentType,
            order: 1,
            props: {},
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