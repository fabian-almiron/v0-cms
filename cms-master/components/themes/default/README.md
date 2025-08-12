# Default Theme

The Default theme provides a clean, professional design with modern components and enhanced JavaScript functionality.

## Theme Structure

```
components/themes/default/
├── ui/                     # UI components (Header, Footer, Hero, etc.)
├── page-templates/         # Page template documentation
├── register-blocks.tsx     # Theme configuration and component registry
├── tailwind.config.ts      # Theme-specific Tailwind configuration
├── styles.css             # Theme CSS with JavaScript-enhanced styles
├── main.js                # Theme JavaScript functionality
└── README.md              # This file
```

## JavaScript Functionality

### Features Included

The `main.js` file provides enhanced interactivity:

1. **Smooth Scrolling**: Automatic smooth scrolling for anchor links
2. **Mobile Menu**: Enhanced mobile navigation with animations
3. **Scroll Animations**: Fade-in animations on scroll using Intersection Observer
4. **Form Enhancements**: Floating labels, validation, and improved UX
5. **Utility Functions**: Debounce, viewport detection, custom events

### How It Works

The JavaScript is loaded dynamically when the theme is activated:

1. **Automatic Loading**: The theme system loads `main.js` from `/themes/default/main.js`
2. **Namespace**: All functionality is contained in `window.DefaultTheme` 
3. **Auto-Init**: JavaScript initializes automatically when DOM is ready
4. **Cleanup**: Previous theme JavaScript is cleaned up when switching themes

### Using JavaScript Features

#### 1. Smooth Scrolling
Any anchor link (`<a href="#section">`) will automatically use smooth scrolling.

#### 2. Mobile Menu
Add these data attributes to your Header component:
```html
<button data-mobile-menu-button>Menu</button>
<nav data-mobile-menu>...</nav>
<div data-mobile-menu-overlay>...</div>
```

#### 3. Scroll Animations
Add `data-animate` to any element for fade-in on scroll:
```html
<div data-animate>This will fade in when scrolled into view</div>
```

#### 4. Form Enhancements
Wrap form fields with the `.form-field` class:
```html
<div class="form-field">
  <input type="text" required />
  <label>Your Name</label>
</div>
```

### Customizing JavaScript

You can extend or modify the theme's JavaScript functionality:

1. **Edit** `components/themes/default/main.js`
2. **Run** `npm run build:themes` to copy changes to public directory
3. **Refresh** your browser to see changes

### CSS Classes Added by JavaScript

The following CSS classes are dynamically added:

- `.animate-in` - Applied when elements come into view
- `.has-value` - Applied to form inputs with content
- `.error` - Applied to invalid form fields
- `.open` - Applied to open mobile menus
- `.menu-open` - Applied to body when mobile menu is open

### Theme Utilities

Access utility functions via `window.DefaultTheme.utils`:

```javascript
// Debounce a function
const debouncedFunction = window.DefaultTheme.utils.debounce(myFunction, 300);

// Check if element is in viewport
const isVisible = window.DefaultTheme.utils.isInViewport(element);

// Trigger custom events
window.DefaultTheme.utils.triggerEvent(element, 'customEvent', { data: 'value' });
```

## Development Workflow

1. **Edit JavaScript**: Modify `components/themes/default/main.js`
2. **Edit Styles**: Modify `components/themes/default/styles.css`
3. **Build Assets**: Run `npm run build:themes`
4. **Test**: Refresh your browser or switch themes to see changes

## Best Practices

1. **Use Data Attributes**: Prefer `data-*` attributes for JavaScript hooks
2. **Namespace Everything**: All JavaScript is contained in `window.DefaultTheme`
3. **Clean Up**: The theme automatically cleans up when switching
4. **Mobile First**: All features work across device sizes
5. **Progressive Enhancement**: Features gracefully degrade without JavaScript

## Integration with React Components

While themes use JavaScript for enhanced functionality, remember that:

- React components handle their own interactivity
- JavaScript enhances the overall page experience
- Use JavaScript for cross-component features (scroll, navigation, etc.)
- Keep component-specific logic in React components 