import { Template } from './cms-types'

export const getThemeTemplateStorageKey = (themeId: string): string => {
  return `cms-templates-${themeId}`
}

// Create basic starter templates for a theme
const createStarterTemplates = (themeId: string): Template[] => {
  const now = new Date().toISOString()
  
  return [
    {
      id: `header-starter-${themeId}`,
      name: 'Basic Header',
      type: 'header',
      description: 'Simple header with navigation',
      blocks: [
        {
          id: 'header-block',
          type: 'Header',
          order: 0,
          props: {},
          isVisible: true
        }
      ],
      isDefault: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `footer-starter-${themeId}`,
      name: 'Basic Footer',
      type: 'footer',
      description: 'Simple footer with links',
      blocks: [
        {
          id: 'footer-block',
          type: 'Footer',
          order: 0,
          props: {},
          isVisible: true
        }
      ],
      isDefault: true,
      createdAt: now,
      updatedAt: now
    },
    {
      id: `page-starter-${themeId}`,
      name: 'Blank Page',
      type: 'page',
      description: 'Empty page template with DND area',
      blocks: [
        {
          id: 'page-dnd',
          type: 'DNDArea',
          order: 0,
          props: {},
          isVisible: true
        }
      ],
      isDefault: true,
      createdAt: now,
      updatedAt: now
    }
  ]
}

export const loadThemeTemplates = async (themeId: string): Promise<Template[]> => {
  try {
    // Load from database instead of localStorage
    const { loadTemplatesFromDatabase } = await import('./cms-data')
    const templates = await loadTemplatesFromDatabase()
    
    // Filter templates by theme_id if needed
    // For now, return all templates as the database handles theme separation
    return templates
  } catch (error) {
    console.error('Error loading templates from database:', error)
    
    // Fallback to creating starter templates if database fails
    const starterTemplates = createStarterTemplates(themeId)
    return starterTemplates
  }
}

export const saveThemeTemplates = (themeId: string, templates: Template[]): void => {
  const storageKey = getThemeTemplateStorageKey(themeId)
  localStorage.setItem(storageKey, JSON.stringify(templates))
}

export const getThemeTemplate = async (themeId: string, templateId: string): Promise<Template | null> => {
  const templates = await loadThemeTemplates(themeId)
  return templates.find(t => t.id === templateId) || null
}

export const getDefaultThemeTemplate = async (themeId: string, type: 'header' | 'footer' | 'page'): Promise<Template | null> => {
  const templates = await loadThemeTemplates(themeId)
  return templates.find(t => t.type === type && t.isDefault) || null
}

export const createStarterTemplatesForTheme = (themeId: string): Template[] => {
  const starterTemplates = createStarterTemplates(themeId)
  saveThemeTemplates(themeId, starterTemplates)
  return starterTemplates
} 