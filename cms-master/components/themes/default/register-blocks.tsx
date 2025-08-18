import { ComponentInfo } from '@/lib/cms-types'

// Import all UI components and their metadata explicitly
import Hero, { metadata as HeroMetadata } from './ui/Hero'
import Features, { metadata as FeaturesMetadata } from './ui/Features'
import Testimonials, { metadata as TestimonialsMetadata } from './ui/Testimonials'
import Pricing, { metadata as PricingMetadata } from './ui/Pricing'
import Blog, { metadata as BlogMetadata } from './ui/Blog'
import CTA, { metadata as CTAMetadata } from './ui/CTA'
import Header, { metadata as HeaderMetadata } from './ui/Header'
import Footer, { metadata as FooterMetadata } from './ui/Footer'
import DNDArea, { metadata as DNDAreaMetadata } from './ui/DNDArea'

// Theme Configuration
export const themeName = 'Default'
export const themeDescription = 'Clean, professional design with modern components'
export const themeAuthor = 'Page Builder CMS'
export const themeVersion = '1.0.0'

// Component registry
export const componentRegistry = {
  Hero,
  Features,
  Testimonials,
  Pricing,
  Blog,
  CTA,
  Header,
  Footer,
  DNDArea,
} as const

// Component metadata - imported from each component
export const componentInfo: ComponentInfo[] = [
  HeroMetadata,
  FeaturesMetadata,
  TestimonialsMetadata,
  PricingMetadata,
  BlogMetadata,
  CTAMetadata,
  HeaderMetadata,
  FooterMetadata,
  DNDAreaMetadata,
]

// Helper functions
export const getComponent = (type: string) => componentRegistry[type as keyof typeof componentRegistry]
export const renderComponent = (type: string, props: Record<string, any> = {}) => {
  const Component = getComponent(type)
  return Component ? <Component {...props} /> : null
}
export const getComponentInfo = (type: string) => componentInfo.find(info => info.type === type)
export const getAllComponents = () => componentInfo
export const getComponentsByCategory = (category: string) => componentInfo.filter(info => info.category === category)

// Development logging
if (process.env.NODE_ENV === 'development') {
  console.log('🎨 Registered UI components:', Object.keys(componentRegistry))
  console.log('📋 Component metadata:', componentInfo.map(m => `${m.type}: ${m.name}`))
} 