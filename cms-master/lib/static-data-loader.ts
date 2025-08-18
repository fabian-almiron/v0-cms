import { loadNavigationFromDatabase, loadPagesFromDatabase, loadTemplatesFromDatabase } from './cms-data'

// Load data from static files (for frontend)
export async function loadStaticNavigation() {
  try {
    const response = await fetch('/generated/navigation.json')
    if (!response.ok) throw new Error('Navigation file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static navigation, falling back to database')
    return await loadNavigationFromDatabase()
  }
}

export async function loadStaticPages() {
  try {
    const response = await fetch('/generated/pages.json')
    if (!response.ok) throw new Error('Pages file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static pages, falling back to database')
    return await loadPagesFromDatabase()
  }
}

export async function loadStaticTemplates() {
  try {
    const response = await fetch('/generated/templates.json')
    if (!response.ok) throw new Error('Templates file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static templates, falling back to database')
    return await loadTemplatesFromDatabase()
  }
}

export async function loadStaticSettings() {
  try {
    const response = await fetch('/generated/settings.json')
    if (!response.ok) throw new Error('Settings file not found')
    return await response.json()
  } catch (error) {
    console.warn('Failed to load static settings, falling back to database')
    return {}
  }
} 