# ⚡ Super Quick Deploy

**One-command deployment with automatic environment setup!**

## 🚀 Ultra-Fast Setup (2 Commands)

### 1. Auto-Set Environment Variables
```bash
npm run env:auto
```
This reads your `.env.local` and automatically sets ALL environment variables in Vercel!

### 2. Deploy
```bash
npm run deploy:vercel
```
Your CMS auto-configures itself on deployment!

---

## 🎯 One-Command Setup (Even Faster!)
```bash
npm run setup
```
This does both steps above automatically!

---

## 📋 What You Need First

Just create `.env.local` with your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
VERCEL_TOKEN=your-vercel-token
```

## ✨ What Gets Auto-Set

The script automatically finds and sets:
- ✅ All Supabase configuration
- ✅ All `NEXT_PUBLIC_*` variables  
- ✅ Vercel API credentials
- ✅ Any other environment variables you have

## 🎉 Benefits

✅ **No manual Vercel dashboard work**  
✅ **No copy-paste environment variables**  
✅ **Auto-detects everything from .env.local**  
✅ **One command setup**  
✅ **Zero configuration needed**  

---

**Ready?** Just run: `npm run setup` 🚀 