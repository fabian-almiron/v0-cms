# ⚡ Quick Deploy Options

## Option 1: **Automated Script** (Easiest)

```bash
npm run deploy
```

This script will:
1. Install Vercel CLI (if needed)
2. Deploy your project
3. Prompt for environment variables
4. Set them up automatically
5. Redeploy with variables

## Option 2: **Vercel CLI Manual**

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production  
vercel env add SUPABASE_SERVICE_ROLE_KEY production

# Redeploy
vercel --prod
```

## Option 3: **GitHub Integration** (One-time setup)

1. **Connect to GitHub**: Push your code to GitHub
2. **Import to Vercel**: [vercel.com/new](https://vercel.com/new) → Import repository
3. **Set Environment Variables**: 
   - Go to **Settings → Environment Variables**
   - Add all three variables
   - Redeploy

## Option 4: **Environment Template** (For teams)

Use the included `vercel-env-template.json`:

```bash
# In your Vercel project directory
vercel env import vercel-env-template.json
```

## Option 5: **One-Command Deploy**

```bash
# Set environment variables first, then deploy
NEXT_PUBLIC_SUPABASE_URL="your-url" \
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-key" \
SUPABASE_SERVICE_ROLE_KEY="your-secret" \
vercel --prod
```

## 📋 Required Variables

Get these from **Supabase Dashboard → Settings → API**:

```
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

## 🎯 Recommended Approach

**For first-time users**: Use **Option 1** (`npm run deploy`)
**For developers**: Use **Option 2** (Vercel CLI)  
**For teams**: Use **Option 3** (GitHub integration)

All options will result in a fully working CMS with database integration! 🚀 