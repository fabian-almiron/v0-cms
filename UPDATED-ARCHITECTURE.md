# 🏗️ Updated Master Dashboard Architecture

## Multi-Tenant Database Architecture

Based on your requirements, the Master Dashboard now uses **one shared database** for all CMS instances instead of creating separate Supabase projects.

## 🎯 New Architecture

```
Master Dashboard
├── 📊 Master Database (Supabase Project #1)
│   ├── cms_instances (tracks all websites)
│   ├── deployment_logs (deployment history) 
│   ├── cms_templates (available templates)
│   └── notifications (system alerts)
│
└── 🗄️ Shared CMS Database (Supabase Project #2)
    ├── sites (multi-tenant sites table)
    ├── pages (all pages from all sites)
    ├── templates (all templates from all sites)
    ├── page_blocks (all blocks from all sites)
    └── navigation_items (all navigation from all sites)
    
    Each CMS Instance Uses:
    ├── 🌐 Website 1 (site_id: uuid-1) → Vercel Deployment
    ├── 🌐 Website 2 (site_id: uuid-2) → Vercel Deployment  
    └── 🌐 Website N (site_id: uuid-n) → Vercel Deployment
```

## 🔄 How It Works

### When Creating a New Website:

1. **Master Dashboard** creates instance record
2. **Shared CMS Database** gets new site record with unique `site_id`
3. **Vercel Project** created with environment variables:
   - Same Supabase URL/keys for all instances
   - Unique `CMS_SITE_ID` for each instance
4. **Each CMS instance** automatically filters data by `site_id`

### Multi-Tenant Data Isolation:

```sql
-- All CMS queries automatically filter by site_id
SELECT * FROM pages WHERE site_id = 'current-site-uuid';
SELECT * FROM templates WHERE site_id = 'current-site-uuid';
SELECT * FROM page_blocks WHERE site_id = 'current-site-uuid';
```

## 💰 Benefits

- ✅ **Cost Effective**: One database instead of hundreds
- ✅ **Simpler Management**: Single database to maintain
- ✅ **Faster Deployment**: No need to create new Supabase projects
- ✅ **Centralized Data**: All site data in one place
- ✅ **Easy Analytics**: Cross-site reporting and insights

## 🔧 Required Databases

### 1. Master Dashboard Database
```sql
-- Run master-dashboard-schema.sql
-- Stores: cms_instances, deployment_logs, templates, notifications
```

### 2. Shared CMS Database  
```sql
-- Run database-schema.sql (existing CMS schema)
-- Stores: sites, pages, templates, page_blocks, navigation_items
-- Each record has site_id for multi-tenant isolation
```

## 🚀 Deployment Process

When you click "Create New Website":

1. ✅ **Create Master Record**: New entry in `cms_instances` table
2. ✅ **Create Site Record**: New entry in `sites` table with unique ID
3. ✅ **Create Vercel Project**: New deployment with shared database config
4. ✅ **Set Environment Variables**: 
   - `NEXT_PUBLIC_SUPABASE_URL` (shared)
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (shared)
   - `SUPABASE_SERVICE_ROLE_KEY` (shared)
   - `CMS_SITE_ID` (unique per instance)
5. ✅ **Deploy**: Each instance filters data by its site ID

## 🔐 Data Security

Each CMS instance only sees its own data because:
- All queries filter by `site_id`
- RLS (Row Level Security) policies enforce isolation
- Each instance has unique `CMS_SITE_ID` environment variable

## 📊 Environment Variables

### Master Dashboard
```bash
# Master dashboard database
NEXT_PUBLIC_MASTER_SUPABASE_URL=https://master-project.supabase.co
MASTER_SUPABASE_SERVICE_ROLE_KEY=master-service-key

# Shared CMS database (used by all instances)
NEXT_PUBLIC_SUPABASE_URL=https://shared-cms.supabase.co
SUPABASE_SERVICE_ROLE_KEY=shared-service-key

# API tokens
VERCEL_TOKEN=your-vercel-token
GITHUB_TOKEN=your-github-token
```

### Each CMS Instance (Set automatically)
```bash
# Shared database (same for all)
NEXT_PUBLIC_SUPABASE_URL=https://shared-cms.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=shared-anon-key
SUPABASE_SERVICE_ROLE_KEY=shared-service-key

# Unique site identifier (different for each)
CMS_SITE_ID=uuid-for-this-site
NEXT_PUBLIC_CMS_SITE_ID=uuid-for-this-site
```

## 🎮 What Changed

### Before (Separate Databases)
- Master Dashboard → Creates new Supabase project per instance
- Each site had its own database
- Higher costs, complex management

### After (Shared Database)  
- Master Dashboard → Creates site record in shared database
- All sites share one database with `site_id` isolation
- Lower costs, simpler management

## 🔄 Migration from Old Architecture

If you already had separate databases:

1. Keep master dashboard database as-is
2. Choose one CMS database as the "shared" database
3. Migrate other sites' data with unique `site_id` values
4. Update environment variables to point to shared database

## 🎉 Ready to Deploy!

Your setup now requires:

1. **One Master Dashboard Database** (for managing instances)
2. **One Shared CMS Database** (for all website content)
3. **API Tokens** (Vercel, GitHub)
4. **Deploy and scale!** 🚀

This architecture is perfect for:
- 🏢 **Agencies**: Deploy client sites quickly
- 👩‍💻 **Developers**: Manage multiple projects
- 🚀 **Entrepreneurs**: Launch multiple businesses
- 📈 **Scale**: Handle hundreds of sites efficiently 