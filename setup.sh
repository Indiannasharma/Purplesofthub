#!/bin/bash

echo "🚀 Setting up PurpleSoftHub with Supabase..."

# Install missing dependencies
echo "📦 Installing React Query..."
npm install @tanstack/react-query @tanstack/react-query-devtools

# Create directories if they don't exist
echo "📁 Creating directories..."
mkdir -p components/ui
mkdir -p lib/supabase

# Create .env.local from template if it doesn't exist
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local from template..."
    cp .env.local.example .env.local
    echo "⚠️  Please edit .env.local with your Supabase credentials!"
fi

# Check if all required files exist
echo "✅ Checking required files..."
required_files=(
    "lib/supabase/server.ts"
    "lib/supabase/client.ts"
    "lib/supabase/schema.sql"
    "middleware.ts"
    "app/dashboard/layout.tsx"
    "app/admin/layout.tsx"
    "components/dashboard/Sidebar.tsx"
    "components/dashboard/Header.tsx"
    "components/ui/Card.tsx"
    "components/ui/Badge.tsx"
    "app/dashboard/page.tsx"
    "app/admin/page.tsx"
    "app/api/auth/route.ts"
    "app/api/dashboard/route.ts"
)

missing_files=()
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        missing_files+=("$file")
    fi
done

if [ ${#missing_files[@]} -eq 0 ]; then
    echo "✅ All required files are present!"
else
    echo "❌ Missing files:"
    for file in "${missing_files[@]}"; do
        echo "  - $file"
    done
fi

echo ""
echo "🎯 Next Steps:"
echo "1. Create your Supabase project at https://supabase.com"
echo "2. Add your credentials to .env.local"
echo "3. Run the SQL schema in lib/supabase/schema.sql"
echo "4. Configure authentication providers in Supabase dashboard"
echo "5. Run 'npm run dev' to start the development server"
echo ""
echo "📖 See SETUP_SUPABASE.md for detailed instructions!"