# 🗄️ Supabase Database Setup Guide

This guide will help you set up your Supabase database for the StreamLine CMS and migrate from localStorage to cloud storage.

## 📋 Prerequisites

1. **Supabase Account**: Sign up at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project
3. **Environment Variables**: You'll need your Supabase URL and anon key

## 🚀 Step 1: Run the Database Schema

### Option A: SQL Editor (Recommended)
1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Copy and paste the entire contents of `database-schema.sql`
4. Click **Run** to execute the schema

### Option B: Command Line
```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link to your project (replace with your project ref)
supabase link --project-ref your-project-ref

# Run the migration
supabase db push
```

## 🔧 Step 2: Environment Variables

Create a `.env.local` file in your project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# Optional: For server-side operations
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## 📊 Step 3: Install Supabase Client

```bash
npm install @supabase/supabase-js
```

## 🔄 Step 4: Migration Strategy

### Current localStorage Structure → Database Mapping

| localStorage Key | Database Table | Notes |
|------------------|----------------|-------|
| `cms_pages` | `pages` + `page_blocks` | Pages split into main record + blocks |
| `cms-templates-{theme}` | `templates` + `template_blocks` | Templates per theme |
| `cms_navigation` | `navigation_items` | Navigation structure |
| Theme settings | `site_settings` | Global site configuration |

### Data Migration Process

1. **Export Current Data**: Use browser console to export localStorage
2. **Transform Format**: Convert to database-compatible format
3. **Import to Supabase**: Use the provided migration functions
4. **Test & Verify**: Ensure data integrity
5. **Switch to Database**: Update CMS to use Supabase

## 🗃️ Database Schema Explanation

### Core Tables

#### **pages**
- Stores page metadata and theme assignment
- Links to header, footer, and page templates
- Supports draft/published workflow

#### **templates** 
- Theme-specific templates (header, footer, page, post)
- Each theme has its own templates in the database
- Supports default template assignment

#### **page_blocks** & **template_blocks**
- Stores the actual drag-and-drop components
- JSONB props field for component configuration
- Ordered by `order_index` for proper rendering

#### **navigation_items**
- Site navigation structure
- Supports internal (page links) and external URLs
- Ordered and visibility controlled

#### **site_settings**
- Global site configuration
- Flexible JSONB storage for any settings
- Current theme selection stored here

### Key Features

✅ **Row Level Security (RLS)**: Secure access control  
✅ **Performance Indexes**: Optimized for common queries  
✅ **Auto Timestamps**: Automatic created_at/updated_at  
✅ **Cascading Deletes**: Clean data relationships  
✅ **Helpful Views**: Pre-built queries for common operations  

## 🔍 Useful Queries

### Get Page with All Content
```sql
-- Get complete page data
SELECT 
  p.*,
  ht.name as header_template,
  ft.name as footer_template,
  pt.name as page_template,
  pb.component_type,
  pb.props,
  pb.order_index
FROM pages p
LEFT JOIN templates ht ON p.header_template_id = ht.id
LEFT JOIN templates ft ON p.footer_template_id = ft.id  
LEFT JOIN templates pt ON p.page_template_id = pt.id
LEFT JOIN page_blocks pb ON p.id = pb.page_id
WHERE p.slug = 'home'
ORDER BY pb.order_index;
```

### Get Templates for Theme
```sql
-- Get all templates for a specific theme
SELECT * FROM templates 
WHERE theme_id = 'default' 
ORDER BY type, name;
```

### Get Navigation Structure
```sql
-- Get navigation with page details
SELECT 
  n.label,
  n.type,
  n.href,
  p.title as page_title,
  p.slug as page_slug
FROM navigation_items n
LEFT JOIN pages p ON n.page_id = p.id
WHERE n.is_visible = true
ORDER BY n.order_index;
```

## 🔐 Security Considerations

### RLS Policies Summary

- **Public Access**: Published pages, visible navigation, templates
- **Authenticated Access**: Full CRUD for admin users
- **Secure by Default**: All tables have RLS enabled

### Admin Authentication

You'll need to implement authentication for admin users. Options:

1. **Supabase Auth**: Use built-in authentication
2. **Custom Auth**: Integrate with your existing auth system
3. **API Keys**: For headless/API-only access

## 🚀 Next Steps

After setting up the database:

1. **Create Supabase Client**: Set up the connection in your app
2. **Update CMS Functions**: Replace localStorage calls with Supabase calls
3. **Test Migration**: Verify all functionality works with database
4. **Deploy**: Push your changes to production

## 📝 Migration Checklist

- [ ] Supabase project created
- [ ] Database schema executed
- [ ] Environment variables configured
- [ ] Supabase client installed
- [ ] Test connection established
- [ ] Data migration planned
- [ ] CMS functions updated
- [ ] Authentication implemented
- [ ] Production deployment ready

---

**Need Help?** Check the Supabase documentation or our troubleshooting guide for common issues. 