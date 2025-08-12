# 🚀 Master Dashboard for Page Builder CMS

A powerful control center for managing multiple Page Builder CMS instances. Deploy, monitor, and control unlimited websites from a single dashboard.

## 🎯 What This Does

The Master Dashboard allows you to:

- **Create New Websites**: Deploy complete CMS instances with one click
- **Manage Multiple Sites**: Control all your CMS deployments from one place  
- **Auto-Provision Resources**: Automatically create Supabase projects and Vercel deployments
- **Monitor Performance**: Track deployments, analytics, and site health
- **Template Management**: Organize and deploy different CMS templates

## 📋 Prerequisites

Before setting up the Master Dashboard, you need:

1. **Vercel Account** with API access
2. **Supabase Account** with organization access
3. **GitHub Account** with repository access
4. **Separate Supabase Project** for the master dashboard database

## 🏗️ Architecture

```
Master Dashboard (This Project)
├── Master Supabase Database (stores instance info)
├── Vercel API Integration (creates projects)
├── Supabase API Integration (creates databases)
└── Manages Multiple CMS Instances
    ├── CMS Instance 1 (Vercel + Supabase)
    ├── CMS Instance 2 (Vercel + Supabase)
    └── CMS Instance N (Vercel + Supabase)
```

## 🚀 Quick Setup

### 1. Database Setup

Create a **new Supabase project** for the master dashboard:

```sql
-- Run this in your Master Dashboard Supabase project
-- NOT in the CMS instance databases
```

Then run the `master-dashboard-schema.sql` file in your Supabase SQL editor.

### 2. Environment Configuration

Copy `master-env.example` to `.env.local` and configure:

```bash
# Master Dashboard Database (NEW Supabase project)
NEXT_PUBLIC_MASTER_SUPABASE_URL=https://your-master-project.supabase.co
NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=your-master-anon-key
MASTER_SUPABASE_SERVICE_ROLE_KEY=your-master-service-key

# API Keys for Auto-Deployment
VERCEL_TOKEN=your-vercel-api-token
SUPABASE_ACCESS_TOKEN=your-supabase-access-token
GITHUB_TOKEN=your-github-token
```

### 3. Deploy Master Dashboard

Deploy this master dashboard to Vercel:

```bash
# Deploy the master dashboard
vercel --prod

# Set environment variables in Vercel dashboard
# Project Settings → Environment Variables
```

### 4. Access Your Dashboard

Visit your deployed master dashboard and start creating websites!

## 🎮 How to Use

### Creating a New Website

1. **Go to Master Dashboard** → Click "Create New Website"
2. **Fill in Details**:
   - Website name and description
   - Owner information  
   - Choose template (Default, E-commerce, Blog, Portfolio)
   - Select theme
3. **Click "Deploy Website"** - Watch the magic happen!

### Deployment Process

The system automatically:

1. ✅ **Creates Database**: New Supabase project with CMS schema
2. ✅ **Creates Vercel Project**: From your selected template
3. ✅ **Configures Environment**: Auto-sets all required variables  
4. ✅ **Deploys Website**: Builds and deploys to production
5. ✅ **Initializes Data**: Sets up database schema and default content
6. ✅ **Sends Notifications**: Keeps you updated on progress

### Managing Existing Websites

- **View All Sites**: See status, URLs, and performance metrics
- **Monitor Deployments**: Track build logs and deployment history
- **Update Settings**: Modify configurations and redeploy
- **Delete Sites**: Clean removal of all resources

## 🔧 API Integration

### Vercel API

The master dashboard uses Vercel's API to:
- Create new projects from Git repositories
- Configure environment variables
- Trigger deployments
- Monitor deployment status

Required permissions:
- Project management
- Environment variable access
- Deployment access

### Supabase API

Integration with Supabase Management API:
- Create new projects
- Configure database settings
- Monitor project health
- Manage access keys

Required permissions:
- Project creation
- Organization access
- Database management

## 📊 Database Schema

### Master Dashboard Tables

- **cms_instances**: Main website records
- **deployment_logs**: Deployment history and logs
- **cms_templates**: Available templates
- **supabase_projects**: Supabase project mappings
- **notifications**: System notifications
- **master_settings**: Configuration settings
- **instance_analytics**: Performance metrics

### CMS Instance Tables

Each created website gets its own Supabase project with:
- **sites**: Multi-tenant site management
- **pages**: Page content and metadata  
- **templates**: Reusable page templates
- **page_blocks**: Component data
- **navigation_items**: Site navigation

## 🎨 Templates

### Available Templates

1. **Default**: Clean, modern business template
2. **E-commerce**: Online store optimized template
3. **Blog**: Content-focused template
4. **Portfolio**: Creative showcase template

### Adding Custom Templates

1. Create new Git repository with your CMS template
2. Update `cms_templates` table in master database
3. Configure template in deployment API
4. Test deployment process

## 📈 Monitoring & Analytics

### Dashboard Metrics

- Total websites created
- Active deployments
- Success/failure rates
- Performance metrics

### Instance Monitoring

- Deployment status
- Site health checks
- Performance analytics
- Error tracking

### Notifications

- Deployment completion
- Error alerts
- Performance warnings
- System updates

## 🔐 Security

### Environment Variables

- Keep master service keys secure
- Rotate API tokens regularly
- Use environment-specific configs
- Enable 2FA on all accounts

### Access Control

- Master dashboard admin access
- Instance-level permissions
- API key management
- Audit logging

## 🚨 Troubleshooting

### Common Issues

1. **Deployment Fails**:
   - Check API token permissions
   - Verify environment variables
   - Review deployment logs

2. **Database Connection Issues**:
   - Confirm Supabase project status
   - Check database credentials
   - Verify network connectivity

3. **Template Not Found**:
   - Verify Git repository access
   - Check template configuration
   - Confirm branch settings

### Debug Mode

Enable debug logging:

```bash
DEBUG_MODE=true
LOG_LEVEL=debug
```

### Getting Help

1. Check deployment logs in dashboard
2. Review Vercel deployment logs
3. Check Supabase project status
4. Contact support with instance ID

## 🔄 Updating

### Master Dashboard Updates

```bash
git pull origin main
vercel --prod
```

### Template Updates

Templates auto-update on next deployment. Force update:
1. Go to instance management
2. Click "Redeploy"
3. Select latest template version

## 📝 Development

### Local Development

```bash
# Clone and setup
git clone <repository>
cd master-dashboard
npm install

# Configure environment
cp master-env.example .env.local
# Edit .env.local with your settings

# Run development server
npm run dev
```

### Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 🎉 What's Next?

After setting up your Master Dashboard:

1. **Create Your First Website** - Test the deployment process
2. **Set Up Monitoring** - Configure alerts and notifications
3. **Customize Templates** - Add your own CMS templates
4. **Scale Up** - Deploy multiple websites for clients
5. **Monitor Performance** - Track usage and optimize

---

**Ready to manage unlimited websites?** 🚀

Deploy your Master Dashboard and start creating websites with one click! 