import { supabase } from './supabase'
import { getCurrentSiteId, autoConfigureSiteId } from './site-config-server'
import { PageBlock, ComponentType } from './cms-types'

// =============================================
// SERVER-SIDE DATA LOADING FUNCTIONS
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

export interface NavigationItem {
  id: string
  label: string
  type: 'internal' | 'external'
  href?: string
  pageId?: string
  order: number
  isVisible: boolean
}

export interface CMSTemplate {
  id: string
  name: string
  description?: string
  type: 'page' | 'header' | 'footer'
  blocks: PageBlock[]
  isBuiltIn: boolean
  createdAt: string
  updatedAt: string
}

export async function loadPagesFromDatabase(): Promise<CMSPage[]> {
  let siteId = getCurrentSiteId()
  if (!siteId) {
    siteId = await autoConfigureSiteId()
    if (!siteId) return []
  }

  try {
    const { data: pages, error } = await supabase
      .from('pages')
      .select('*')
      .eq('site_id', siteId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return pages.map(page => ({
      id: page.id,
      title: page.title,
      slug: page.slug,
      description: page.meta_description,
      status: page.status,
      blocks: page.blocks || [],
      templateId: page.theme_id,
      headerTemplateId: page.header_template_id,
      footerTemplateId: page.footer_template_id,
      pageTemplateId: page.page_template_id,
      createdAt: page.created_at,
      updatedAt: page.updated_at
    }))
  } catch (error) {
    console.error('Error loading pages:', error)
    return []
  }
}

export async function loadNavigationFromDatabase(): Promise<NavigationItem[]> {
  let siteId = getCurrentSiteId()
  if (!siteId) {
    siteId = await autoConfigureSiteId()
    if (!siteId) return []
  }

  try {
    const { data: navigation, error } = await supabase
      .from('navigation_items')
      .select('*')
      .eq('site_id', siteId)
      .eq('is_visible', true)
      .order('order_index', { ascending: true })

    if (error) throw error

    return navigation.map(item => ({
      id: item.id,
      label: item.label,
      type: item.type,
      href: item.href,
      pageId: item.page_id,
      order: item.order_index,
      isVisible: item.is_visible
    }))
  } catch (error) {
    console.error('Error loading navigation:', error)
    return []
  }
}

export async function loadTemplatesFromDatabase(): Promise<CMSTemplate[]> {
  let siteId = getCurrentSiteId()
  if (!siteId) {
    siteId = await autoConfigureSiteId()
    if (!siteId) return []
  }

  try {
    const { data: templates, error } = await supabase
      .from('templates')
      .select('*')
      .eq('site_id', siteId)
      .order('updated_at', { ascending: false })

    if (error) throw error

    return templates.map(template => ({
      id: template.id,
      name: template.name,
      description: template.description,
      type: template.type,
      blocks: template.blocks || [],
      isBuiltIn: template.is_built_in || false,
      createdAt: template.created_at,
      updatedAt: template.updated_at
    }))
  } catch (error) {
    console.error('Error loading templates:', error)
    return []
  }
} 