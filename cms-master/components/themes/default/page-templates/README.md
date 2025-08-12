# Page Templates

This folder is for **custom page templates** - complete page layouts with custom code, similar to WordPress theme templates.

## Difference from UI Blocks

- **UI Blocks** (`/ui/` folder): Individual components for drag-and-drop building (Hero, Features, CTA, etc.)
- **Page Templates** (this folder): Complete page layouts with custom code and functionality

## Examples of Page Templates

- `landing-page.tsx` - Complete landing page template
- `blog-post.tsx` - Blog post template with custom layout
- `product-page.tsx` - E-commerce product page template
- `contact-page.tsx` - Contact page with form handling

## How Page Templates Work

1. **Custom Code**: Can include complex logic, API calls, form handling, etc.
2. **Pre-built Layouts**: Complete page designs that users can select
3. **DND Areas**: Can include DNDArea components where users can add their own blocks
4. **Theme-specific**: Each theme has its own page templates with unique styling

## Example Page Template Structure

```typescript
// landing-page.tsx
export default function LandingPageTemplate({ 
  title, 
  subtitle, 
  features 
}: LandingPageProps) {
  return (
    <div className="landing-page">
      <Hero title={title} subtitle={subtitle} />
      
      {/* Custom coded section */}
      <section className="custom-features">
        {features.map(feature => (
          <FeatureCard key={feature.id} {...feature} />
        ))}
      </section>
      
      {/* DND Area for user customization */}
      <DNDArea />
      
      <CTA />
    </div>
  )
}
```

This allows for both:
- **Drag-and-drop building** with UI blocks
- **Pre-designed templates** with custom functionality 