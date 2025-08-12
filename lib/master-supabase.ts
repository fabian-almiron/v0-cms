import { createClient } from '@supabase/supabase-js'

// Master Dashboard Supabase Configuration
// This uses a separate Supabase project for managing CMS instances
const masterSupabaseUrl = process.env.NEXT_PUBLIC_MASTER_SUPABASE_URL
const masterSupabaseAnonKey = process.env.NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY
const masterSupabaseServiceKey = process.env.MASTER_SUPABASE_SERVICE_ROLE_KEY

// Helper function to check if Master Supabase is configured
export function isMasterSupabaseConfigured(): boolean {
  return !!(masterSupabaseUrl && masterSupabaseAnonKey)
}

// Create fallback client for build time when env vars are missing
function createFallbackClient() {
  return createClient('https://fallback.supabase.co', 'fallback-key')
}

// Public client for master dashboard (respects RLS)
export const masterSupabase = masterSupabaseUrl && masterSupabaseAnonKey 
  ? createClient(masterSupabaseUrl, masterSupabaseAnonKey)
  : createFallbackClient()

// Admin client for master dashboard (bypasses RLS)
export const masterSupabaseAdmin = masterSupabaseServiceKey && masterSupabaseUrl
  ? createClient(masterSupabaseUrl, masterSupabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : null

// =============================================
// TYPE DEFINITIONS
// =============================================
export interface CMSInstance {
  id: string
  name: string
  domain?: string
  subdomain?: string
  status: 'creating' | 'active' | 'inactive' | 'failed' | 'deleting'
  
  // Vercel deployment info
  vercel_project_id?: string
  vercel_deployment_url?: string
  vercel_git_repo?: string
  vercel_team_id?: string
  
  // Supabase configuration
  supabase_project_ref?: string
  supabase_url?: string
  supabase_anon_key?: string
  supabase_service_key?: string // Encrypted
  
  // Owner information
  owner_name: string
  owner_email: string
  
  // Template and theme
  template_id: string
  theme_id: string
  
  // Deployment settings
  auto_deploy: boolean
  branch: string
  build_command: string
  
  // Metadata
  settings: Record<string, any>
  deployment_config: Record<string, any>
  last_deployed_at?: string
  created_at: string
  updated_at: string
}

export interface DeploymentLog {
  id: string
  cms_instance_id: string
  deployment_id?: string
  status: 'pending' | 'building' | 'success' | 'failed' | 'cancelled'
  log_data?: Record<string, any>
  error_message?: string
  started_at: string
  completed_at?: string
  duration_ms?: number
}

export interface CMSTemplate {
  id: string
  name: string
  description?: string
  category: string
  git_repo: string
  git_branch: string
  preview_image_url?: string
  config: Record<string, any>
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SupabaseProject {
  id: string
  cms_instance_id: string
  project_ref: string
  project_id?: string
  organization_id?: string
  database_url?: string
  api_url?: string
  status: 'creating' | 'active' | 'paused' | 'inactive'
  settings: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Notification {
  id: string
  cms_instance_id?: string
  type: 'deployment' | 'error' | 'success' | 'warning'
  title: string
  message: string
  is_read: boolean
  metadata: Record<string, any>
  created_at: string
}

export interface MasterSetting {
  id: string
  key: string
  value: any
  description?: string
  is_encrypted: boolean
  created_at: string
  updated_at: string
}

// =============================================
// CMS INSTANCE FUNCTIONS
// =============================================
export async function createCMSInstance(instanceData: Omit<CMSInstance, 'id' | 'created_at' | 'updated_at'>) {
  if (!isMasterSupabaseConfigured()) {
    throw new Error('Master Supabase is not configured. Please check your environment variables.')
  }
  
  const { data, error } = await masterSupabase
    .from('cms_instances')
    .insert([instanceData])
    .select()
    .single()

  if (error) throw error
  return data as CMSInstance
}

export async function getCMSInstances(limit?: number) {
  const query = masterSupabase
    .from('cms_instances')
    .select('*')
    .order('created_at', { ascending: false })

  if (limit) {
    query.limit(limit)
  }

  const { data, error } = await query
  if (error) throw error
  return data as CMSInstance[]
}

export async function getCMSInstanceById(instanceId: string) {
  const { data, error } = await masterSupabase
    .from('cms_instances')
    .select('*')
    .eq('id', instanceId)
    .single()

  if (error) throw error
  return data as CMSInstance
}

export async function updateCMSInstance(instanceId: string, updates: Partial<CMSInstance>) {
  const { data, error } = await masterSupabase
    .from('cms_instances')
    .update(updates)
    .eq('id', instanceId)
    .select()
    .single()

  if (error) throw error
  return data as CMSInstance
}

export async function deleteCMSInstance(instanceId: string) {
  const { error } = await masterSupabase
    .from('cms_instances')
    .delete()
    .eq('id', instanceId)

  if (error) throw error
}

export async function getCMSInstancesByOwner(ownerEmail: string) {
  const { data, error } = await masterSupabase
    .from('cms_instances')
    .select('*')
    .eq('owner_email', ownerEmail)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data as CMSInstance[]
}

// =============================================
// DEPLOYMENT LOG FUNCTIONS
// =============================================
export async function createDeploymentLog(logData: Omit<DeploymentLog, 'id' | 'started_at'>) {
  const { data, error } = await masterSupabase
    .from('deployment_logs')
    .insert([logData])
    .select()
    .single()

  if (error) throw error
  return data as DeploymentLog
}

export async function updateDeploymentLog(logId: string, updates: Partial<DeploymentLog>) {
  const { data, error } = await masterSupabase
    .from('deployment_logs')
    .update(updates)
    .eq('id', logId)
    .select()
    .single()

  if (error) throw error
  return data as DeploymentLog
}

export async function getDeploymentLogs(instanceId: string, limit: number = 10) {
  const { data, error } = await masterSupabase
    .from('deployment_logs')
    .select('*')
    .eq('cms_instance_id', instanceId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as DeploymentLog[]
}

// =============================================
// TEMPLATE FUNCTIONS
// =============================================
export async function getCMSTemplates() {
  const { data, error } = await masterSupabase
    .from('cms_templates')
    .select('*')
    .eq('is_active', true)
    .order('category', { ascending: true })

  if (error) throw error
  return data as CMSTemplate[]
}

export async function getCMSTemplateById(templateId: string) {
  const { data, error } = await masterSupabase
    .from('cms_templates')
    .select('*')
    .eq('id', templateId)
    .single()

  if (error) throw error
  return data as CMSTemplate
}

// =============================================
// SUPABASE PROJECT FUNCTIONS
// =============================================
export async function createSupabaseProject(projectData: Omit<SupabaseProject, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await masterSupabase
    .from('supabase_projects')
    .insert([projectData])
    .select()
    .single()

  if (error) throw error
  return data as SupabaseProject
}

export async function getSupabaseProjectByInstance(instanceId: string) {
  const { data, error } = await masterSupabase
    .from('supabase_projects')
    .select('*')
    .eq('cms_instance_id', instanceId)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data as SupabaseProject | null
}

export async function updateSupabaseProject(projectId: string, updates: Partial<SupabaseProject>) {
  const { data, error } = await masterSupabase
    .from('supabase_projects')
    .update(updates)
    .eq('id', projectId)
    .select()
    .single()

  if (error) throw error
  return data as SupabaseProject
}

// =============================================
// NOTIFICATION FUNCTIONS
// =============================================
export async function createNotification(notificationData: Omit<Notification, 'id' | 'created_at'>) {
  const { data, error } = await masterSupabase
    .from('notifications')
    .insert([notificationData])
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

export async function getNotifications(limit: number = 20, unreadOnly: boolean = false) {
  let query = masterSupabase
    .from('notifications')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (unreadOnly) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const { data, error } = await masterSupabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .select()
    .single()

  if (error) throw error
  return data as Notification
}

// =============================================
// SETTINGS FUNCTIONS
// =============================================
export async function getMasterSetting(key: string): Promise<any> {
  const { data, error } = await masterSupabase
    .from('master_settings')
    .select('value')
    .eq('key', key)
    .single()

  if (error && error.code !== 'PGRST116') throw error
  return data?.value || null
}

export async function setMasterSetting(key: string, value: any, description?: string) {
  const { data, error } = await masterSupabase
    .from('master_settings')
    .upsert([{ key, value, description }], { 
      onConflict: 'key'
    })
    .select()
    .single()

  if (error) throw error
  return data as MasterSetting
}

export async function getAllMasterSettings() {
  const { data, error } = await masterSupabase
    .from('master_settings')
    .select('*')
    .order('key', { ascending: true })

  if (error) throw error
  return data as MasterSetting[]
}

// =============================================
// ANALYTICS FUNCTIONS
// =============================================
export async function recordInstanceMetric(instanceId: string, metricType: string, metricValue: number, metadata?: Record<string, any>) {
  const { data, error } = await masterSupabase
    .from('instance_analytics')
    .insert([{
      cms_instance_id: instanceId,
      metric_type: metricType,
      metric_value: metricValue,
      metadata: metadata || {}
    }])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getInstanceMetrics(instanceId: string, metricType?: string, days: number = 30) {
  let query = masterSupabase
    .from('instance_analytics')
    .select('*')
    .eq('cms_instance_id', instanceId)
    .gte('recorded_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
    .order('recorded_at', { ascending: false })

  if (metricType) {
    query = query.eq('metric_type', metricType)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// =============================================
// UTILITY FUNCTIONS
// =============================================
export async function testMasterConnection() {
  try {
    const { data, error } = await masterSupabase
      .from('cms_instances')
      .select('count')
      .limit(1)

    if (error) throw error
    return { success: true, message: 'Master dashboard connection successful' }
  } catch (error) {
    return { success: false, message: (error as Error).message }
  }
}

// Get dashboard statistics
export async function getDashboardStats() {
  try {
    const [instancesResult, deploymentsResult, templatesResult] = await Promise.all([
      masterSupabase.from('cms_instances').select('count'),
      masterSupabase.from('deployment_logs').select('count'),
      masterSupabase.from('cms_templates').select('count').eq('is_active', true)
    ])

    const activeInstances = await masterSupabase
      .from('cms_instances')
      .select('count')
      .eq('status', 'active')

    const successfulDeployments = await masterSupabase
      .from('deployment_logs')
      .select('count')
      .eq('status', 'success')

    return {
      totalInstances: instancesResult.count || 0,
      activeInstances: activeInstances.count || 0,
      totalDeployments: deploymentsResult.count || 0,
      successfulDeployments: successfulDeployments.count || 0,
      availableTemplates: templatesResult.count || 0
    }
  } catch (error) {
    console.error('Error getting dashboard stats:', error)
    return {
      totalInstances: 0,
      activeInstances: 0,
      totalDeployments: 0,
      successfulDeployments: 0,
      availableTemplates: 0
    }
  }
} 