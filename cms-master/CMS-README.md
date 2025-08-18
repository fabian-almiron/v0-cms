# Page Builder CMS

A powerful drag-and-drop content management system built with Next.js, React, and Supabase. Create and manage pages by dragging and dropping pre-built components.

## 🚀 Features

- **Drag & Drop Interface**: Intuitive visual page builder
- **Component Library**: Pre-built, responsive components (Hero, Features, Pricing, etc.)
- **Live Preview**: See changes in real-time
- **Supabase Integration**: Database-driven content management
- **Responsive Design**: All components are mobile-friendly
- **Component Visibility**: Show/hide components without deleting
- **Reordering**: Drag to reorder components on the page

## 🏗️ Architecture

### Core Components

1. **Component Registry** (`lib/component-registry.tsx`)
   - Maps component types to React components
   - Provides metadata for the CMS interface

2. **Page Builder** (`components/cms/PageBuilder.tsx`)
   - Main drag-and-drop interface
   - Handles component placement and reordering

3. **Component Palette** (`components/cms/ComponentPalette.tsx`)
   - Sidebar with draggable components
   - Organized by category (Content, Marketing, Layout)

4. **Draggable Block** (`components/cms/DraggableBlock.tsx`)
   - Individual component wrapper with controls
   - Visibility toggle, delete, and edit functionality

5. **Page Renderer** (`components/cms/PageRenderer.tsx`)
   - Renders pages dynamically from database configuration

### Database Schema

```sql
-- Pages table
pages (
  id UUID PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Page blocks/components table
page_blocks (
  id UUID PRIMARY KEY,
  page_id UUID REFERENCES pages(id),
  component_type TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  props JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

## 🎯 How to Use

### 1. Access the CMS

Navigate to `/admin` to access the full CMS admin interface with:
- **Dashboard**: Overview and analytics
- **Pages**: Manage all your pages
- **Page Builder**: Drag-and-drop editor
- **Analytics**: Performance metrics (coming soon)
- **Settings**: Configure your CMS

👉 **See the complete [Admin Guide](ADMIN-GUIDE.md) for detailed instructions on using the CMS interface.**

### 2. Building Pages

1. **Add Components**: Drag components from the left sidebar to the main area
2. **Reorder**: Drag existing components to reorder them
3. **Toggle Visibility**: Use the eye icon to show/hide components
4. **Delete**: Use the trash icon to remove components
5. **Preview**: Switch to Preview tab to see the final result
6. **Save**: Click the Save button to persist changes

### 3. Available Components

- **Hero**: Main landing section with CTA and hero image
- **Features**: Showcase product features with icons
- **Testimonials**: Customer reviews and social proof
- **Pricing**: Pricing plans and subscription tiers  
- **Blog**: Latest blog posts and articles
- **CTA**: Call-to-action section

## 🔧 Setup with Supabase

### 1. Create Database Tables

Run this SQL in your Supabase SQL editor:

```sql
-- Create pages table
CREATE TABLE IF NOT EXISTS pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create page_blocks table
CREATE TABLE IF NOT EXISTS page_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_id UUID REFERENCES pages(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  props JSONB DEFAULT '{}',
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_page_blocks_page_id ON page_blocks(page_id);
CREATE INDEX IF NOT EXISTS idx_page_blocks_order ON page_blocks(page_id, order_index);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
```

### 2. Configure Supabase Client

1. Install Supabase client: `npm install @supabase/supabase-js`
2. Create `lib/supabase.ts` with your configuration
3. Update the functions in `lib/supabase-utils.ts` with actual Supabase calls

### 3. Implement Database Functions

Update the commented functions in `lib/supabase-utils.ts`:

```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function createPage(page: Omit<Page, 'id' | 'createdAt' | 'updatedAt'>) {
  const { data, error } = await supabase
    .from('pages')
    .insert({
      slug: page.slug,
      title: page.title,
      description: page.description,
      is_published: page.isPublished,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ... implement other functions
```

## 🎨 Adding New Components

### 1. Create the Component

Create your React component in the `components/` directory:

```tsx
// components/NewComponent.tsx
export default function NewComponent() {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        {/* Your component content */}
      </div>
    </section>
  )
}
```

### 2. Register the Component

Add it to the component registry:

```typescript
// lib/component-registry.tsx
import NewComponent from '@/components/NewComponent'

export const componentRegistry = {
  // ... existing components
  NewComponent,
}

export const componentInfo: ComponentInfo[] = [
  // ... existing components
  {
    type: 'NewComponent',
    name: 'New Component',
    description: 'Description of what this component does',
    category: 'content',
    icon: 'Star',
  },
]
```

### 3. Update Types

Add the new component type:

```typescript
// lib/cms-types.ts
export type ComponentType = 
  | 'Hero'
  | 'Features'
  // ... existing types
  | 'NewComponent'
```

## 🔧 Development Tips

### Component Best Practices

1. **Responsive Design**: Use Tailwind responsive classes
2. **Container Classes**: Use `container mx-auto px-4` for consistent spacing
3. **Section Wrapper**: Wrap in `<section>` with appropriate padding
4. **Props Support**: Design components to accept props for customization

### CMS Integration

1. **Prop Structure**: Keep props simple and JSON-serializable
2. **Default Values**: Provide sensible defaults for all props
3. **Validation**: Add prop validation for better error handling

## 🚀 Deployment

1. Set up environment variables in your hosting platform
2. Run database migrations in Supabase
3. Configure RLS policies if using authentication
4. Deploy your Next.js application

## 🔒 Security Considerations

- Configure Row Level Security (RLS) in Supabase
- Implement authentication for admin access
- Validate component props before saving
- Sanitize user inputs if allowing custom content

## 📝 Todo / Future Enhancements

- [ ] Component prop editing interface
- [ ] Undo/Redo functionality
- [ ] Component templates and presets
- [ ] Media library integration
- [ ] SEO metadata editing
- [ ] Page versioning and drafts
- [ ] Multi-language support
- [ ] Theme customization
- [ ] Component analytics

## 🤝 Contributing

1. Add new components following the established patterns
2. Update types and registry when adding components
3. Test drag-and-drop functionality
4. Ensure responsive design
5. Document component props and usage

---

**Need Help?** Check the console for any drag-and-drop issues and ensure all component types are properly registered in the component registry. 