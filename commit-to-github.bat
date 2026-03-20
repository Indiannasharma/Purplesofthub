@echo off
echo 🚀 PurpleSoftHub - GitHub Commit Script
echo =========================================

REM Check if git is installed
git --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Git is not installed. Please install Git first.
    pause
    exit /b 1
)

REM Check if we're in a git repository
git rev-parse --git-dir >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Not in a git repository. Please initialize git first.
    echo 💡 Run: git init
    pause
    exit /b 1
)

REM Check if remote origin exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ No remote origin found. Adding GitHub remote...
    git remote add origin https://github.com/Indiannasharma/Purplesofthub.git
    echo ✅ Added remote origin: https://github.com/Indiannasharma/Purplesofthub.git
)

REM Check current branch
for /f "delims=" %%i in ('git branch --show-current') do set current_branch=%%i
if "%current_branch%"=="" (
    set current_branch=main
    echo 📝 No current branch detected, using 'main'
)

echo 📊 Current branch: %current_branch%
echo.

REM Check for untracked files
echo 📋 Checking for untracked files...
for /f %%a in ('git status --porcelain ^| find /c "?? "') do set untracked_files=%%a
for /f %%a in ('git status --porcelain ^| find /c " M "') do set modified_files=%%a
for /f %%a in ('git status --porcelain ^| find /c "A "') do set new_files=%%a

echo 📊 Status:
echo   - Untracked files: %untracked_files%
echo   - Modified files: %modified_files%
echo   - New files: %new_files%
echo.

REM Add all untracked files
if %untracked_files% gtr 0 (
    echo 📁 Adding untracked files to staging area...
    git add .
    echo ✅ Untracked files added to staging area
)

if %modified_files% gtr 0 (
    echo 📁 Adding modified files to staging area...
    git add .
    echo ✅ Modified files added to staging area
)

if %new_files% gtr 0 (
    echo 📁 Adding new files to staging area...
    git add .
    echo ✅ New files added to staging area
)

REM Create commit
echo.
echo 📝 Creating commit...
git commit -m "🚀 Complete Vercel Deployment Setup

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

if %errorlevel% equ 0 (
    echo ✅ Commit successful!
) else (
    echo ℹ️  No changes to commit (everything is up to date)
)

REM Push to GitHub
echo.
echo 📤 Pushing to GitHub...
echo Repository: https://github.com/Indiannasharma/Purplesofthub
echo Branch: %current_branch%
echo.

REM Check if branch exists on remote
git ls-remote --heads origin %current_branch% | findstr %current_branch% >nul
if %errorlevel% equ 0 (
    echo 🔄 Pushing to existing branch...
    git push origin %current_branch%
) else (
    echo 🆕 Creating new branch on remote...
    git push -u origin %current_branch%
)

if %errorlevel% equ 0 (
    echo.
    echo 🎉 Successfully pushed to GitHub!
    echo.
    echo 🔗 Repository: https://github.com/Indiannasharma/Purplesofthub
    echo 📍 Branch: %current_branch%
    echo.
    echo 🚀 Next Steps:
    echo 1. Go to GitHub and verify the changes
    echo 2. Set up Vercel integration (if not already done)
    echo 3. Configure environment variables in Vercel dashboard
    echo 4. Deploy to Vercel using the deployment guide
    echo.
    echo 📖 For deployment instructions, see:
    echo   - VERCEL_DEPLOYMENT.md (detailed guide)
    echo   - deploy.sh (automated deployment script)
    echo   - DEPLOYMENT_SUMMARY.md (quick overview)
) else (
    echo ❌ Failed to push to GitHub. Please check:
    echo   - Your internet connection
    echo   - GitHub authentication (SSH key or HTTPS credentials)
    echo   - Repository permissions
    echo.
    echo 💡 Try running 'git status' and 'git log' to check the current state
)

echo.
echo ✨ Commit completed! Your PurpleSoftHub is now ready for Vercel deployment. 🚀
pause