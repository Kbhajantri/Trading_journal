# 🚀 Render Deployment Guide

This guide will help you deploy your Trading Journal application to Render.

## Prerequisites

- ✅ GitHub repository: https://github.com/Kbhajantri/Trading_journal
- ✅ Supabase project set up and configured
- ✅ Environment variables ready (.env.local values)

## Step 1: Create Render Account

1. Go to [render.com](https://render.com)
2. Click "Get Started for Free"
3. Sign up with your GitHub account (recommended)
4. Authorize Render to access your GitHub repositories

## Step 2: Create New Web Service

1. **Dashboard**: Click "New" → "Web Service"
2. **Connect Repository**: 
   - Select "Connect a repository"
   - Find and connect: `Kbhajantri/Trading_journal`
   - Click "Connect"

## Step 3: Configure Deployment Settings

### Basic Settings:
- **Name**: `trading-journal` (or your preferred name)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave empty (root of repo)

### Build & Deploy Settings:
- **Environment**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### Advanced Settings:
- **Node Version**: `18` or `20`
- **Auto-Deploy**: `Yes` (deploys automatically on git push)

## Step 4: Environment Variables

Add these environment variables in Render:

| Key | Value | Description |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://your-project.supabase.co` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ...` | Your Supabase anon/public key |
| `NODE_ENV` | `production` | Set environment to production |

### How to Add Environment Variables:
1. In your service settings, scroll to "Environment Variables"
2. Click "Add Environment Variable"
3. Add each variable one by one
4. **Important**: Don't include quotes around the values

## Step 5: Deploy

1. Click "Create Web Service"
2. Render will automatically start building and deploying
3. Wait for the build to complete (usually 3-5 minutes)
4. You'll get a live URL like: `https://trading-journal.onrender.com`

## Step 6: Configure Supabase for Production

### Update Supabase Settings:
1. Go to your Supabase dashboard
2. Navigate to "Authentication" → "URL Configuration"
3. Add your Render URL to:
   - **Site URL**: `https://your-app.onrender.com`
   - **Redirect URLs**: `https://your-app.onrender.com/**`

## Common Issues & Solutions

### Build Failures:
- **Issue**: "Module not found" errors
- **Solution**: Check that all dependencies are in `package.json`

### Environment Variables:
- **Issue**: Supabase connection errors
- **Solution**: Verify environment variables are correctly set in Render

### Supabase Authentication:
- **Issue**: Auth redirects not working
- **Solution**: Update Supabase URL configuration with your Render domain

## Monitoring Your App

### Render Dashboard Features:
- **Logs**: View real-time application logs
- **Metrics**: Monitor performance and usage
- **Events**: Track deployments and builds
- **Settings**: Update configuration anytime

## Custom Domain (Optional)

### To use your own domain:
1. In Render dashboard, go to "Settings" → "Custom Domains"
2. Add your domain name
3. Configure DNS settings as instructed
4. Update Supabase URL configuration

## Automatic Deployments

✅ **Automatic Deployments Enabled**: 
- Every `git push` to main branch triggers new deployment
- Zero-downtime deployments
- Rollback capability if needed

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Next.js on Render](https://render.com/docs/deploy-nextjs-app)
- [Supabase + Render Guide](https://supabase.com/docs/guides/hosting/render)

---

## 🎉 Your App Will Be Live!

Once deployed, your trading journal will be accessible at:
**https://your-app-name.onrender.com**

### Features Available in Production:
- ✅ User authentication with Supabase
- ✅ Real-time data persistence
- ✅ Auto-save functionality
- ✅ Responsive design for all devices
- ✅ Secure database with RLS policies
- ✅ Indian Rupee formatting
- ✅ Complete trading journal functionality

---

**Need help?** Check the troubleshooting section or contact support!
