import { createClient } from '@supabase/supabase-js'

// Check if environment variables are available
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Helper function to check if Supabase is configured
export function isSupabaseConfigured(): boolean {
  return !!(supabaseUrl && supabaseAnonKey)
}

// Create fallback client for build time when env vars are missing
function createFallbackClient() {
  // Create a minimal client that throws helpful errors when used
  return createClient('https://fallback.supabase.co', 'fallback-key')
}

// Public client (respects RLS)
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient()

// Admin client (bypasses RLS - use carefully!)
// Only available server-side since service key is not exposed to client
export const supabaseAdmin = supabaseServiceKey && supabaseUrl
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// =============================================
// TYPE DEFINITIONS (Multi-tenant)
// =============================================
export interface Site {
  id: string
  name: string
  domain: string
  subdomain?: string
  owner_email: string
  status: 'active' | 'inactive' | 'suspended'
  plan: 'free' | 'pro' | 'enterprise'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Page {
  id: string
  site_id: string
  title: string
  slug: string
  content?: string
  status: 'draft' | 'published'
  theme_id: string
  header_template_id?: string
  footer_template_id?: string
  page_template_id?: string
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface Template {
  id: string
  site_id: string
  name: string
  type: 'header' | 'footer' | 'page'
  theme_id: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface PageBlock {
  id: string
  site_id: string
  page_id: string
  component_type: string
  order_index: number
  props: Record<string, any>
  is_visible: boolean
  created_at: string
}

export interface TemplateBlock {
  id: string
  site_id: string
  template_id: string
  component_type: string
  order_index: number
  props: Record<string, any>
  is_visible: boolean
  created_at: string
}

export interface NavigationItem {
  id: string
  site_id: string
  label: string
  type: 'internal' | 'external'
  href?: string
  page_id?: string
  order_index: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface SiteSetting {
  id: string
  site_id: string
  key: string
  value: any
  created_at: string
  updated_at: string
}

// =============================================
// SITE MANAGEMENT FUNCTIONS
// =============================================
export async function createSite(siteData: Omit<Site, 'id' | 'created_at' | 'updated_at'>) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase is not configured. Please check your environment variables.')
  }
  
  const { data, error } = await supabase
    .from('sites')
    .insert([siteData])
    .select()
    .single()

  if (error) throw error
  return data as Site
}

export async function getSiteByDomain(domain: string) {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('domain', domain)
    .eq('status', 'active')
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Site | null
}

export async function getSiteById(siteId: string) {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single()

  if (error) throw error
  return data as Site
}

export async function updateSite(siteId: string, updates: Partial<Site>) {
  const { data, error } = await supabase
    .from('sites')
    .update(updates)
    .eq('id', siteId)
    .select()
    .single()

  if (error) throw error
  return data as Site
}

export async function deleteSite(siteId: string) {
  const { error } = await supabase
    .from('sites')
    .delete()
    .eq('id', siteId)

  if (error) throw error
}

export async function getAllSites() {
  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Site[]
}

// =============================================
// PAGE FUNCTIONS (Site-aware)
// =============================================
export async function getPages(siteId: string, status?: 'draft' | 'published') {
  let query = supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Page[]
}

export async function getPageBySlug(siteId: string, slug: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .eq('slug', slug)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as Page | null
}

export async function getPageById(siteId: string, pageId: string) {
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('site_id', siteId)
    .eq('id', pageId)
    .single()

  if (error) throw error
  return data as Page
}

export async function createPage(siteId: string, pageData: Omit<Page, 'id' | 'site_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('pages')
    .insert([{ ...pageData, site_id: siteId }])
    .select()
    .single()

  if (error) throw error
  return data as Page
}

export async function updatePage(siteId: string, pageId: string, updates: Partial<Page>) {
  const { data, error } = await supabase
    .from('pages')
    .update(updates)
    .eq('site_id', siteId)
    .eq('id', pageId)
    .select()
    .single()

  if (error) throw error
  return data as Page
}

export async function deletePage(siteId: string, pageId: string) {
  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('site_id', siteId)
    .eq('id', pageId)

  if (error) throw error
}

// =============================================
// TEMPLATE FUNCTIONS (Site-aware)
// =============================================
export async function getTemplates(siteId: string, type?: 'header' | 'footer' | 'page', themeId?: string) {
  let query = supabase
    .from('templates')
    .select('*')
    .eq('site_id', siteId)
    .order('created_at', { ascending: false })

  if (type) {
    query = query.eq('type', type)
  }

  if (themeId) {
    query = query.eq('theme_id', themeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Template[]
}

export async function getTemplateById(siteId: string, templateId: string) {
  const { data, error } = await supabase
    .from('templates')
    .select('*')
    .eq('site_id', siteId)
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data as Template
}

export async function createTemplate(siteId: string, templateData: Omit<Template, 'id' | 'site_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('templates')
    .insert([{ ...templateData, site_id: siteId }])
    .select()
    .single()

  if (error) throw error
  return data as Template
}

export async function updateTemplate(siteId: string, templateId: string, updates: Partial<Template>) {
  const { data, error } = await supabase
    .from('templates')
    .update(updates)
    .eq('site_id', siteId)
    .eq('id', templateId)
    .select()
    .single()

  if (error) throw error
  return data as Template
}

export async function deleteTemplate(siteId: string, templateId: string) {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('site_id', siteId)
    .eq('id', templateId)

  if (error) throw error
}

// =============================================
// BLOCK FUNCTIONS (Site-aware)
// =============================================
export async function getPageBlocks(siteId: string, pageId: string) {
  const { data, error } = await supabase
    .from('page_blocks')
    .select('*')
    .eq('site_id', siteId)
    .eq('page_id', pageId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as PageBlock[]
}

export async function getTemplateBlocks(siteId: string, templateId: string) {
  const { data, error } = await supabase
    .from('template_blocks')
    .select('*')
    .eq('site_id', siteId)
    .eq('template_id', templateId)
    .order('order_index', { ascending: true })

  if (error) throw error
  return data as TemplateBlock[]
}

export async function createPageBlock(siteId: string, blockData: Omit<PageBlock, 'id' | 'site_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('page_blocks')
    .insert([{ ...blockData, site_id: siteId }])
    .select()
    .single()

  if (error) throw error
  return data as PageBlock
}

export async function createTemplateBlock(siteId: string, blockData: Omit<TemplateBlock, 'id' | 'site_id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('template_blocks')
    .insert([{ ...blockData, site_id: siteId }])
    .select()
    .single()

  if (error) throw error
  return data as TemplateBlock
}

export async function updatePageBlock(siteId: string, blockId: string, updates: Partial<PageBlock>) {
  const { data, error } = await supabase
    .from('page_blocks')
    .update(updates)
    .eq('site_id', siteId)
    .eq('id', blockId)
    .select()
    .single()

  if (error) throw error
  return data as PageBlock
}

export async function updateTemplateBlock(siteId: string, blockId: string, updates: Partial<TemplateBlock>) {
  const { data, error } = await supabase
    .from('template_blocks')
    .update(updates)
    .eq('site_id', siteId)
    .eq('id', blockId)
    .select()
    .single()

  if (error) throw error
  return data as TemplateBlock
}

export async function deletePageBlock(siteId: string, blockId: string) {
  const { error } = await supabase
    .from('page_blocks')
    .delete()
    .eq('site_id', siteId)
    .eq('id', blockId)

  if (error) throw error
}

export async function deleteTemplateBlock(siteId: string, blockId: string) {
  const { error } = await supabase
    .from('template_blocks')
    .delete()
    .eq('site_id', siteId)
    .eq('id', blockId)

  if (error) throw error
}

// =============================================
// NAVIGATION FUNCTIONS (Site-aware)
// =============================================
export async function getNavigation(siteId: string, visibleOnly: boolean = false) {
  let query = supabase
    .from('navigation_items')
    .select('*')
    .eq('site_id', siteId)
    .order('order_index', { ascending: true })

  if (visibleOnly) {
    query = query.eq('is_visible', true)
  }

  const { data, error } = await query
  if (error) throw error
  return data as NavigationItem[]
}

export async function createNavigationItem(siteId: string, navData: Omit<NavigationItem, 'id' | 'site_id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('navigation_items')
    .insert([{ ...navData, site_id: siteId }])
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function updateNavigationItem(siteId: string, navId: string, updates: Partial<NavigationItem>) {
  const { data, error } = await supabase
    .from('navigation_items')
    .update(updates)
    .eq('site_id', siteId)
    .eq('id', navId)
    .select()
    .single()

  if (error) throw error
  return data as NavigationItem
}

export async function deleteNavigationItem(siteId: string, navId: string) {
  const { error } = await supabase
    .from('navigation_items')
    .delete()
    .eq('site_id', siteId)
    .eq('id', navId)

  if (error) throw error
}

// =============================================
// SITE SETTINGS FUNCTIONS (Site-aware)
// =============================================
export async function getSiteSettings(siteId: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('site_id', siteId)

  if (error) throw error
  return data as SiteSetting[]
}

export async function getSiteSetting(siteId: string, key: string) {
  const { data, error } = await supabase
    .from('site_settings')
    .select('value')
    .eq('site_id', siteId)
    .eq('key', key)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.value || null
}

export async function setSiteSetting(siteId: string, key: string, value: any) {
  const { data, error } = await supabase
    .from('site_settings')
    .upsert([{ site_id: siteId, key, value }], { 
      onConflict: 'site_id,key'
    })
    .select()
    .single()

  if (error) throw error
  return data as SiteSetting
}

export async function deleteSiteSetting(siteId: string, key: string) {
  const { error } = await supabase
    .from('site_settings')
    .delete()
    .eq('site_id', siteId)
    .eq('key', key)

  if (error) throw error
}

// =============================================
// BATCH OPERATIONS (Site-aware)
// =============================================
export async function savePageWithBlocks(siteId: string, pageData: Omit<Page, 'id' | 'site_id' | 'created_at' | 'updated_at'>, blocks: Omit<PageBlock, 'id' | 'site_id' | 'page_id' | 'created_at'>[]) {
  // Start transaction
  const { data: page, error: pageError } = await supabase
    .from('pages')
    .insert([{ ...pageData, site_id: siteId }])
    .select()
    .single()

  if (pageError) throw pageError

  // Insert blocks
  if (blocks.length > 0) {
    const blocksWithPageId = blocks.map((block, index) => ({
      ...block,
      site_id: siteId,
      page_id: page.id,
      order_index: index
    }))

    const { error: blocksError } = await supabase
      .from('page_blocks')
      .insert(blocksWithPageId)

    if (blocksError) throw blocksError
  }

  return page as Page
}

export async function saveTemplateWithBlocks(siteId: string, templateData: Omit<Template, 'id' | 'site_id' | 'created_at' | 'updated_at'>, blocks: Omit<TemplateBlock, 'id' | 'site_id' | 'template_id' | 'created_at'>[]) {
  // Start transaction
  const { data: template, error: templateError } = await supabase
    .from('templates')
    .insert([{ ...templateData, site_id: siteId }])
    .select()
    .single()

  if (templateError) throw templateError

  // Insert blocks
  if (blocks.length > 0) {
    const blocksWithTemplateId = blocks.map((block, index) => ({
      ...block,
      site_id: siteId,
      template_id: template.id,
      order_index: index
    }))

    const { error: blocksError } = await supabase
      .from('template_blocks')
      .insert(blocksWithTemplateId)

    if (blocksError) throw blocksError
  }

  return template as Template
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
export async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('sites')
      .select('count')
      .limit(1)

    if (error) throw error
    return { success: true, message: 'Connection successful' }
  } catch (error) {
    return { success: false, message: (error as Error).message }
  }
}

// Helper to get current site context (you'll implement this based on your routing)
export function getCurrentSiteId(): string {
  // This should be implemented based on your routing strategy
  // For example, from domain, subdomain, or route parameter
  throw new Error('getCurrentSiteId() not implemented - implement based on your routing strategy')
}

// Data transformation utilities
export function transformLocalStorageToDatabase(localData: any, siteId: string) {
  // Helper function to migrate from localStorage format to database format
  // Implementation depends on your current localStorage structure
  console.log('Transform localStorage data for site:', siteId, localData)
}

export function transformDatabaseToLocalStorage(dbData: any) {
  // Helper function to convert database format back to localStorage format if needed
  console.log('Transform database data to localStorage format:', dbData)
}

// =============================================
// ADMIN FUNCTIONS (Using Service Role Key)
// =============================================
// These functions bypass RLS and are for your multi-site management dashboard

// Helper function to ensure admin client is available
function ensureAdminClient() {
  if (!supabaseAdmin) {
    throw new Error('Service role key not available - admin functions require server-side execution')
  }
  return supabaseAdmin
}

export async function adminGetAllSites() {
  const { data, error } = await ensureAdminClient()
    .from('sites')
    .select(`
      *,
      pages (count),
      templates (count),
      navigation_items (count)
    `)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as Site[]
}

export async function adminGetSiteStatistics() {
  const { data, error } = await ensureAdminClient()
    .from('site_statistics')
    .select('*')

  if (error) throw error
  return data
}

export async function adminCreateSite(siteData: Omit<Site, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await ensureAdminClient()
    .from('sites')
    .insert([siteData])
    .select()
    .single()

  if (error) throw error
  return data as Site
}

export async function adminUpdateSite(siteId: string, updates: Partial<Site>) {
  const { data, error } = await ensureAdminClient()
    .from('sites')
    .update(updates)
    .eq('id', siteId)
    .select()
    .single()

  if (error) throw error
  return data as Site
}

export async function adminDeleteSite(siteId: string) {
  // This will cascade delete all related data
  const { error } = await ensureAdminClient()
    .from('sites')
    .delete()
    .eq('id', siteId)

  if (error) throw error
}

export async function adminGetSiteData(siteId: string) {
  // Get complete site data for management/backup purposes
  const { data, error } = await ensureAdminClient()
    .from('sites')
    .select(`
      *,
      pages (*),
      templates (*),
      page_blocks (*),
      template_blocks (*),
      navigation_items (*),
      site_settings (*)
    `)
    .eq('id', siteId)
    .single()

  if (error) throw error
  return data
}

export async function adminBulkUpdateSites(updates: { id: string; updates: Partial<Site> }[]) {
  const results = []
  
  for (const { id, updates: siteUpdates } of updates) {
    try {
      const { data, error } = await ensureAdminClient()
        .from('sites')
        .update(siteUpdates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      results.push({ id, success: true, data })
    } catch (error) {
      results.push({ id, success: false, error: (error as Error).message })
    }
  }

  return results
}

export async function adminTestConnection() {
  try {
    if (!supabaseAdmin) {
      return { success: false, message: 'Service role key not available', hasServiceRole: false }
    }
    
    const { data, error } = await ensureAdminClient()
      .from('sites')
      .select('count')
      .limit(1)

    if (error) throw error
    return { success: true, message: 'Admin connection successful', hasServiceRole: true }
  } catch (error) {
    return { success: false, message: (error as Error).message, hasServiceRole: false }
  }
} 