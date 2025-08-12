// Client-side theme discovery (for when fs is not available)

export async function discoverThemesClient(): Promise<string[]> {
  try {
    // Try to fetch from API endpoint that does the scanning
    const response = await fetch('/api/themes/discover')
    if (response.ok) {
      const { themes } = await response.json()
      return themes
    }
  } catch (error) {
    console.warn('Failed to discover themes via API:', error)
  }
  
  // Fallback to hardcoded list
  return ['default', 'modern']
} 