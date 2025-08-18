'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { ComponentType, ComponentInfo } from './cms-types'

// Extend Window interface for theme cleanup
declare global {
  interface Window {
    currentThemeCleanup?: () => void;
    [key: string]: any; // For theme namespaces like DefaultTheme, ModernTheme, etc.
  }
}

// Theme interface
export interface Theme {
  id: string
  name: string
  description: string
  author: string
  version: string
  componentRegistry: Record<string, React.ComponentType<any>>
  componentInfo: ComponentInfo[]
  getComponent: (type: ComponentType) => React.ComponentType<any> | undefined
  renderComponent: (type: ComponentType, props?: Record<string, any>) => React.ReactNode
  getComponentInfo: (type: ComponentType) => ComponentInfo | undefined
  getAllComponents: () => ComponentInfo[]
  getComponentsByCategory: (category: string) => ComponentInfo[]
}

import { discoverThemesClient } from './theme-registry'

// Available themes - now dynamically discovered
let availableThemes: string[] = ['default', 'modern'] // Initial fallback

// Load themes dynamically
async function loadAvailableThemes(): Promise<string[]> {
  try {
    const discoveredThemes = await discoverThemesClient()
    availableThemes = discoveredThemes
    return discoveredThemes
  } catch (error) {
    console.warn('Failed to discover themes, using fallback:', error)
    return availableThemes
  }
}

// Get available themes (for external access)
export function getAvailableThemes(): string[] {
  return [...availableThemes]
}

// Theme context
interface ThemeContextType {
  currentTheme: Theme | null
  availableThemes: string[]
  switchTheme: (themeId: string) => Promise<void>
  loading: boolean
  error: string | null
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
}

export function ThemeProvider({ children, defaultTheme = 'default' }: ThemeProviderProps) {
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dynamicThemes, setDynamicThemes] = useState<string[]>(availableThemes)

  // Load theme from database or use default
  const getStoredTheme = async () => {
    if (typeof window !== 'undefined') {
      try {
        // Try to get from database first
        const { getCurrentSiteId } = await import('./site-config')
        const { getSiteSetting } = await import('./supabase')
        
        const siteId = getCurrentSiteId()
        if (siteId) {
          const themeFromDb = await getSiteSetting(siteId, 'currentTheme')
          if (themeFromDb && availableThemes.includes(themeFromDb)) {
            return themeFromDb
          }
        }
        
        // Fall back to localStorage for migration purposes
        const themeFromLocalStorage = localStorage.getItem('cms-current-theme')
        if (themeFromLocalStorage && availableThemes.includes(themeFromLocalStorage)) {
          // Migrate to database if we have a site ID
          if (siteId) {
            try {
              const { setSiteSetting } = await import('./supabase')
              await setSiteSetting(siteId, 'currentTheme', themeFromLocalStorage)
              // Clear localStorage after successful migration
              localStorage.removeItem('cms-current-theme')
            } catch (err) {
              console.warn('Failed to migrate theme setting to database:', err)
            }
          }
          return themeFromLocalStorage
        }
      } catch (err) {
        console.warn('Failed to load theme from database:', err)
      }
    }
    return defaultTheme
  }

  // Save theme to database
  const saveTheme = async (themeId: string) => {
    if (typeof window !== 'undefined') {
      try {
        const { getCurrentSiteId } = await import('./site-config')
        const { setSiteSetting } = await import('./supabase')
        
        const siteId = getCurrentSiteId()
        if (siteId) {
          await setSiteSetting(siteId, 'currentTheme', themeId)
          console.log(`Theme "${themeId}" saved to database`)
        } else {
          // Fallback to localStorage if no site ID
          localStorage.setItem('cms-current-theme', themeId)
          console.log(`Theme "${themeId}" saved to localStorage (no site configured)`)
        }
      } catch (err) {
        console.error('Failed to save theme to database:', err)
        // Fallback to localStorage
        localStorage.setItem('cms-current-theme', themeId)
      }
    }
  }

  // Load theme styles and scripts dynamically
  const loadThemeAssets = async (themeId: string) => {
    try {
      // Remove existing theme styles
      const existingStyles = document.querySelectorAll('[data-theme-styles]')
      existingStyles.forEach(style => style.remove())

      // Remove existing theme scripts
      const existingScripts = document.querySelectorAll('[data-theme-script]')
      existingScripts.forEach(script => script.remove())

      // Cleanup previous theme JavaScript
      if (window.currentThemeCleanup) {
        window.currentThemeCleanup()
        window.currentThemeCleanup = undefined
      }

      // Load theme styles from static file
      const stylesResponse = await fetch(`/themes/${themeId}/styles.css`)
      if (stylesResponse.ok) {
        const css = await stylesResponse.text()
        const styleElement = document.createElement('style')
        styleElement.setAttribute('data-theme-styles', themeId)
        styleElement.textContent = css
        document.head.appendChild(styleElement)
        console.log(`Loaded styles for theme: ${themeId}`)
      } else {
        console.warn(`Failed to load styles for theme "${themeId}": ${stylesResponse.status}`)
      }

      // Load theme JavaScript from static file
      const scriptResponse = await fetch(`/themes/${themeId}/main.js`)
      if (scriptResponse.ok) {
        const js = await scriptResponse.text()
        const scriptElement = document.createElement('script')
        scriptElement.setAttribute('data-theme-script', themeId)
        scriptElement.textContent = js
        document.head.appendChild(scriptElement)
        console.log(`Loaded JavaScript for theme: ${themeId}`)
        
        // Store cleanup function if theme provides one
        const themeNamespaceKey = `${themeId.charAt(0).toUpperCase() + themeId.slice(1)}Theme`
        const themeNamespace = window[themeNamespaceKey]
        if (themeNamespace && typeof themeNamespace.cleanup === 'function') {
          window.currentThemeCleanup = themeNamespace.cleanup.bind(themeNamespace)
        }
      } else {
        console.warn(`No JavaScript file found for theme "${themeId}" (this is optional)`)
      }
    } catch (err) {
      console.warn(`Failed to load assets for theme "${themeId}":`, err)
    }
  }

  // Load theme dynamically
  const loadTheme = async (themeId: string): Promise<Theme | null> => {
    try {
      setLoading(true)
      setError(null)

      // Load theme assets (styles and scripts)
      if (typeof window !== 'undefined') {
        await loadThemeAssets(themeId)
      }

      // Dynamic import of theme registry
      const themeModule = await import(`../components/themes/${themeId}/register-blocks`)
      
      const theme: Theme = {
        id: themeId,
        name: themeModule.themeName,
        description: themeModule.themeDescription,
        author: themeModule.themeAuthor,
        version: themeModule.themeVersion,
        componentRegistry: themeModule.componentRegistry,
        componentInfo: themeModule.componentInfo,
        getComponent: themeModule.getComponent,
        renderComponent: themeModule.renderComponent,
        getComponentInfo: themeModule.getComponentInfo,
        getAllComponents: themeModule.getAllComponents,
        getComponentsByCategory: themeModule.getComponentsByCategory,
      }

      return theme
    } catch (err) {
      console.error(`Failed to load theme "${themeId}":`, err)
      setError(`Failed to load theme "${themeId}"`)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Switch theme function
  const switchTheme = async (themeId: string) => {
    if (!dynamicThemes.includes(themeId)) {
      setError(`Theme "${themeId}" not found`)
      return
    }

    const theme = await loadTheme(themeId)
    if (theme) {
      setCurrentTheme(theme)
      await saveTheme(themeId)
    }
  }

  // Initialize theme discovery and load theme on mount
  useEffect(() => {
    const initTheme = async () => {
      // First discover available themes
      const discoveredThemes = await loadAvailableThemes()
      setDynamicThemes(discoveredThemes)
      
      // Then load the stored theme
      const storedTheme = await getStoredTheme()
      await switchTheme(storedTheme)
    }
    
    initTheme()
  }, [])

  const value: ThemeContextType = {
    currentTheme,
    availableThemes: dynamicThemes,
    switchTheme,
    loading,
    error,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Hook to use theme context
export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Convenience hooks
export function useCurrentTheme() {
  const { currentTheme } = useTheme()
  return currentTheme
}

export function useThemeComponents() {
  const { currentTheme } = useTheme()
  return {
    componentRegistry: currentTheme?.componentRegistry || {},
    componentInfo: currentTheme?.componentInfo || [],
    getComponent: currentTheme?.getComponent || (() => undefined),
    renderComponent: currentTheme?.renderComponent || (() => null),
    getComponentInfo: currentTheme?.getComponentInfo || (() => undefined),
    getAllComponents: currentTheme?.getAllComponents || (() => []),
    getComponentsByCategory: currentTheme?.getComponentsByCategory || (() => []),
  }
} 