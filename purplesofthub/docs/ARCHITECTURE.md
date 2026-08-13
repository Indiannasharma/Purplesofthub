# PurpleSoftHub Architecture

## Platform Overview

PurpleSoftHub is evolving from a digital agency website into a Digital Innovation Platform. Multiple authenticated products will share one UI foundation instead of each shipping its own chrome.

Current products:

- Agency
- Academy
- Music Services
- Marketplace
- Support
- Billing
- Client Portal
- Student Portal
- Instructor Portal
- Staff Portal
- Admin Portal

Future product:

- AI Hub

## Current Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, shadcn/ui, Lucide
- Backend: Supabase, PostgreSQL
- Local infrastructure: Docker Compose, PostgreSQL, Redis, MinIO, Mailhog

## Module Architecture

The Platform Shell is the shared authenticated workspace. Product modules render inside it.

The shell owns:

- Sidebar
- Topbar
- Breadcrumbs
- Workspace header
- Global search UI
- Notifications UI
- User menu
- Quick actions
- Theme toggle

Product modules own:

- Their own routes
- Their own page content
- Their own feature logic
- Their own data access

Do not create a second sidebar or topbar for Academy, Music, Marketplace, or Agency. Those products plug into this shell in later sprints.

## Folder Organization

```text
components/
  layout/           AppShell, AppSidebar, AppTopbar, WorkspaceHeader, MobileNavigation
  navigation/       SidebarNav, SidebarItem, Breadcrumbs
  search/           CommandSearch
  notifications/    NotificationMenu
  user/             UserMenu, ProfileMenu
  workspace/        QuickActions, ThemeToggle
lib/
  navigation.ts     Configuration-driven menus
  roles.ts          Placeholder role labels only
  workspace.ts      Workspace metadata and breadcrumbs
app/platform/       Placeholder module routes that all use AppShell
```

## Shared Shell Philosophy

The shell should feel like a premium SaaS operating system, not an admin template.

Design priorities:

- Fast navigation
- Clear hierarchy
- Minimal visual noise
- Responsive layout behavior
- Strong accessibility
- Consistent composition across products

## Navigation Architecture

Navigation is configuration-driven in `lib/navigation.ts`. Do not hardcode menus in the sidebar.

Each item defines:

- `id`
- `title`
- `href`
- `icon`
- `roles`
- `badge`
- `children`

Supported placeholder roles:

- Guest
- Client
- Student
- Instructor
- Artist
- Staff
- Admin
- Super Admin

Role fields exist so later RBAC can filter the same config. This sprint does not enforce permissions. The shell previews the Admin menu so every module is visible.

## Responsive Shell

- Desktop (`lg+`): fixed sidebar, expanded by default, user-collapsible
- Tablet (`md` to `lg`): collapsible icon rail, tooltips, user-expandable
- Mobile (`< md`): sidebar hidden, Sheet navigation from the topbar

Collapsed mode keeps icons, active states, and tooltips. Nested menus expand in place when the sidebar is open.

## Isolation Rules

The new shell lives at `/platform/*`. It is intentionally separate from:

- The marketing website (`/`, `/about`, `/services`, `/academy`, `/music`, ...)
- The existing client dashboard (`/dashboard`)
- The existing admin console (`/admin`)
- Authentication (`/sign-in`, `/sign-up`, `/app/api/auth`, Supabase clients)
- API routes and business services

Sprint 3 must not modify those systems. Existing dashboards keep their current layouts until a later migration sprint.

## Next Layers

- Sprint 4: Core Platform Services
- Sprint 5: PurpleSoftHub Academy
- Sprint 6: Music Services Platform
- Sprint 7: Marketplace
- Sprint 8: Agency Workspace
