# 🚀 Master Dashboard - CMS Management Platform

A powerful control center for deploying and managing unlimited Page Builder CMS instances. Deploy complete websites with one click, monitor performance, and scale effortlessly with modern web technologies.

## ✨ Features

### 🎯 Core Features
- **One-Click Deployment**: Create complete CMS instances instantly
- **Multi-Site Management**: Control unlimited websites from one dashboard
- **Auto-Provisioning**: Automatically creates Vercel projects and database setup
- **Performance Monitoring**: Track deployments, analytics, and site health
- **Template Management**: Organize and deploy different CMS templates
- **Scalable Architecture**: Multi-tenant database with cost-effective shared infrastructure

### 🔧 Technical Features
- **Next.js 15**: Latest React features with App Router
- **Supabase Backend**: PostgreSQL with multi-tenant Row Level Security
- **TypeScript**: Full type safety throughout the application  
- **Vercel Integration**: Seamless deployment automation
- **Modern UI**: Radix UI components with beautiful dark theme

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- npm/pnpm
- Supabase account (2 projects needed)
- Vercel account with API access
- Git

### 2. Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd cms-master-dashboard

# Install dependencies
npm install

# Set up environment variables
cp master-env.example .env.local
# Add your Master Dashboard Supabase credentials to .env.local

# Set up databases
# Run master-dashboard-schema.sql in your Master Dashboard Supabase project
# Set up shared CMS database for all instances

# Start development server
npm run dev
```

Visit `http://localhost:3000` to access your Master Dashboard!

### 3. Master Dashboard
- Access dashboard at `/master`
- Create your first CMS instance
- Monitor deployments and analytics
- Manage all your websites from one place

## 🏗️ Project Structure

```
CMS Master Dashboard/
├── app/                    # Next.js App Router
│   ├── master/            # Master dashboard pages
│   ├── api/master/        # Master dashboard API endpoints
│   └── layout.tsx         # Root layout
├── components/ui/          # Reusable UI components (Radix UI)
├── lib/                   # Utilities and configurations
│   ├── master-supabase.ts # Master dashboard database functions
│   └── supabase.ts        # Shared CMS database functions
├── cms-master/            # CMS template files (deployed to instances)
└── public/                # Static assets
```

## 🎮 How It Works

### Creating a New Website
1. **Access Master Dashboard** → Click "Create New Website"
2. **Fill in Details**: Website name, owner info, template selection
3. **One-Click Deploy** → System automatically:
   - Creates new site record in shared database
   - Creates Vercel project with proper environment variables
   - Deploys CMS instance with unique `CMS_SITE_ID`
   - Initializes default content and templates

### Multi-Tenant Architecture
- **Shared Database**: All CMS instances use one Supabase database
- **Data Isolation**: Each site filters data by unique `site_id`
- **Cost Effective**: No need for separate databases per site
- **Scalable**: Handle hundreds of sites efficiently

## 📦 Deployment

### Deploy Master Dashboard

1. **Deploy to Vercel**:
   ```bash
   vercel --prod
   ```

2. **Set Environment Variables** in Vercel Dashboard:
   ```bash
   # Master Dashboard Database
   NEXT_PUBLIC_MASTER_SUPABASE_URL=https://your-master-project.supabase.co
   NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=your-master-anon-key
   MASTER_SUPABASE_SERVICE_ROLE_KEY=your-master-service-key
   
   # Shared CMS Database
   NEXT_PUBLIC_SUPABASE_URL=https://shared-cms.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=shared-service-key
   
   # API Tokens
   VERCEL_TOKEN=your-vercel-api-token
   BITBUCKET_USERNAME=your-username
   BITBUCKET_API_TOKEN=your-api-token
   ```

3. **Access Your Dashboard** at your Vercel URL

## 🗄️ Database Architecture

### Required Databases
1. **Master Dashboard Database**: Tracks CMS instances and deployments
2. **Shared CMS Database**: Stores all website content with multi-tenant isolation

### Master Dashboard Tables
- `cms_instances`: Website records and deployment info
- `deployment_logs`: Deployment history and status
- `cms_templates`: Available CMS templates
- `notifications`: System alerts and messages

### Shared CMS Tables (Multi-Tenant)
- `sites`: Multi-tenant site management
- `pages`: Page content and metadata (filtered by `site_id`)
- `templates`: Reusable page templates (filtered by `site_id`)
- `page_blocks` / `template_blocks`: Component data (filtered by `site_id`)
- `navigation_items`: Site navigation (filtered by `site_id`)

## 🔧 Configuration

### Environment Variables
```bash
# Master Dashboard Database
NEXT_PUBLIC_MASTER_SUPABASE_URL=https://your-master-project.supabase.co
NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=your-master-anon-key
MASTER_SUPABASE_SERVICE_ROLE_KEY=your-master-service-key

# Shared CMS Database (used by all instances)
NEXT_PUBLIC_SUPABASE_URL=https://shared-cms.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=shared-anon-key
SUPABASE_SERVICE_ROLE_KEY=shared-service-key

# API Tokens for Auto-Deployment
VERCEL_TOKEN=your-vercel-api-token
BITBUCKET_USERNAME=your-username
BITBUCKET_API_TOKEN=your-api-token
BITBUCKET_WORKSPACE=your-workspace
```

### Build Configuration
- `next.config.mjs`: Next.js settings
- `vercel.json`: Vercel-specific configuration
- `tailwind.config.ts`: Styling configuration

## 🎨 CMS Templates

### Available Templates
Each deployed CMS instance comes with a complete set of:
- **Default Theme**: Clean, modern design with drag-and-drop components
- **Component Library**: Hero, Features, Testimonials, Pricing, Blog, CTA
- **Template System**: Header, footer, and page templates
- **Multi-Theme Support**: Easy theme switching and customization

### Template Structure (in `cms-master/`)
```
cms-master/
├── components/cms/        # CMS core functionality
├── components/themes/     # Theme components and blocks
├── components/ui/         # Radix UI components
├── lib/                   # CMS utilities and configurations
└── app/                   # CMS admin interface and pages
```

### Customizing Templates
1. Modify files in `cms-master/` directory
2. Templates automatically deploy to new instances
3. Existing sites can be updated through the dashboard

## 🔒 Security

### Production Checklist
- [ ] Set up Supabase RLS policies
- [ ] Configure proper authentication
- [ ] Secure environment variables
- [ ] Enable HTTPS
- [ ] Review API rate limiting

### Best Practices
- Never expose service role keys client-side
- Use Row Level Security (RLS) in Supabase
- Implement proper admin authentication
- Regular dependency updates

## 🚦 Performance

### Optimization Features
- **Static Generation**: Pages pre-built for speed
- **Image Optimization**: Next.js automatic optimization
- **Code Splitting**: Automatic bundle optimization
- **Edge Functions**: Fast API responses via Vercel Edge

### Monitoring
- Vercel Analytics for performance metrics
- Supabase dashboard for database monitoring
- Core Web Vitals tracking

## 🛠️ Development

### Available Scripts
```bash
npm run dev              # Start development server
npm run build           # Build for production
npm run lint            # Run ESLint
npm start               # Start production server
npm run deploy:vercel   # Deploy to Vercel
```

### Development Workflow
1. **Master Dashboard Development**: Modify dashboard pages and API routes
2. **CMS Template Updates**: Update files in `cms-master/` for new deployments
3. **Database Changes**: Update schemas and migration scripts
4. **Test & Deploy**: Test locally then deploy to production

## 📚 Documentation

- `MASTER-DASHBOARD-README.md`: Detailed Master Dashboard setup and usage
- `UPDATED-ARCHITECTURE.md`: Multi-tenant architecture explanation
- `master-dashboard-schema.sql`: Database schema for Master Dashboard
- `cms-master/`: Complete CMS template for deployment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes to Master Dashboard or CMS templates
4. Test deployment functionality
5. Submit a pull request

## 📄 License

This project is proprietary. See LICENSE file for details.

## 🆘 Support

### Getting Help
- Check `MASTER-DASHBOARD-README.md` for detailed setup
- Review `UPDATED-ARCHITECTURE.md` for architecture details
- Check Vercel deployment logs for deployment issues
- Verify database connections in Supabase dashboard

### Common Issues
- **Deployment Fails**: Check API token permissions and environment variables
- **Database Errors**: Verify both Master and Shared database configurations
- **Missing Features**: Ensure all required environment variables are set

## 🎯 What's Next?

After setting up your Master Dashboard:

1. **Create Your First Website** - Test the deployment process
2. **Monitor Deployments** - Track build logs and deployment status
3. **Scale Up** - Deploy multiple websites for clients or projects
4. **Customize Templates** - Modify CMS templates in `cms-master/`

---

**🚀 Ready to manage unlimited websites from one dashboard!**

Built with ❤️ using Next.js, Supabase, Vercel, and modern web technologies. 