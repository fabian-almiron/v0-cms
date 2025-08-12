export interface PageBlock {
  id: string
  type: ComponentType
  order: number
  props?: Record<string, any>
  isVisible?: boolean
}

export interface Page {
  id: string
  slug: string
  title: string
  description?: string
  blocks: PageBlock[]
  isPublished: boolean
  headerTemplateId?: string
  footerTemplateId?: string
  createdAt: string
  updatedAt: string
}

export type ComponentType = 
  | 'Hero'
  | 'Features' 
  | 'Testimonials'
  | 'Pricing'
  | 'Blog'
  | 'CTA'
  | 'Header'
  | 'Footer'
  | 'DNDArea'
  | 'Button'
  | 'Card'
  | 'Badge'
  | 'Separator'
  | 'Progress'

export interface ComponentInfo {
  type: ComponentType
  name: string
  description: string
  category: 'content-blocks' | 'layout' | 'ui-primitives' | 'page-templates'
  icon: string
  previewImage?: string
}

export interface DraggedComponent {
  type: ComponentType
  isNewComponent: boolean
  sourceId?: string
}

// Template types
export type TemplateType = 'header' | 'footer' | 'page' | 'post'

export interface Template {
  id: string
  name: string
  type: TemplateType
  description?: string
  blocks: PageBlock[]
  isDefault?: boolean
  createdAt: string
  updatedAt: string
}

export interface TemplateAssignment {
  pageId: string
  headerTemplateId?: string
  footerTemplateId?: string
  pageTemplateId?: string
}

// Database types for Supabase
export interface DbPage {
  id: string
  slug: string
  title: string
  description: string | null
  is_published: boolean
  created_at: string
  updated_at: string
}

export interface DbPageBlock {
  id: string
  page_id: string
  component_type: ComponentType
  order_index: number
  props: Record<string, any> | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

// Database types for templates
export interface DbTemplate {
  id: string
  name: string
  type: TemplateType
  description: string | null
  blocks: PageBlock[]
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface DbTemplateAssignment {
  id: string
  page_id: string
  header_template_id: string | null
  footer_template_id: string | null
  page_template_id: string | null
  created_at: string
  updated_at: string
} 