import { ComponentType, ComponentInfo } from './cms-types'

// Legacy component registry - now we use theme-based registries
// This is kept for backward compatibility and fallback

// Fallback components (in case theme fails to load)
const FallbackComponent = ({ type }: { type: string }) => (
  <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
    <p className="text-gray-500">Component "{type}" not found</p>
    <p className="text-sm text-gray-400">Theme may not be loaded</p>
  </div>
)

// Legacy component registry (minimal fallback)
export const componentRegistry = {} as const

// Legacy component info - now handled by theme registries
export const componentInfo: ComponentInfo[] = []

// Helper functions - these now should use theme context
// These are kept for backward compatibility

// Helper function to get component by type (deprecated - use theme context)
export function getComponent(type: ComponentType) {
  console.warn('getComponent is deprecated. Use theme context instead.')
  return null
}

// Helper function to render a component (deprecated - use theme context)  
export function renderComponent(type: ComponentType, props: Record<string, any> = {}) {
  console.warn('renderComponent is deprecated. Use theme context instead.')
  return <FallbackComponent type={type} />
}

// Helper function to get component info (deprecated - use theme context)
export function getComponentInfo(type: ComponentType): ComponentInfo | undefined {
  console.warn('getComponentInfo is deprecated. Use theme context instead.')
  return undefined
} 