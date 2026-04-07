# Vercel Deployment Guide

This guide will help you deploy your PurpleSoftHub application to Vercel.

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your project should be connected to a GitHub repo
3. **Supabase Project**: Already set up with your database and credentials

## Step 1: Prepare Your Project

### Environment Variables
Ensure your `.env.local` file has all required variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-project-name.vercel.app

# Optional: Payment Integration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Optional: Cloudinary (for file uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Install Dependencies
Make sure all dependencies are installed:

```bash
npm install
```

### Test Locally
Before deploying, test your application locally:

```bash
npm run dev
```

Visit `http://localhost:3000` to ensure everything works correctly.

## Step 2: Deploy to Vercel

### Option 1: Git Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for Vercel deployment"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Configure project settings:
     - **Framework Preset**: Next.js
     - **Root Directory**: `/` (project root)
     - **Build Command**: `npm run vercel-build`
     - **Output Directory**: `.next`
     - **Install Command**: `npm install`

3. **Set Environment Variables**:
   - Go to Project Settings → Environment Variables
   - Add all variables from your `.env.local` file
   - Set `NEXT_PUBLIC_SITE_URL` to your Vercel deployment URL

4. **Deploy**:
   - Vercel will automatically deploy when you push to GitHub
   - Or manually trigger deployment from the Vercel dashboard

### Option 2: Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   vercel
   ```

4. **Set Environment Variables**:
   ```bash
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add NEXT_PUBLIC_SITE_URL
   ```

5. **Deploy with Production**:
   ```bash
   vercel --prod
   ```

## Step 3: Configure Supabase for Production

### Update Supabase Authentication

1. Go to your Supabase dashboard
2. Navigate to **Authentication** → **Settings**
3. Update **Site URL** to your Vercel deployment URL
4. Update **Redirect URLs** to include:
   - `https://your-project-name.vercel.app/dashboard`
   - `https://your-project-name.vercel.app/admin`
   - `https://your-project-name.vercel.app/sign-in`

### Update Supabase Database

If you made any schema changes locally, apply them to your production database:
1. Go to **SQL Editor** in Supabase
2. Run any new migrations or schema updates

## Step 4: Post-Deployment Setup

### Verify Deployment

1. Visit your Vercel deployment URL
2. Test authentication flow
3. Verify dashboard functionality
4. Check that all API routes work correctly

### Configure Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Configure DNS settings as instructed by Vercel
4. Wait for DNS propagation

### Set Up SSL (Automatic)

Vercel automatically provides SSL certificates for all deployments.

## Troubleshooting

### Common Issues:

1. **Environment Variables Not Loading**:
   - Ensure all variables are set in Vercel dashboard
   - Check variable names match exactly
   - Re-deploy after adding variables

2. **Supabase Connection Errors**:
   - Verify Supabase credentials are correct
   - Check that Site URL is updated in Supabase
   - Ensure CORS settings allow your Vercel domain

3. **Build Failures**:
   - Check Vercel build logs for specific errors
   - Ensure all dependencies are in package.json
   - Verify Node.js version compatibility

4. **Authentication Not Working**:
   - Check redirect URLs in Supabase
   - Verify NEXT_PUBLIC_SITE_URL is correct
   - Ensure middleware is properly configured

### Performance Optimization

1. **Enable Edge Network**:
   - Vercel automatically serves your app from edge locations
   - Consider using Vercel's Edge Functions for API routes

2. **Image Optimization**:
   - Use Vercel's Image Optimization
   - Configure `next.config.mjs` for image domains

3. **Caching**:
   - Implement proper caching headers
   - Use Vercel's built-in caching for static assets

## Monitoring and Maintenance

### Vercel Analytics
- Monitor performance metrics in Vercel dashboard
- Track deployment history and rollbacks
- Set up alerts for errors or performance issues

### Supabase Monitoring
- Monitor database usage and performance
- Set up alerts for high usage or errors
- Review authentication logs

### Regular Updates
- Keep dependencies updated
- Monitor for security vulnerabilities
- Test deployments regularly

## Cost Considerations

### Vercel Pricing
- **Hobby**: Free tier available
- **Pro**: $20/month for production features
- **Enterprise**: Custom pricing for large-scale applications

### Supabase Pricing
- **Free tier**: Limited database and storage
- **Pro tier**: $25/month for production use
- **Team/Enterprise**: Custom pricing

## Next Steps

Once deployed:
1. Set up monitoring and error tracking
2. Configure backups for your Supabase database
3. Consider setting up a staging environment
4. Implement CI/CD workflows
5. Add analytics and monitoring tools

Your PurpleSoftHub application is now ready for production on Vercel! 🚀