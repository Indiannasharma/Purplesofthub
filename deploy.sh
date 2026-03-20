#!/bin/bash

echo "🚀 PurpleSoftHub Vercel Deployment Script"
echo "=========================================="

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if logged into Vercel
echo "🔐 Checking Vercel login status..."
vercel whoami 2>/dev/null || {
    echo "⚠️  Not logged into Vercel. Please run 'vercel login' first."
    exit 1
}

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check for environment variables
echo "📝 Checking environment variables..."
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please create it with your Supabase credentials."
    echo "💡 Copy .env.local.example to .env.local and fill in your credentials."
    exit 1
fi

# Verify required environment variables
required_vars=("NEXT_PUBLIC_SUPABASE_URL" "NEXT_PUBLIC_SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY")
missing_vars=()

for var in "${required_vars[@]}"; do
    if ! grep -q "^$var=" .env.local; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo "💡 Please add these to your .env.local file."
    exit 1
fi

# Update SITE_URL for production
echo "🌐 Updating SITE_URL for production..."
read -p "Enter your Vercel project name (or leave empty to skip): " vercel_project
if [ ! -z "$vercel_project" ]; then
    sed -i.bak "s|NEXT_PUBLIC_SITE_URL=.*|NEXT_PUBLIC_SITE_URL=https://$vercel_project.vercel.app|" .env.local
    echo "✅ Updated SITE_URL to https://$vercel_project.vercel.app"
fi

# Build the project
echo "🔨 Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed. Please fix the errors above."
    exit 1
fi

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
vercel

# Set environment variables in Vercel
echo "📝 Setting environment variables in Vercel..."
while IFS= read -r line; do
    if [[ $line =~ ^[A-Z_]+=.+ ]]; then
        var_name=$(echo "$line" | cut -d'=' -f1)
        var_value=$(echo "$line" | cut -d'=' -f2-)
        
        # Skip SITE_URL as it should be set to the deployment URL
        if [ "$var_name" != "NEXT_PUBLIC_SITE_URL" ]; then
            echo "Setting $var_name..."
            vercel env add "$var_name" production <<< "$var_value"
        fi
    fi
done < .env.local

echo ""
echo "🎉 Deployment completed!"
echo ""
echo "📋 Next Steps:"
echo "1. Update your Supabase Authentication settings with the new deployment URL"
echo "2. Visit your deployed application"
echo "3. Test the authentication flow"
echo ""
echo "🔗 Useful commands:"
echo "  vercel logs                    # View deployment logs"
echo "  vercel --prod                 # Deploy to production"
echo "  vercel env ls                 # List environment variables"
echo ""
echo "📖 For detailed instructions, see VERCEL_DEPLOYMENT.md"