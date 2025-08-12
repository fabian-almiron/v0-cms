# ⚡ Quick Vercel Deployment Checklist

## 🎯 Pre-Deployment (5 minutes)

### 1. Database Setup
- [ ] Create Supabase project
- [ ] Run `database-schema.sql` in Supabase SQL editor
- [ ] Copy your Supabase credentials:
  - Project URL: `https://[project-ref].supabase.co`
  - Anon Key: `eyJhbGciOiJIUzI1NiIs...`
  - Service Role Key: `eyJhbGciOiJIUzI1NiIs...`

### 2. Code Preparation
- [ ] Push your code to GitHub/GitLab
- [ ] Ensure `vercel.json` is in your repository
- [ ] Test build locally: `npm run build`

## 🚀 Vercel Deployment (3 minutes)

### 1. Connect Project
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Vercel auto-detects Next.js configuration

### 2. Environment Variables
Add these in **Project Settings → Environment Variables**:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Important**: Set for Production, Preview, AND Development

### 3. Deploy
- Click **Deploy**
- Wait for build completion (~2-3 minutes)
- Get your deployment URL

## ✅ Post-Deployment Testing (2 minutes)

Quick verification checklist:

- [ ] Visit your deployment URL
- [ ] Check `/admin` loads correctly
- [ ] Test creating a page in admin
- [ ] Verify frontend displays correctly
- [ ] Test API endpoint: `/api/generate-static`

## 🔧 Common Issues & Fixes

| Issue | Solution |
|-------|----------|
| Build fails with dependency errors | Fixed - using `--legacy-peer-deps` |
| Database errors during build | Fixed - API routes handle missing env vars gracefully |
| Admin not loading | Verify environment variables are set |
| API errors | Check function timeout settings in vercel.json |

## 📱 Next Steps

1. **Custom Domain**: Settings → Domains (optional)
2. **Analytics**: Settings → Analytics (recommended)
3. **Monitoring**: Check deployment logs regularly

**Total Time**: ~10 minutes from start to live website!

**🎉 Build Issues Resolved**: All dependency conflicts and build-time API errors have been fixed!

---

For detailed instructions, see `DEPLOYMENT-GUIDE.md` 