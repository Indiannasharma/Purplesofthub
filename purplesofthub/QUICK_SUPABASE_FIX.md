# Quick Fix: Run Database Schema in Supabase

The error "relation 'profiles' does not exist" means your Supabase database doesn't have the required tables. Let's fix this immediately.

## Step 1: Run the Database Schema

### 1.1 Access Supabase SQL Editor
1. Go to your Supabase dashboard: https://supabase.com
2. Select your `purplesofthub` project
3. Click on **SQL Editor** in the left sidebar
4. Click **"New query"**

### 1.2 Copy and Paste the Schema
Copy the entire SQL schema from this file: `lib/supabase/schema.sql`

**Quick copy method:**
1. Open `lib/supabase/schema.sql` in your project
2. Select all the SQL code (Ctrl+A, Ctrl+C)
3. Paste it into the Supabase SQL Editor
4. Click **"Run"** to execute

### 1.3 Verify Tables Were Created
After running the schema, go to **Table Editor** to verify these tables were created:
- ✅ `profiles` - User profiles with roles
- ✅ `projects` - Client projects  
- ✅ `invoices` - Invoice management
- ✅ `files` - File uploads
- ✅ `music_campaigns` - Music promotion campaigns
- ✅ `blog_posts` - Blog content
- ✅ `newsletter_subscribers` - Newsletter subscribers
- ✅ `chat_leads` - Chat leads

## Step 2: Configure Environment Variables in Vercel

### 2.1 Get Your Supabase Credentials
1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Public anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### 2.2 Add to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Select your `purplesofthub` project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
NEXT_PUBLIC_SITE_URL=https://purplesofthub.vercel.app
```

### 2.3 Redeploy
1. Go to **Deployments** in Vercel
2. Click **"Redeploy"** or push a new commit

## Step 3: Configure Authentication

### 3.1 Enable Auth Providers
1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Enable:
   - ✅ **Email** (for magic links)
   - ✅ **Google** (for Gmail sign-in)
   - ✅ **Apple** (for Apple sign-in)

### 3.2 Set Redirect URLs
In **Authentication** → **Settings**, set:
- **Site URL**: `https://purplesofthub.vercel.app`
- **Redirect URLs**:
  ```
  https://purplesofthub.vercel.app/dashboard
  https://purplesofthub.vercel.app/admin
  https://purplesofthub.vercel.app/sign-in
  https://purplesofthub.vercel.app/sign-up
  ```

## Step 4: Test Your Application

### 4.1 Test Authentication
1. Visit: https://purplesofthub.vercel.app
2. Try signing up with email
3. Check your email for magic link
4. Verify login works

### 4.2 Test Dashboard
1. After login, you should see the dashboard
2. Check browser console (F12) for any errors
3. Test admin dashboard if you have admin access

## Quick Checklist

- [ ] ✅ Run SQL schema in Supabase
- [ ] ✅ Add environment variables to Vercel
- [ ] ✅ Enable authentication providers
- [ ] ✅ Set redirect URLs
- [ ] ✅ Redeploy to Vercel
- [ ] ✅ Test authentication
- [ ] ✅ Test dashboard

## If You Need Help

**Common Issues:**
- **Still getting 500 error**: Check Vercel environment variables are correct
- **Auth not working**: Verify redirect URLs match your Vercel deployment
- **Database errors**: Ensure schema was executed successfully

**Next Steps:**
Once everything works:
1. Test all dashboard features
2. Set up custom domain (optional)
3. Configure monitoring and analytics

Your PurpleSoftHub should be working now! 🎉