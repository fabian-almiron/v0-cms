# 🚀 Vercel Deployment Guide

This guide will help you deploy your Page Builder CMS to Vercel with Supabase backend.

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
- ✅ **Supabase Project**: Set up according to `SUPABASE-SETUP.md`
- ✅ **Git Repository**: Your code should be in a Git repository (GitHub, GitLab, etc.)
- ✅ **Environment Variables**: Ready from your Supabase dashboard

## 🗄️ Step 1: Set Up Supabase Database

**IMPORTANT**: Complete the database setup first before deploying!

1. Follow the complete `SUPABASE-SETUP.md` guide
2. Run the `database-schema.sql` in your Supabase project
3. Note down your Supabase credentials:
   - Project URL
   - Anon Key
   - Service Role Key (keep secret!)

## 🔗 Step 2: Connect to Vercel

### Option A: Vercel Dashboard (Recommended)
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click **"New Project"**
3. Import your Git repository
4. Select your Page Builder CMS repository
5. Vercel will auto-detect Next.js

### Option B: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from your project root
vercel

# Follow the prompts to link your project
```

## ⚙️ Step 3: Configure Environment Variables

In your Vercel project dashboard:

1. Go to **Settings → Environment Variables**
2. Add the following variables:

### Required Variables
```
NEXT_PUBLIC_SUPABASE_URL = https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Important Notes:
- ✅ Set all variables for **Production**, **Preview**, and **Development**
- ⚠️ **Never commit** your `.env.local` file to Git
- 🔒 The Service Role Key should be marked as **"Sensitive"**

## 🏗️ Step 4: Deploy

### Automatic Deployment
- Push to your main branch
- Vercel will automatically build and deploy
- Check the **Deployments** tab for build status

### Manual Deployment
```bash
# From your project root
vercel --prod
```

## 🔧 Step 5: Post-Deployment Configuration

### Domain Setup
1. **Custom Domain** (Optional):
   - Go to **Settings → Domains**
   - Add your custom domain
   - Update DNS records as instructed

2. **Site Configuration**:
   - Update your site settings in the admin panel
   - Configure your navigation menu
   - Set up your first pages and templates

### Performance Optimization
1. **Edge Functions**: Already configured in `vercel.json`
2. **Static Generation**: Runs automatically every 6 hours
3. **Image Optimization**: Enabled in `next.config.mjs`

## 🧪 Step 6: Testing Your Deployment

### Basic Functionality Test
1. **Frontend**: Visit your deployed URL
2. **Admin Panel**: Go to `/admin` and verify access
3. **Database**: Create a test page to verify Supabase connection
4. **Static Generation**: Test the `/api/generate-static` endpoint

### Test Checklist
- [ ] Homepage loads correctly
- [ ] Admin panel accessible at `/admin`
- [ ] Can create/edit pages
- [ ] Can manage templates
- [ ] Navigation works
- [ ] Themes load properly
- [ ] Database operations work

## 🔍 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Check your build locally first
npm run build

# If it fails locally, fix issues before deploying
```

#### Environment Variable Issues
- Verify all variables are set in Vercel dashboard
- Check for typos in variable names
- Ensure Supabase keys are valid

#### Database Connection Issues
- Verify Supabase project is active
- Check RLS (Row Level Security) policies
- Test connection with your API endpoints

#### Theme/Component Issues
- Check if all theme files are properly committed
- Verify component imports in your themes
- Test theme switching functionality

### Debug Commands
```bash
# Check deployment logs
vercel logs

# Test your API endpoints
curl https://your-domain.vercel.app/api/generate-static

# Local development with production environment
vercel dev
```

## 📈 Step 7: Monitoring & Maintenance

### Vercel Analytics
- Enable in **Settings → Analytics**
- Monitor performance and usage

### Database Monitoring
- Monitor Supabase dashboard for:
  - Database usage
  - API requests
  - Storage usage
  - Performance metrics

### Regular Maintenance
- **Weekly**: Check deployment logs
- **Monthly**: Review database performance
- **Quarterly**: Update dependencies

## 🔒 Security Considerations

### Production Security
1. **Environment Variables**: Never expose service keys
2. **Supabase RLS**: Ensure proper Row Level Security policies
3. **Admin Access**: Implement proper authentication
4. **API Rate Limiting**: Configure in Supabase

### Recommended Security Settings
```sql
-- Example RLS policy for pages table
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view published pages" ON pages
  FOR SELECT USING (status = 'published');

CREATE POLICY "Authenticated users can manage all pages" ON pages
  FOR ALL USING (auth.role() = 'authenticated');
```

## 🎯 Performance Optimization

### Next.js Optimizations
- ✅ Static generation enabled
- ✅ Image optimization configured
- ✅ Bundle optimization in place

### Supabase Optimizations
- Add database indexes for frequently queried fields
- Use Supabase Edge Functions for heavy operations
- Enable connection pooling if needed

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Checklist](https://supabase.com/docs/guides/platform/going-into-prod)

## 🆘 Need Help?

### Common Support Channels
1. **Vercel Support**: [vercel.com/support](https://vercel.com/support)
2. **Supabase Discord**: [discord.supabase.com](https://discord.supabase.com)
3. **Next.js GitHub**: [github.com/vercel/next.js](https://github.com/vercel/next.js)

### Debug Information to Collect
- Deployment URL
- Build logs from Vercel
- Browser console errors
- Supabase dashboard metrics
- API response examples

---

**🎉 Congratulations!** Your Page Builder CMS is now live on Vercel!

Remember to test all functionality after deployment and keep your dependencies updated for security and performance. 