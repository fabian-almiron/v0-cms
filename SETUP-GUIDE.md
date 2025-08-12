# 🔧 Master Dashboard Setup Guide

## Step-by-Step Environment Configuration

### **1. Create Master Dashboard Database**

1. **Create NEW Supabase Project:**
   - Go to [supabase.com](https://supabase.com) → New Project
   - Name: "Master Dashboard" (or similar)
   - ⚠️ This is SEPARATE from CMS instance databases

2. **Initialize Database:**
   - Go to **SQL Editor** in your new project
   - Copy entire `master-dashboard-schema.sql` content
   - Click **Run** to execute

3. **Copy Database Credentials:**
   ```
   Settings → API:
   - Project URL: https://xxxxx.supabase.co
   - anon public key: eyJhbGciOiJIUzI1NiIs...
   - service_role secret key: eyJhbGciOiJIUzI1NiIs...
   ```

### **2. Get Required API Tokens**

#### **Vercel API Token** (Required for deployments)
1. Go to [vercel.com/account/tokens](https://vercel.com/account/tokens)
2. Click **Create Token**
3. Name: "Master Dashboard"
4. **Select these scopes:**
   - ✅ Read and write access to projects
   - ✅ Read and write access to deployments  
   - ✅ Read and write access to environment variables
   - ✅ Read access to teams (if using team account)
5. Copy the token: `vercel_xxxxxxxxxxxxx`

#### **Supabase Access Token** (Required for auto-provisioning)
1. Go to [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)
2. Click **Create token**
3. Name: "Master Dashboard"
4. **Select these scopes:**
   - ✅ Create and manage projects
   - ✅ Read project status
   - ✅ Organization access
5. Copy the token: `sbp_xxxxxxxxxxxxx`

#### **GitHub Token** (Required for template repos)
1. Go to [github.com/settings/tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Name: "Master Dashboard"
4. **Select these scopes:**
   - ✅ `repo` (Full repository access)
   - ✅ `read:org` (Read organization data)
5. Copy the token: `ghp_xxxxxxxxxxxxx`

### **3. Configure Environment Variables**

1. **Copy the template:**
   ```bash
   cp master-env.example .env.local
   ```

2. **Edit `.env.local` with your values:**

```bash
# =============================================
# MASTER DASHBOARD CONFIGURATION
# =============================================

# Master Dashboard Supabase Database (from Step 1)
NEXT_PUBLIC_MASTER_SUPABASE_URL=https://your-master-project-ref.supabase.co
NEXT_PUBLIC_MASTER_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
MASTER_SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# API Tokens (from Step 2)
VERCEL_TOKEN=vercel_xxxxxxxxxxxxx
SUPABASE_ACCESS_TOKEN=sbp_xxxxxxxxxxxxx
GITHUB_TOKEN=ghp_xxxxxxxxxxxxx

# Optional: Vercel Team ID (if using team account)
VERCEL_TEAM_ID=team_xxxxxxxxxxxxx

# =============================================
# DEPLOYMENT CONFIGURATION
# =============================================

# Your CMS template repository
DEFAULT_CMS_REPO=https://github.com/your-username/page-builder-cms.git
DEFAULT_CMS_BRANCH=main

# GitHub organization (if applicable)
GITHUB_ORG=your-github-organization
```

### **4. Test Configuration Locally**

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Visit http://localhost:3000/master
# You should see the dashboard loading
```

### **5. Deploy Master Dashboard**

#### **Option A: Deploy to Vercel**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard:
# Project Settings → Environment Variables
# Add ALL the variables from your .env.local
```

#### **Option B: Auto-deploy Script**

```bash
# Use the auto-setup script
npm run env:auto  # Auto-sets env vars in Vercel
npm run deploy:vercel  # Deploys to production
```

### **6. Access Your Master Dashboard**

1. **Visit your deployment URL**
2. **Go to `/master`** 
3. **Click "Create New Website"** to test
4. **Watch the magic happen!** ✨

### **7. Configure Git Repository**

If you want to use your own CMS template:

1. **Fork or clone** the page builder CMS repository
2. **Update the repository URL** in your environment:
   ```bash
   DEFAULT_CMS_REPO=https://github.com/your-username/your-cms-repo.git
   ```
3. **Make sure your GitHub token** has access to this repository

### **8. Verify Everything Works**

1. ✅ **Database Connection**: Dashboard shows stats
2. ✅ **API Tokens**: No error messages in console
3. ✅ **Template Access**: Templates load in creation form
4. ✅ **Test Deployment**: Create a test website

## 🚨 Troubleshooting

### **Common Issues:**

#### **"Supabase connection failed"**
- Check your master dashboard Supabase URL and keys
- Verify the database schema was executed
- Make sure you're using the MASTER project credentials

#### **"Vercel API error"**
- Verify your Vercel token has correct permissions
- Check if you need to set VERCEL_TEAM_ID
- Ensure token hasn't expired

#### **"GitHub repository not found"**
- Check your GitHub token permissions
- Verify repository URL is correct
- Make sure repository is public or token has access

#### **"Template loading failed"**
- Check if default templates were inserted in database
- Verify cms_templates table has data
- Check database connection

### **Debug Mode:**

Enable debug logging:
```bash
DEBUG_MODE=true
LOG_LEVEL=debug
```

### **Test Database Connection:**

```bash
# In your browser console on /master page:
await fetch('/api/master/test-connection')
```

## 🔐 Security Checklist

- [ ] **Never commit `.env.local`** to version control
- [ ] **Rotate API tokens** every 90 days
- [ ] **Enable 2FA** on Vercel, Supabase, and GitHub
- [ ] **Use team accounts** for production
- [ ] **Set up monitoring** for failed deployments
- [ ] **Backup master database** regularly

## 🎉 You're Ready!

Once everything is configured:

1. **Create your first website** through the dashboard
2. **Monitor the deployment** in real-time
3. **Scale to unlimited websites** 🚀

**Need help?** Check the deployment logs in your dashboard or Vercel console for specific error messages. 