# PurpleSoftHub Design System

## Design Tokens

The project uses semantic tokens through the shadcn/ui foundation. New Platform Shell work should consume these tokens rather than hardcoded hex values.

Primary platform tokens:

- `background`
- `foreground`
- `card`
- `card-foreground`
- `popover`
- `popover-foreground`
- `primary`
- `primary-foreground`
- `secondary`
- `secondary-foreground`
- `muted`
- `muted-foreground`
- `accent`
- `accent-foreground`
- `destructive`
- `destructive-foreground`
- `border`
- `input`
- `ring`

## Typography

Use clear, modern typography with strong hierarchy.

Recommended usage:

- Compact workspace titles in the topbar
- Medium section titles for cards and panels
- Small descriptive copy for supporting context
- Uppercase tracking labels for sidebar sections

## Color System

PurpleSoftHub branding should remain visible through semantic mapping rather than hardcoded component colors.

Guidelines:

- White-based light mode as the primary surface
- Soft gray surfaces for hierarchy
- Purple accent for primary actions, active navigation, and focus states
- Dark mode derived from semantic variables, not one-off colors

The shell supports Light, Dark, and System through the existing `ThemeProvider` / `next-themes` foundation.

## Component Usage

Use the shared shadcn/ui primitives for new platform work.

Core components:

- Button
- Card
- Input
- Textarea
- Label
- Form
- Dialog
- Sheet
- Dropdown Menu
- Tabs
- Tooltip
- Table
- Skeleton
- Alert
- Sonner
- Badge
- Avatar
- Command
- Collapsible

## Icon Guidelines

Use Lucide icons consistently for navigation and shell actions.

Rules:

- Keep icons simple and line-based
- Match icon size across navigation and actions
- Avoid mixing icon libraries in the shell

## Spacing and Motion

Use restrained spacing and subtle motion.

Motion should be limited to:

- Sheet open/close
- Dropdown transitions
- Sidebar width changes
- Hover states
- Skeleton loading

Avoid excessive animation or decorative effects that distract from the shell.

## Accessibility

Platform Shell surfaces should include:

- Semantic landmarks (`nav`, `main`, `header`, `aside`)
- Keyboard access for search (`⌘K` / `Ctrl+K`), menus, and sidebar controls
- Visible focus rings using the `ring` token
- ARIA labels on icon-only buttons
- `aria-current="page"` on active navigation
- Screen-reader titles on dialogs and sheets
