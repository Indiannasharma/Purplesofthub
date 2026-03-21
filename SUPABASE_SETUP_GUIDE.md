# Complete Supabase Setup Guide

This guide will help you set up Supabase and configure your Vercel deployment.

## Step 1: Create Supabase Project

### 1.1 Sign Up and Create Project
1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project"
3. Choose your organization
4. Configure your project:
   - **Name**: `purplesofthub`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users (e.g., `Southeast Asia (Singapore)`)
5. Click "Create new project"

### 1.2 Get Your Supabase Credentials
Once your project is created, go to:
1. **Settings** → **API** in your Supabase dashboard
2. Copy these values:

**Required Environment Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Example:**
```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijk.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Step 2: Configure Database Schema

### 2.1 Run the Database Schema
1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy and paste the SQL from `lib/supabase/schema.sql`
4. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, projects, invoices, files, music_campaigns, etc.)
- Row Level Security policies
- Functions for automatic profile creation
- Triggers for updated_at timestamps

### 2.2 Verify Tables Created
After running the schema, go to **Table Editor** to verify all tables were created:
- `profiles` - User profiles with roles
- `projects` - Client projects
- `invoices` - Invoice management
- `files` - File uploads
- `music_campaigns` - Music promotion campaigns
- `blog_posts` - Blog content
- `newsletter_subscribers` - Newsletter subscribers
- `chat_leads` - Chat leads

## Step 3: Configure Authentication

### 3.1 Enable Authentication Providers
1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable these providers:
   - **Email** (for magic links)
   - **Google** (for Gmail sign-in)
   - **Apple** (for Apple sign-in)

### 3.2 Configure Redirect URLs
Set these redirect URLs (replace with your actual Vercel URL):

**Site URL:**
```
https://purplesofthub.vercel.app
```

**Redirect URLs:**
```
https://purplesofthub.vercel.app/dashboard
https://purplesofthub.vercel.app/admin
https://purplesofthub.vercel.app/sign-in
https://purplesofthub.vercel.app/sign-up
```

### 3.3 Configure Email Settings (Optional)
1. Go to **Authentication** → **Email Templates**
2. Configure email templates for magic links
3. Set up SMTP settings if needed

## Step 4: Configure Vercel Environment Variables

### 4.1 Access Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Select your `purplesofthub` project
3. Go to **Settings** → **Environment Variables**

### 4.2 Add Environment Variables
Add these variables to your Vercel project:

**Required Variables:**
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=https://purplesofthub.vercel.app
```

**Optional Variables:**
```
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### 4.3 Redeploy
After adding environment variables:
1. Go to **Deployments** in Vercel
2. Click "Redeploy" or push a new commit to trigger a new deployment

## Step 5: Test Your Application

### 5.1 Test Authentication
1. Visit your deployed application: `https://purplesofthub.vercel.app`
2. Try signing up with email
3. Check your email for the magic link
4. Verify you can log in successfully

### 5.2 Test Dashboard
1. After logging in, you should be redirected to the dashboard
2. Verify the dashboard loads without errors
3. Test the admin dashboard if you have admin access

### 5.3 Check Console for Errors
1. Open browser developer tools (F12)
2. Check the Console tab for any errors
3. Check the Network tab for failed API requests

## Step 6: Troubleshooting

### Common Issues:

**500 Error on Dashboard:**
- Check that all environment variables are correctly set in Vercel
- Verify your Supabase project URL is correct
- Ensure the Supabase anon key is correct

**Authentication Not Working:**
- Verify redirect URLs are correctly configured in Supabase
- Check that authentication providers are enabled
- Ensure NEXT_PUBLIC_SITE_URL matches your Vercel deployment URL

**Database Connection Errors:**
- Verify your Supabase service role key is correct
- Check that the database schema was executed successfully
- Ensure RLS policies are properly configured

### Getting Help:
- **Supabase Documentation**: https://supabase.com/docs
- **Vercel Documentation**: https://vercel.com/docs
- **Check browser console** for specific error messages

## Step 7: Production Considerations

### Security:
- Keep your `SUPABASE_SERVICE_ROLE_KEY` secure (never expose in frontend)
- Use strong database passwords
- Enable 2FA on your Supabase account

### Performance:
- Monitor your Supabase usage in the dashboard
- Consider upgrading plan if you exceed free tier limits
- Set up proper caching strategies

### Monitoring:
- Set up alerts for high usage or errors
- Monitor authentication logs
- Track user registration and activity

## Next Steps

Once everything is working:

1. **Test all features** thoroughly
2. **Set up custom domain** (optional)
3. **Configure SSL** (automatic with Vercel)
4. **Set up monitoring and analytics**
5. **Consider setting up staging environment**

Your PurpleSoftHub application should now be fully functional with Supabase backend! 🎉