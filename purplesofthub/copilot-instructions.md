---
description: "PurpleSoftHub - Strict project structure enforcement"
---

# PROJECT STRUCTURE PROTECTION RULES

⚠️ **CRITICAL**: DO NOT violate these rules. The project took significant effort to stabilize this structure.

## 🔴 ABSOLUTE PROHIBITIONS

### 1. DO NOT CREATE or MOVE files into a `src/` folder
- ❌ NO `src/app/`
- ❌ NO `src/components/`
- ❌ NO `src/hooks/`
- ❌ NO `src/context/`
- ❌ NO `src/types/`
- ✅ All source code MUST stay at root level: `app/`, `components/`, `hooks/`, etc.

### 2. DO NOT reorganize the root structure
- ❌ DO NOT move `components/` → `lib/components/`
- ❌ DO NOT create new top-level folders without explicit user request
- ❌ DO NOT nest common folders (hooks, context, layout)
- ✅ Keep current flat structure at root: `app/`, `components/`, `hooks/`, `context/`, `layout/`, `lib/`, `icons/`, `public/`, `supabase/`, `types/`, `scripts/`

### 3. DO NOT change TypeScript path aliases without explicit user request
- ❌ DO NOT modify `tsconfig.json` paths without updating ALL import statements
- ❌ DO NOT introduce `@/src/*` aliases again
- ✅ Valid aliases ONLY:
  - `@/components/*` → `./components/*`
  - `@/hooks/*` → `./hooks/*`
  - `@/context/*` → `./context/*`
  - `@/layout/*` → `./layout/*`
  - `@/lib/*` → `./lib/*`
  - `@/types/*` → `./types/*`
  - `@/*` → `./*`

### 4. DO NOT create import references to deleted paths
- ❌ DO NOT import from `@/src/components/...` (src folder deleted)
- ❌ DO NOT import from deprecated paths
- ✅ ALWAYS use: `@/components/...`, `@/hooks/...`, etc.

---

## ✅ MANDATORY VERIFICATION BEFORE ANY CHANGES

Before making structural changes, ALWAYS verify:

```bash
# 1. Confirm current structure
ls -la c:\Users\HP\Documents\Code\Softwork\purplesofthub\
# Should show: app/, components/, hooks/, context/, layout/, lib/, icons/, public/, supabase/, types/, scripts/

# 2. Check NO src/ folder exists
if (Test-Path "c:\Users\HP\Documents\Code\Softwork\purplesofthub\src") {
  Write-Error "ERROR: src/ folder exists! This violates project structure rules."
}

# 3. Verify tsconfig.json paths
grep -A 20 '"paths"' c:\Users\HP\Documents\Code\Softwork\purplesofthub\tsconfig.json
# Should show aliases pointing to root level, NOT @/src/*

# 4. Test production build
cd c:\Users\HP\Documents\Code\Softwork\purplesofthub
npm run build
# Must exit with code 0
```

---

## 📋 BEFORE TOUCHING ANY FILES

Ask yourself:

1. **Is this a new file?**
   - Where does it belong in the current structure?
   - Use existing folder naming conventions
   - Place at root level (e.g., `components/`, `hooks/`, `lib/`)

2. **Am I editing an import statement?**
   - Does it use `@/` syntax?
   - Does the path exist (not `@/src/components/...`)?
   - Have I verified the file exists at that path?

3. **Am I moving or deleting files?**
   - Could this break imports?
   - Will path aliases need updating?
   - Check `tsconfig.json` - path aliases correct?

4. **Is there a new folder needed?**
   - Is it a top-level organizational folder? (requires explicit user approval)
   - Or should it go inside an existing folder? (e.g., `components/admin/`, not `admin/`)

---

## 🚀 VALID OPERATIONS

✅ These operations are SAFE and follow project rules:

- Adding new components to `components/` (or `components/admin/`, `components/form/`, etc.)
- Adding new hooks to `hooks/`
- Adding new API routes to `app/api/`
- Adding new pages to `app/` (following Next.js conventions)
- Updating `.env.local` with configuration
- Modifying existing component logic (keeping same file location)
- Adding utility functions to `lib/`
- Adding type definitions to `types/`

---

## ❌ INVALID OPERATIONS

❌ These operations BREAK the project and are FORBIDDEN:

- Creating `src/` folder and moving anything into it
- Moving `components/` → `components-old/` or renaming common folders
- Changing path aliases in `tsconfig.json` to reference `src/`
- Adding imports to deleted files (e.g., `@/src/components/RichTextEditor`)
- Reorganizing root folder structure without explicit approval
- Creating new top-level folders arbitrarily (e.g., `utils/`, `services/`, `helpers/`)

---

## 📍 IMPORT STATEMENT RULES

**CORRECT** ✅:
```typescript
import { ComponentName } from '@/components/folder/ComponentName'
import { useCustomHook } from '@/hooks/useCustomHook'
import { SomeContext } from '@/context/SomeContext'
import { UtilityFunction } from '@/lib/utilities'
```

**INCORRECT** ❌:
```typescript
import { ComponentName } from '@/src/components/folder/ComponentName'  // src/ deleted!
import { ComponentName } from 'src/components/folder/ComponentName'   // No src/ folder
import { ComponentName } from './src/components/ComponentName'         // src/ doesn't exist
import { useHook } from '@/hooks/src/useHook'                         // Wrong path
```

---

## 🔍 FILE LOCATION REFERENCE

| Type | Location | Alias |
|------|----------|-------|
| Page Components | `app/[route]/page.tsx` | `@/app/...` |
| React Components | `components/[type]/ComponentName.tsx` | `@/components/...` |
| Custom Hooks | `hooks/useHookName.ts` | `@/hooks/...` |
| Context Providers | `context/ContextName.tsx` | `@/context/...` |
| Layout Components | `layout/LayoutName.tsx` | `@/layout/...` |
| Utilities | `lib/functionName.ts` | `@/lib/...` |
| Type Definitions | `types/global.d.ts` | `@/types/...` |
| Icons | `icons/index.tsx` | `@/icons/...` |
| API Routes | `app/api/[route]/route.ts` | N/A (app router) |

---

## 🚨 IF YOU SEE A `src/` FOLDER

**THIS IS AN ERROR. STOP IMMEDIATELY.**

1. Delete the entire `src/` folder
2. Move any files to their correct location at root level
3. Update all imports to use root-level paths
4. Run `npm run build` to verify

```bash
# Emergency cleanup
Remove-Item -Recurse -Force c:\Users\HP\Documents\Code\Softwork\purplesofthub\src\
npm run build  # Should compile successfully
```

---

## 💬 USER INTERACTION RULES

Only deviate from this structure if the user EXPLICITLY requests:
- "Move [folder] to..." 
- "Reorganize the structure to..."
- "Create a new top-level folder..."
- "Change the path aliases..."

Generic requests like "add a new component" or "fix imports" should ALWAYS maintain the current structure.

---

## ✨ SUMMARY

**This project structure is FINAL and WORKING. Do not scatter it again.**

- ✅ All source code at ROOT level (no `src/` folder)
- ✅ Path aliases point to root (no `@/src/` references)
- ✅ 93 routes compile successfully
- ✅ Dev server running on localhost:3000
- ✅ GitHub synced and clean

**Maintain this structure in all future work.**

---

*Last Updated: April 7, 2026 | Status: PRODUCTION READY ✅*
