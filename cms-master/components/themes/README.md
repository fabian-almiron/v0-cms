# CMS Theme System

A comprehensive theme system that allows complete customization of your CMS, including components, styles, and Tailwind configurations.

## Theme Structure

Each theme is organized in the following structure:

```
/components/themes/[theme-name]/
├── page-templates/          # Page-level components (Hero, Features, etc.)
├── ui/                      # UI components (Header, Footer, etc.)
├── register-blocks.tsx      # Theme configuration and component registry
├── tailwind.config.ts       # Theme-specific Tailwind configuration
└── styles.css              # Theme-specific CSS variables and custom styles
```

## Creating a New Theme

1. **Create Theme Directory**: Create a new folder under `/components/themes/` with your theme name
2. **Component Organization**: 
   - `/page-templates/` - Components for page building (Hero, Features, CTA, etc.)
   - `/ui/` - Layout and UI components (Header, Footer, Button, etc.)
3. **Configuration Files**:
   - `register-blocks.tsx` - Define theme metadata and component registry
   - `tailwind.config.ts` - Custom Tailwind configuration
   - `styles.css` - CSS variables and custom styles

## Theme Configuration (register-blocks.tsx)

```typescript
// Theme metadata
export const themeName = 'Your Theme Name'
export const themeDescription = 'Description of your theme'
export const themeAuthor = 'Your Name'
export const themeVersion = '1.0.0'

// Component registry
export const componentRegistry = {
  Hero: YourHeroComponent,
  Features: YourFeaturesComponent,
  // ... other components
}

// Component metadata for the page builder
export const componentInfo: ComponentInfo[] = [
  {
    type: 'Hero',
    name: 'Hero Section',
    category: 'page-templates',
    icon: 'Zap',
    description: 'Eye-catching hero section'
  },
  // ... other component info
]
```

## Tailwind Configuration

Each theme can have its own Tailwind configuration with custom:
- **Colors**: Define your theme's color palette using CSS variables
- **Typography**: Custom fonts and text styles  
- **Spacing**: Theme-specific spacing scales
- **Border Radius**: Consistent border radius values
- **Animations**: Custom keyframes and animations

### Example tailwind.config.ts:

```typescript
import type { Config } from "tailwindcss"

const config: Config = {
  content: ['./components/themes/your-theme/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: "hsl(var(--your-theme-primary))",
        secondary: "hsl(var(--your-theme-secondary))",
        // ... more colors
      },
      fontFamily: {
        sans: ["Your Font", "sans-serif"],
      },
      // ... more customizations
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

## CSS Variables and Custom Styles

### CSS Variables
Define theme-specific CSS variables in your `styles.css`:

```css
:root {
  /* Your Theme Color Variables */
  --your-theme-primary: 220 100% 50%;
  --your-theme-secondary: 210 40% 96%;
  --your-theme-background: 0 0% 100%;
  /* ... more variables */
}

.dark {
  /* Dark mode variants */
  --your-theme-primary: 220 100% 60%;
  /* ... dark mode colors */
}
```

### Custom Classes
Create theme-specific utility classes:

```css
.your-theme-gradient {
  background: linear-gradient(135deg, 
    hsl(var(--your-theme-primary)), 
    hsl(var(--your-theme-secondary)));
}

.your-theme-card-hover {
  transition: all 0.3s ease;
}

.your-theme-card-hover:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
```

## Component Categories

Components are organized into categories for the page builder:

- **`page-templates`**: Large page sections (Hero, Features, Pricing, etc.)
- **`layout`**: Layout components (Header, Footer, DNDArea)
- **`ui-components`**: UI elements (Button, Card, Badge, etc.)

## Theme Switching

The theme system supports dynamic theme switching:
- Themes are loaded dynamically when selected
- CSS variables are automatically updated
- Component registry is switched seamlessly
- Styles are injected/removed as needed

## Best Practices

1. **CSS Variables**: Use CSS variables for colors to support automatic dark mode
2. **Consistent Naming**: Prefix your CSS variables with your theme name
3. **Component Props**: Make components flexible with comprehensive prop interfaces
4. **Responsive Design**: Ensure all components work across device sizes
5. **Accessibility**: Follow accessibility best practices in your components
6. **Performance**: Keep components lightweight and optimized

## Examples

### Default Theme
- Clean, professional design
- Blue color scheme
- Standard fonts (Inter)
- Subtle animations

### Modern Theme  
- Bold, contemporary design
- Purple/gradient color scheme
- Modern fonts (Poppins, Montserrat)
- Advanced animations and effects

## Development Workflow

1. **Copy Existing Theme**: Start by copying the `default` theme
2. **Update Metadata**: Modify `register-blocks.tsx` with your theme info
3. **Customize Styles**: Update `tailwind.config.ts` and `styles.css`
4. **Modify Components**: Customize components in `page-templates/` and `ui/`
5. **Test**: Switch themes in the CMS to test your changes
6. **Deploy**: Copy your `styles.css` to `/public/themes/[theme-name]/`

## Advanced Features

- **Theme-specific templates**: Each theme can have its own page templates
- **Component validation**: Templates validate that components exist in the current theme
- **Hot reloading**: Styles are dynamically loaded when switching themes
- **Storage separation**: Templates and pages are stored per theme 