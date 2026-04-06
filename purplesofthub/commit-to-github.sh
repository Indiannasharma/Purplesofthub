#!/bin/bash

echo "🚀 PurpleSoftHub - GitHub Commit Script"
echo "========================================="

# Check if git is installed
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    echo "❌ Not in a git repository. Please initialize git first."
    echo "💡 Run: git init"
    exit 1
fi

# Check if remote origin exists
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "❌ No remote origin found. Adding GitHub remote..."
    git remote add origin https://github.com/Indiannasharma/Purplesofthub.git
    echo "✅ Added remote origin: https://github.com/Indiannasharma/Purplesofthub.git"
fi

# Check current branch
current_branch=$(git branch --show-current)
if [ -z "$current_branch" ]; then
    current_branch="main"
    echo "📝 No current branch detected, using 'main'"
fi

echo "📊 Current branch: $current_branch"
echo ""

# Check for untracked files
echo "📋 Checking for untracked files..."
untracked_files=$(git status --porcelain | grep "^??" | wc -l)
modified_files=$(git status --porcelain | grep "^ M" | wc -l)
new_files=$(git status --porcelain | grep "^A" | wc -l)

echo "📊 Status:"
echo "  - Untracked files: $untracked_files"
echo "  - Modified files: $modified_files"
echo "  - New files: $new_files"
echo ""

# Add all untracked files
if [ $untracked_files -gt 0 ] || [ $modified_files -gt 0 ] || [ $new_files -gt 0 ]; then
    echo "📁 Adding all changes to staging area..."
    git add .
    echo "✅ All changes added to staging area"
else
    echo "ℹ️  No changes to commit"
fi

# Create commit message
echo ""
echo "📝 Creating commit message..."
commit_message="🚀 Complete Vercel Deployment Setup

✨ Major Updates:
- ✅ Complete Supabase integration (auth, database, storage)
- ✅ Modern dashboard system with role-based access
- ✅ Vercel-ready configuration and deployment setup
- ✅ Professional UI components and layouts
- ✅ Production-ready architecture

🔧 Technical Improvements:
- 🗄️ Complete database schema with RLS policies
- 🔐 Secure authentication (Email, Google, Apple)
- 🎨 Responsive dashboard layouts (client & admin)
- 📱 Mobile-friendly design with dark/light themes
- 🚀 Vercel optimization and deployment scripts

📁 New Files Added:
- Dashboard layouts and components
- Supabase integration helpers
- API routes for authentication and data
- Vercel configuration and deployment guides
- Comprehensive documentation

🎯 Ready for production deployment on Vercel!"

# Create commit
echo "📝 Committing changes..."
git commit -m "$commit_message"

if [ $? -eq 0 ]; then
    echo "✅ Commit successful!"
else
    echo "ℹ️  No changes to commit (everything is up to date)"
fi

# Push to GitHub
echo ""
echo "📤 Pushing to GitHub..."
echo "Repository: https://github.com/Indiannasharma/Purplesofthub"
echo "Branch: $current_branch"
echo ""

# Check if branch exists on remote
if git ls-remote --heads origin $current_branch | grep -q $current_branch; then
    echo "🔄 Pushing to existing branch..."
    git push origin $current_branch
else
    echo "🆕 Creating new branch on remote..."
    git push -u origin $current_branch
fi

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Successfully pushed to GitHub!"
    echo ""
    echo "🔗 Repository: https://github.com/Indiannasharma/Purplesofthub"
    echo "📍 Branch: $current_branch"
    echo ""
    echo "🚀 Next Steps:"
    echo "1. Go to GitHub and verify the changes"
    echo "2. Set up Vercel integration (if not already done)"
    echo "3. Configure environment variables in Vercel dashboard"
    echo "4. Deploy to Vercel using the deployment guide"
    echo ""
    echo "📖 For deployment instructions, see:"
    echo "  - VERCEL_DEPLOYMENT.md (detailed guide)"
    echo "  - deploy.sh (automated deployment script)"
    echo "  - DEPLOYMENT_SUMMARY.md (quick overview)"
else
    echo "❌ Failed to push to GitHub. Please check:"
    echo "  - Your internet connection"
    echo "  - GitHub authentication (SSH key or HTTPS credentials)"
    echo "  - Repository permissions"
    echo ""
    echo "💡 Try running 'git status' and 'git log' to check the current state"
fi

echo ""
echo "✨ Commit completed! Your PurpleSoftHub is now ready for Vercel deployment. 🚀"