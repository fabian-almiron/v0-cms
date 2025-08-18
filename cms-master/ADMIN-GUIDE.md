# StreamLine CMS Admin Guide

Welcome to your StreamLine CMS admin interface! This guide will help you navigate and use all the features of your new content management system.

## 🚀 Getting Started

### Access Your Admin Panel
Visit `/admin` to access your CMS dashboard. You'll see a clean, modern interface with:

- **Sidebar Navigation**: Access all admin features
- **Dashboard**: Overview of your site's performance
- **Quick Actions**: Common tasks at your fingertips

## 📊 Dashboard Overview

The dashboard (`/admin`) provides:

### Key Metrics
- **Total Pages**: Number of pages in your CMS
- **Published Pages**: Live pages visible to visitors
- **Draft Pages**: Unpublished pages in development
- **Page Views**: Traffic analytics (coming soon)

### Quick Actions
- **Open Page Builder**: Jump directly to the drag-and-drop editor
- **Manage Pages**: View and organize all your pages
- **View Live Site**: Preview your published website

### Recent Pages
- See your most recently updated pages
- Quick access to edit any page
- Status indicators (Published/Draft)

## 📄 Page Management (`/admin/pages`)

### Page Overview
- **Search & Filter**: Find pages quickly by title or slug
- **Status Tracking**: See which pages are published or drafts
- **Last Updated**: Track when pages were modified

### Page Actions
For each page, you can:
- **Edit**: Open in the page builder
- **Preview**: View the live page
- **Duplicate**: Copy a page as a starting point
- **Delete**: Remove pages (with confirmation)

### Creating New Pages (`/admin/pages/new`)

#### Page Setup Form
1. **Page Title**: The main title (auto-generates URL slug)
2. **URL Slug**: Customize the page URL (yoursite.com/slug)
3. **Description**: Optional SEO description
4. **Publish Status**: Choose to publish immediately or save as draft

#### Auto-Generated Features
- **Smart Slugs**: URLs automatically generated from titles
- **SEO Ready**: Proper meta descriptions and URL structure
- **Validation**: Prevents duplicate slugs and invalid characters

## 🎨 Page Builder (`/admin/builder`)

### Interface Layout

#### Left Sidebar: Component Palette
**Content Components:**
- **Hero**: Main landing section with CTA and image
- **Features**: Showcase key product features
- **Blog**: Display latest blog posts

**Marketing Components:**
- **Testimonials**: Customer reviews and social proof
- **Pricing**: Pricing plans and subscription tiers
- **CTA**: Call-to-action sections for conversions

#### Main Area: Canvas
- **Drag & Drop**: Drag components from sidebar to canvas
- **Live Preview**: See exactly how your page will look
- **Component Controls**: Hover over components for options

#### Component Controls
Each component on the canvas has:
- **Drag Handle**: Reorder components by dragging
- **Visibility Toggle**: Show/hide components (eye icon)
- **Edit Button**: Customize component settings (coming soon)
- **Delete Button**: Remove components (trash icon)

### Building Pages

#### Step 1: Add Components
1. Drag components from the left sidebar
2. Drop them anywhere on the canvas
3. Components automatically organize vertically

#### Step 2: Reorder Components
1. Hover over any component
2. Drag using the grip handle
3. Drop in new position

#### Step 3: Manage Visibility
- Toggle component visibility without deleting
- Hidden components show with reduced opacity
- Perfect for testing different layouts

#### Step 4: Preview & Save
- **Builder Tab**: Edit mode with all controls
- **Preview Tab**: See final result without controls
- **Save Button**: Persist changes to database

## 📈 Analytics (`/admin/analytics`)

*Coming Soon* - Comprehensive analytics dashboard featuring:
- Real-time visitor tracking
- Page performance metrics
- Traffic source analysis
- Content engagement statistics

## ⚙️ Settings (`/admin/settings`)

### Site Settings
- **Site Name**: Your website's main title
- **Site Description**: Default meta description
- **Site URL**: Your domain configuration

### Database Settings
- **Connection Status**: Supabase integration health
- **Project ID**: Your Supabase project identifier
- **Table Statistics**: Database usage overview

### Theme & Appearance
- **Dark/Light Mode**: Toggle interface theme
- **Compact Mode**: Reduce spacing for more content
- **Primary Colors**: Customize CMS accent colors

### Security Settings
- **Two-Factor Authentication**: Enhanced login security
- **Login Notifications**: Alert for new sessions
- **Session Timeout**: Auto-logout configuration

## 🎯 Best Practices

### Page Organization
1. **Consistent Naming**: Use clear, descriptive page titles
2. **SEO-Friendly URLs**: Keep slugs short and descriptive
3. **Draft First**: Build pages as drafts before publishing

### Component Usage
1. **Hero First**: Always start with a Hero component
2. **Logical Flow**: Order components for user journey
3. **CTA Placement**: End pages with call-to-action components

### Content Strategy
1. **Mobile First**: All components are responsive by default
2. **Loading Performance**: Fewer components = faster loading
3. **User Experience**: Test your pages in Preview mode

## 🔧 Advanced Features

### Component Properties
*Coming Soon* - Each component will support:
- Custom text and images
- Color scheme overrides  
- Animation settings
- Custom CSS classes

### Template System
*Coming Soon* - Save and reuse:
- Page templates
- Component combinations
- Brand-specific layouts

### Version Control
*Coming Soon* - Track changes with:
- Page history
- Undo/redo functionality
- Revision comparisons

## 🆘 Troubleshooting

### Common Issues

#### Components Not Dragging
- Ensure you're dragging from the component palette
- Check that you're dropping in the main canvas area
- Try refreshing the page if drag-and-drop stops working

#### Changes Not Saving
- Click the Save button in the top toolbar
- Check your internet connection
- Verify Supabase database connection in Settings

#### Page Not Displaying
- Ensure the page is Published (not Draft)
- Check the URL slug matches your navigation
- Verify components are visible (eye icon enabled)

### Getting Help
- Check the browser console for error messages
- Review the CMS-README.md for technical details
- Ensure all Supabase tables are properly configured

## 🚀 Quick Start Workflow

### Creating Your First Page
1. **Navigate** to `/admin/pages`
2. **Click** "New Page" button
3. **Fill out** page details form
4. **Click** "Create & Build Page"
5. **Drag** Hero component to canvas
6. **Add** Features, Pricing, and CTA components
7. **Preview** your page
8. **Save** your changes
9. **Publish** when ready!

### Daily CMS Workflow
1. **Check Dashboard** for recent activity
2. **Review Pages** that need updates
3. **Edit** content in Page Builder
4. **Preview** changes before publishing
5. **Monitor** analytics for performance

---

**Need More Help?** Check the technical documentation in `CMS-README.md` or review the component registry in `lib/component-registry.tsx` for development details. 