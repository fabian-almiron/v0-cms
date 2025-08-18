-- =============================================
-- MULTI-TENANT CMS DATABASE SCHEMA
-- =============================================
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- SITES TABLE (Multi-tenancy)
-- =============================================
CREATE TABLE sites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT UNIQUE NOT NULL, -- e.g., 'mystore.com' or 'blog.example.com'
  subdomain TEXT, -- For subdomain-based tenancy (optional)
  owner_email TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'inactive', 'suspended')) DEFAULT 'active',
  plan TEXT CHECK (plan IN ('free', 'pro', 'enterprise')) DEFAULT 'free',
  settings JSONB DEFAULT '{}', -- Site-specific settings
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- PAGES TABLE
-- =============================================
CREATE TABLE pages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  slug TEXT NOT NULL,
  content TEXT,
  status TEXT CHECK (status IN ('draft', 'published')) DEFAULT 'draft',
  theme_id TEXT NOT NULL, -- Theme identifier (stored in codebase)
  header_template_id UUID, -- Will reference templates table
  footer_template_id UUID, -- Will reference templates table  
  page_template_id UUID,   -- Will reference templates table
  meta_title TEXT,
  meta_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, slug) -- Ensure unique slug per site
);

-- =============================================
-- TEMPLATES TABLE
-- =============================================
CREATE TABLE templates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT CHECK (type IN ('header', 'footer', 'page')) NOT NULL,
  theme_id TEXT NOT NULL, -- Theme identifier
  is_default BOOLEAN DEFAULT FALSE, -- Default template for this type/theme
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, name, type) -- Ensure unique template names per site and type
);

-- =============================================
-- PAGE BLOCKS TABLE
-- =============================================
CREATE TABLE page_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL, -- e.g., 'Hero', 'Features', etc.
  order_index INTEGER NOT NULL,
  props JSONB DEFAULT '{}', -- Component props as JSON
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- TEMPLATE BLOCKS TABLE  
-- =============================================
CREATE TABLE template_blocks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  template_id UUID NOT NULL REFERENCES templates(id) ON DELETE CASCADE,
  component_type TEXT NOT NULL, -- e.g., 'Header', 'Footer', 'DNDArea', etc.
  order_index INTEGER NOT NULL,
  props JSONB DEFAULT '{}', -- Component props as JSON
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NAVIGATION TABLE
-- =============================================
CREATE TABLE navigation_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  type TEXT CHECK (type IN ('internal', 'external')) NOT NULL,
  href TEXT, -- For external links or custom URLs
  page_id UUID REFERENCES pages(id) ON DELETE SET NULL, -- For internal page links
  order_index INTEGER NOT NULL DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SITE SETTINGS TABLE
-- =============================================
CREATE TABLE site_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  site_id UUID NOT NULL REFERENCES sites(id) ON DELETE CASCADE,
  key TEXT NOT NULL,
  value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(site_id, key) -- Ensure unique keys per site
);

-- =============================================
-- FOREIGN KEY CONSTRAINTS
-- =============================================
-- Add foreign key constraints for templates
ALTER TABLE pages 
  ADD CONSTRAINT fk_pages_header_template 
  FOREIGN KEY (header_template_id) REFERENCES templates(id) ON DELETE SET NULL;

ALTER TABLE pages 
  ADD CONSTRAINT fk_pages_footer_template 
  FOREIGN KEY (footer_template_id) REFERENCES templates(id) ON DELETE SET NULL;

ALTER TABLE pages 
  ADD CONSTRAINT fk_pages_page_template 
  FOREIGN KEY (page_template_id) REFERENCES templates(id) ON DELETE SET NULL;

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
-- Site indexes
CREATE INDEX idx_sites_domain ON sites(domain);
CREATE INDEX idx_sites_status ON sites(status);
CREATE INDEX idx_sites_owner_email ON sites(owner_email);

-- Page indexes
CREATE INDEX idx_pages_site_id ON pages(site_id);
CREATE INDEX idx_pages_slug ON pages(site_id, slug);
CREATE INDEX idx_pages_status ON pages(site_id, status);
CREATE INDEX idx_pages_theme_id ON pages(site_id, theme_id);
CREATE INDEX idx_pages_created_at ON pages(site_id, created_at DESC);

-- Template indexes
CREATE INDEX idx_templates_site_id ON templates(site_id);
CREATE INDEX idx_templates_type ON templates(site_id, type);
CREATE INDEX idx_templates_theme_id ON templates(site_id, theme_id);
CREATE INDEX idx_templates_is_default ON templates(site_id, is_default);
CREATE INDEX idx_templates_theme_type ON templates(site_id, theme_id, type);

-- Block indexes
CREATE INDEX idx_page_blocks_site_id ON page_blocks(site_id);
CREATE INDEX idx_page_blocks_page_id ON page_blocks(site_id, page_id);
CREATE INDEX idx_page_blocks_order ON page_blocks(page_id, order_index);
CREATE INDEX idx_template_blocks_site_id ON template_blocks(site_id);
CREATE INDEX idx_template_blocks_template_id ON template_blocks(site_id, template_id);
CREATE INDEX idx_template_blocks_order ON template_blocks(template_id, order_index);

-- Navigation indexes
CREATE INDEX idx_navigation_site_id ON navigation_items(site_id);
CREATE INDEX idx_navigation_order ON navigation_items(site_id, order_index);
CREATE INDEX idx_navigation_visible ON navigation_items(site_id, is_visible);

-- Site settings indexes
CREATE INDEX idx_site_settings_site_id ON site_settings(site_id);
CREATE INDEX idx_site_settings_key ON site_settings(site_id, key);

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================
-- Enable RLS on all tables
ALTER TABLE sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE template_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RLS POLICIES (Multi-tenant aware)
-- =============================================
-- Sites policies (only authenticated users can manage sites)
CREATE POLICY "Enable read access for active sites" ON sites
  FOR SELECT USING (status = 'active');

CREATE POLICY "Enable all access for authenticated users on their sites" ON sites
  FOR ALL USING (auth.role() = 'authenticated');

-- Pages policies
CREATE POLICY "Enable read access for published pages" ON pages
  FOR SELECT USING (
    status = 'published' AND 
    EXISTS (SELECT 1 FROM sites WHERE sites.id = pages.site_id AND sites.status = 'active')
  );

CREATE POLICY "Enable all access for authenticated users" ON pages
  FOR ALL USING (auth.role() = 'authenticated');

-- Templates policies  
CREATE POLICY "Enable read access for templates" ON templates
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = templates.site_id AND sites.status = 'active')
  );

CREATE POLICY "Enable all access for authenticated users" ON templates
  FOR ALL USING (auth.role() = 'authenticated');

-- Page blocks policies
CREATE POLICY "Enable read access for page blocks" ON page_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM pages 
      JOIN sites ON sites.id = pages.site_id
      WHERE pages.id = page_blocks.page_id 
      AND pages.status = 'published'
      AND sites.status = 'active'
    )
  );

CREATE POLICY "Enable all access for authenticated users" ON page_blocks
  FOR ALL USING (auth.role() = 'authenticated');

-- Template blocks policies
CREATE POLICY "Enable read access for template blocks" ON template_blocks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM templates 
      JOIN sites ON sites.id = templates.site_id
      WHERE templates.id = template_blocks.template_id 
      AND sites.status = 'active'
    )
  );

CREATE POLICY "Enable all access for authenticated users" ON template_blocks  
  FOR ALL USING (auth.role() = 'authenticated');

-- Navigation policies
CREATE POLICY "Enable read access for visible navigation" ON navigation_items
  FOR SELECT USING (
    is_visible = true AND
    EXISTS (SELECT 1 FROM sites WHERE sites.id = navigation_items.site_id AND sites.status = 'active')
  );

CREATE POLICY "Enable all access for authenticated users" ON navigation_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Site settings policies
CREATE POLICY "Enable read access for site settings" ON site_settings
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM sites WHERE sites.id = site_settings.site_id AND sites.status = 'active')
  );

CREATE POLICY "Enable all access for authenticated users" ON site_settings
  FOR ALL USING (auth.role() = 'authenticated');

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables with updated_at
CREATE TRIGGER update_sites_updated_at BEFORE UPDATE ON sites 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pages_updated_at BEFORE UPDATE ON pages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_templates_updated_at BEFORE UPDATE ON templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_navigation_updated_at BEFORE UPDATE ON navigation_items 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at BEFORE UPDATE ON site_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPFUL VIEWS FOR QUERYING
-- =============================================
-- View for pages with all template info
CREATE VIEW pages_with_templates AS
SELECT 
  p.*,
  ht.name as header_template_name,
  ft.name as footer_template_name,
  pt.name as page_template_name,
  s.name as site_name,
  s.domain as site_domain
FROM pages p
LEFT JOIN templates ht ON p.header_template_id = ht.id
LEFT JOIN templates ft ON p.footer_template_id = ft.id  
LEFT JOIN templates pt ON p.page_template_id = pt.id
JOIN sites s ON p.site_id = s.id;

-- View for templates with block counts
CREATE VIEW templates_with_block_counts AS
SELECT 
  t.*,
  COUNT(tb.id) as block_count,
  s.name as site_name,
  s.domain as site_domain
FROM templates t
LEFT JOIN template_blocks tb ON t.id = tb.template_id
JOIN sites s ON t.site_id = s.id
GROUP BY t.id, s.name, s.domain;

-- View for site statistics
CREATE VIEW site_statistics AS
SELECT 
  s.*,
  COUNT(DISTINCT p.id) as total_pages,
  COUNT(DISTINCT CASE WHEN p.status = 'published' THEN p.id END) as published_pages,
  COUNT(DISTINCT t.id) as total_templates,
  COUNT(DISTINCT n.id) as navigation_items
FROM sites s
LEFT JOIN pages p ON s.id = p.site_id
LEFT JOIN templates t ON s.id = t.site_id
LEFT JOIN navigation_items n ON s.id = n.site_id
GROUP BY s.id; 