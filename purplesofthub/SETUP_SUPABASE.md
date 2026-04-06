# Supabase Setup Guide

This guide will help you connect your Next.js project to Supabase.

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up for a free account
2. Click "New Project"
3. Choose your organization
4. Configure your project:
   - **Name**: `purplesofthub`
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose the region closest to your users
5. Click "Create new project"

## Step 2: Get Your Supabase Credentials

Once your project is created, go to:
1. **Settings** → **API** in your Supabase dashboard
2. Copy these values:
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Public anon key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service role key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep this secure!)

## Step 3: Configure Environment Variables

Create a `.env.local` file in your project root and add your credentials:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Site Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Payment Integration
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
PAYSTACK_SECRET_KEY=your_paystack_secret_key

# Optional: Cloudinary (for file uploads)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Click "New query"
3. Copy and paste the SQL from `lib/supabase/schema.sql`
4. Click "Run" to execute the schema

This will create:
- All necessary tables (profiles, projects, invoices, files, music_campaigns, etc.)
- Row Level Security policies
- Functions for automatic profile creation
- Triggers for updated_at timestamps

## Step 5: Configure Authentication

1. Go to **Authentication** → **Providers** in your Supabase dashboard
2. Enable these providers:
   - **Email** (for magic links)
   - **Google** (for Gmail sign-in)
   - **Apple** (for Apple sign-in)

3. Configure redirect URLs:
   - **Site URL**: `http://localhost:3000`
   - **Redirect URLs**: 
     - `http://localhost:3000/dashboard`
     - `http://localhost:3000/admin`
     - `http://localhost:3000/sign-in`

## Step 6: Set Up Storage (Optional)

1. Go to **Storage** → **Buckets** in your Supabase dashboard
2. Create buckets for:
   - `project-files` (for client project files)
   - `music-tracks` (for music campaign uploads)
   - `blog-images` (for blog post images)

3. Set bucket policies for file access

## Step 7: Install Missing Dependencies

Run this command to install the missing React Query dependency:

```bash
npm install @tanstack/react-query @tanstack/react-query-devtools
```

## Step 8: Create UI Components

Create the missing UI components:

### Card Component
Create `components/ui/Card.tsx`:

```tsx
'use client'

import * as React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {}
interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {}
interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}
      {...props}
    />
  )
)
Card.displayName = 'Card'

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  )
)
CardHeader.displayName = 'CardHeader'

const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-2xl font-semibold leading-none tracking-tight ${className}`}
      {...props}
    />
  )
)
CardTitle.displayName = 'CardTitle'

const CardDescription = React.forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={`text-sm text-muted-foreground ${className}`}
      {...props}
    />
  )
)
CardDescription.displayName = 'CardDescription'

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
  )
)
CardContent.displayName = 'CardContent'

export { Card, CardHeader, CardTitle, CardDescription, CardContent }
```

### Badge Component
Create `components/ui/Badge.tsx`:

```tsx
'use client'

import * as React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success'
}

const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variantClasses = {
      default: 'bg-primary text-primary-foreground',
      secondary: 'bg-secondary text-secondary-foreground',
      destructive: 'bg-destructive text-destructive-foreground',
      outline: 'border border-input bg-background',
      success: 'bg-green-500 text-white',
    }

    return (
      <div
        ref={ref}
        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${variantClasses[variant]} ${className}`}
        {...props}
      />
    )
  }
)
Badge.displayName = 'Badge'

export { Badge }
```

## Step 9: Test Your Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Visit `http://localhost:3000/dashboard` - you should be redirected to sign-in

3. Test the authentication flow by signing up with email

4. Check your Supabase dashboard to see new users being created automatically

## Troubleshooting

### Common Issues:

1. **CORS errors**: Make sure your Site URL is correctly set in Supabase Authentication settings
2. **Auth not working**: Verify your environment variables are correct
3. **Database errors**: Ensure the SQL schema was executed successfully
4. **Missing dependencies**: Run `npm install` to ensure all packages are installed

### Environment Variables Not Loading:

- Restart your development server after creating `.env.local`
- Ensure `.env.local` is in the root directory (same level as `package.json`)
- Check that variable names match exactly (case-sensitive)

## Next Steps

Once everything is connected:
1. Start building your services page
2. Create project management features
3. Implement file upload functionality
4. Add music promotion workflows
5. Set up payment integration with Paystack/Flutterwave

Your Supabase backend is now ready to power your PurpleSoftHub application!