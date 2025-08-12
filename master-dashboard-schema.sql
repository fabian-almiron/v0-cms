-- =============================================
-- MASTER DASHBOARD DATABASE SCHEMA
-- For managing multiple CMS instances
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- CMS INSTANCES TABLE
-- =============================================
CREATE TABLE cms_instances (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT,
  subdomain TEXT,
  status TEXT CHECK (status IN ('creating', 'active', 'inactive', 'failed', 'deleting')) DEFAULT 'creating',
  
  -- Vercel deployment info
  vercel_project_id TEXT,
  vercel_deployment_url TEXT,
  vercel_git_repo TEXT,
  vercel_team_id TEXT,
  
  -- Supabase configuration
  supabase_project_ref TEXT,
  supabase_url TEXT,
  supabase_anon_key TEXT,
  supabase_service_key TEXT, -- Encrypted
  
  -- Owner information
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  
  -- Template and theme
  template_id TEXT DEFAULT 'default',
  theme_id TEXT DEFAULT 'default',
  
  -- Deployment settings
  auto_deploy BOOLEAN DEFAULT true,
  branch TEXT DEFAULT 'main',
  build_command TEXT DEFAULT 'npm run build',
  
  -- Metadata
  settings JSONB DEFAULT '{}',
  deployment_config JSONB DEFAULT '{}',
  last_deployed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- DEPLOYMENT LOGS TABLE
-- =============================================
CREATE TABLE deployment_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cms_instance_id UUID NOT NULL REFERENCES cms_instances(id) ON DELETE CASCADE,
  deployment_id TEXT, -- Vercel deployment ID
  status TEXT CHECK (status IN ('pending', 'building', 'success', 'failed', 'cancelled')) DEFAULT 'pending',
  log_data JSONB,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  duration_ms INTEGER
);

-- =============================================
-- TEMPLATES TABLE
-- =============================================
CREATE TABLE cms_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  git_repo TEXT NOT NULL,
  git_branch TEXT DEFAULT 'main',
  preview_image_url TEXT,
  config JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- SUPABASE PROJECTS TABLE
-- =============================================
CREATE TABLE supabase_projects (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cms_instance_id UUID NOT NULL REFERENCES cms_instances(id) ON DELETE CASCADE,
  project_ref TEXT NOT NULL UNIQUE,
  project_id TEXT,
  organization_id TEXT,
  database_url TEXT,
  api_url TEXT,
  status TEXT CHECK (status IN ('creating', 'active', 'paused', 'inactive')) DEFAULT 'creating',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- NOTIFICATIONS TABLE
-- =============================================
CREATE TABLE notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cms_instance_id UUID REFERENCES cms_instances(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'deployment', 'error', 'success', 'warning'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- MASTER DASHBOARD SETTINGS TABLE
-- =============================================
CREATE TABLE master_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  is_encrypted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================
-- ANALYTICS TABLE
-- =============================================
CREATE TABLE instance_analytics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cms_instance_id UUID NOT NULL REFERENCES cms_instances(id) ON DELETE CASCADE,
  metric_type TEXT NOT NULL, -- 'page_views', 'unique_visitors', 'deployments', etc.
  metric_value NUMERIC NOT NULL,
  recorded_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================
CREATE INDEX idx_cms_instances_status ON cms_instances(status);
CREATE INDEX idx_cms_instances_owner_email ON cms_instances(owner_email);
CREATE INDEX idx_cms_instances_created_at ON cms_instances(created_at DESC);
CREATE INDEX idx_cms_instances_vercel_project ON cms_instances(vercel_project_id);

CREATE INDEX idx_deployment_logs_instance_id ON deployment_logs(cms_instance_id);
CREATE INDEX idx_deployment_logs_status ON deployment_logs(status);
CREATE INDEX idx_deployment_logs_started_at ON deployment_logs(started_at DESC);

CREATE INDEX idx_templates_category ON cms_templates(category);
CREATE INDEX idx_templates_active ON cms_templates(is_active);

CREATE INDEX idx_supabase_projects_instance_id ON supabase_projects(cms_instance_id);
CREATE INDEX idx_supabase_projects_status ON supabase_projects(status);

CREATE INDEX idx_notifications_instance_id ON notifications(cms_instance_id);
CREATE INDEX idx_notifications_unread ON notifications(is_read, created_at DESC);
CREATE INDEX idx_notifications_type ON notifications(type);

CREATE INDEX idx_analytics_instance_id ON instance_analytics(cms_instance_id);
CREATE INDEX idx_analytics_metric_type ON instance_analytics(metric_type, recorded_at DESC);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cms_instances_updated_at BEFORE UPDATE ON cms_instances 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cms_templates_updated_at BEFORE UPDATE ON cms_templates 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_supabase_projects_updated_at BEFORE UPDATE ON supabase_projects 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_master_settings_updated_at BEFORE UPDATE ON master_settings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- HELPFUL VIEWS
-- =============================================
CREATE VIEW cms_instances_with_stats AS
SELECT 
  ci.*,
  sp.project_ref as supabase_ref,
  sp.status as supabase_status,
  COUNT(dl.id) as total_deployments,
  COUNT(CASE WHEN dl.status = 'success' THEN 1 END) as successful_deployments,
  COUNT(CASE WHEN dl.status = 'failed' THEN 1 END) as failed_deployments,
  MAX(dl.completed_at) as last_deployment_at
FROM cms_instances ci
LEFT JOIN supabase_projects sp ON ci.id = sp.cms_instance_id
LEFT JOIN deployment_logs dl ON ci.id = dl.cms_instance_id
GROUP BY ci.id, sp.project_ref, sp.status;

-- =============================================
-- ROW LEVEL SECURITY (Optional)
-- =============================================
-- Enable RLS if you want multi-user access to the master dashboard
-- ALTER TABLE cms_instances ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE deployment_logs ENABLE ROW LEVEL SECURITY;
-- etc...

-- =============================================
-- INSERT DEFAULT TEMPLATES
-- =============================================
INSERT INTO cms_templates (id, name, description, category, git_repo, preview_image_url) VALUES
('default', 'Default CMS', 'Clean and modern page builder CMS', 'business', 'https://github.com/your-username/page-builder-cms.git', '/templates/default-preview.jpg'),
('ecommerce', 'E-commerce CMS', 'CMS optimized for online stores', 'ecommerce', 'https://github.com/your-username/page-builder-cms.git', '/templates/ecommerce-preview.jpg'),
('blog', 'Blog CMS', 'Perfect for content creators and bloggers', 'content', 'https://github.com/your-username/page-builder-cms.git', '/templates/blog-preview.jpg'),
('portfolio', 'Portfolio CMS', 'Showcase your work beautifully', 'creative', 'https://github.com/your-username/page-builder-cms.git', '/templates/portfolio-preview.jpg');

-- =============================================
-- INSERT DEFAULT SETTINGS
-- =============================================
INSERT INTO master_settings (key, value, description) VALUES
('vercel_team_id', '"your-team-id"', 'Default Vercel team ID for deployments'),
('default_template', '"default"', 'Default template for new CMS instances'),
('auto_setup_supabase', 'true', 'Automatically create Supabase projects for new instances'),
('notification_email', '"admin@yourdomain.com"', 'Email for system notifications'),
('max_instances_per_user', '10', 'Maximum CMS instances per user email'),
('deployment_timeout_minutes', '15', 'Deployment timeout in minutes'); 