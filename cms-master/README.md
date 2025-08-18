# 🎨 Page Builder CMS

A powerful, theme-based Page Builder CMS built with Next.js 15, Supabase, and modern React components. Create beautiful websites with drag-and-drop functionality, customizable themes, and a complete content management system.

## ✨ Features

### 🎯 Core Features
- **Drag & Drop Page Builder**: Visual page creation with intuitive components
- **Multi-Theme Support**: Switch between themes or create custom ones
- **Template System**: Header, footer, and page templates for consistent design
- **Content Management**: Full CRUD operations for pages, templates, and navigation
- **Static Generation**: Performance optimization with static file generation
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 🔧 Technical Features
- **Next.js 15**: Latest React features with App Router
- **Supabase Backend**: PostgreSQL database with real-time capabilities
- **TypeScript**: Full type safety throughout the application
- **Radix UI Components**: Accessible, unstyled components
- **Multi-tenancy Ready**: Support for multiple sites in one deployment

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+ 
- npm/pnpm
- Supabase account
- Git

### 2. Local Development
```bash
# Clone the repository
git clone <your-repo-url>
cd page-builder-cms

# Install dependencies
npm install

# Set up environment variables
cp env.example .env.local
# Add your Supabase credentials to .env.local

# Set up database
# Follow SUPABASE-SETUP.md

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see your CMS!

### 3. Admin Panel
- Access admin at `/admin`
- Create your first pages and templates
- Customize themes and navigation

## 🏗️ Project Structure

```
Page Builder CMS V0/
├── app/                    # Next.js App Router
│   ├── [slug]/            # Dynamic page routes  
│   ├── admin/             # Admin dashboard
│   └── api/               # API endpoints
├── components/
│   ├── cms/               # CMS-specific components
│   ├── themes/            # Theme components and configs
│   └── ui/                # Reusable UI components
├── lib/                   # Utilities and configurations
├── public/                # Static assets
└── scripts/               # Build and utility scripts
```

## 🎨 Themes

### Current Themes
- **Default**: Clean, modern design
- **Modern**: Sleek and minimal

### Creating Custom Themes
1. Copy `components/themes/default` to your new theme folder
2. Customize components in the `ui/` directory
3. Update `register-blocks.tsx` for component registration
4. Modify `styles.css` for custom styling

## 📦 Deployment

### Vercel (Recommended)
1. **Quick Deploy**: Follow `VERCEL-DEPLOYMENT.md` (~10 minutes)
2. **Detailed Guide**: See `DEPLOYMENT-GUIDE.md` for comprehensive setup

### Other Platforms
- Netlify: Compatible with standard Next.js deployment
- Docker: Dockerfile can be added for containerized deployment
- Self-hosted: Use `npm run build && npm start`

## 🗄️ Database

### Setup
1. Create Supabase project
2. Run `database-schema.sql`
3. Configure environment variables
4. See `SUPABASE-SETUP.md` for detailed instructions

### Key Tables
- `sites`: Multi-tenant site management
- `pages`: Page content and metadata
- `templates`: Reusable page templates
- `page_blocks` / `template_blocks`: Component data
- `navigation_items`: Site navigation

## 🔧 Configuration

### Environment Variables
```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Optional
NEXT_PUBLIC_SITE_URL=your-domain.com
```

### Build Configuration
- `next.config.mjs`: Next.js settings
- `vercel.json`: Vercel-specific configuration
- `tailwind.config.ts`: Styling configuration

## 🧩 Components & Blocks

### Available Blocks [[memory:3370705]]
- **Hero**: Eye-catching header sections
- **Features**: Product/service highlights  
- **CTA**: Call-to-action sections
- **Testimonials**: Customer reviews
- **Pricing**: Pricing tables
- **Blog**: Content sections
- **Header/Footer**: Navigation and site info

### Adding Custom Blocks
1. Create component in `components/themes/[theme]/ui/`
2. Register in `register-blocks.tsx`
3. Add to component palette
4. Test in page builder

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
npm run build:themes   # Build theme assets
npm run generate-static # Generate static files
npm run lint           # Run ESLint
npm start              # Start production server
```

### Development Workflow
1. Create/modify components in themes
2. Test in page builder
3. Update component registration
4. Build and deploy

## 📚 Documentation

- `DEPLOYMENT-GUIDE.md`: Comprehensive deployment instructions
- `VERCEL-DEPLOYMENT.md`: Quick Vercel setup
- `SUPABASE-SETUP.md`: Database configuration
- `ADMIN-GUIDE.md`: Admin panel usage
- `CMS-README.md`: CMS-specific documentation

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary. See LICENSE file for details.

## 🆘 Support

### Getting Help
- Check documentation files
- Review troubleshooting sections
- Open an issue for bugs
- Join community discussions

### Common Issues
- **Build failures**: Check Node.js version and dependencies
- **Database errors**: Verify Supabase setup and credentials
- **Theme issues**: Ensure proper component registration

---

**Built with ❤️ using Next.js, Supabase, and modern web technologies.** 