# Code Style & Conventions

## TypeScript
- Strict mode enabled
- Use interfaces for props, types for unions
- Path alias: `@/*` maps to `./src/*`

## React Patterns
- Server Components by default (App Router)
- `"use client"` directive for client components
- Server Actions in `src/lib/actions/` for all DB operations
- Actions verify session + workspace membership before operations
- Use `revalidatePath()` after mutations

## File Structure
```
src/
  app/                    # Next.js App Router pages
    (auth)/               # Auth pages (login, register)
    (dashboard)/          # Main app pages
      dashboard/          # Dashboard, projects list
      w/[workspaceSlug]/  # Workspace-scoped routes
  components/
    ui/                   # shadcn/ui primitives
    kanban/               # Drag-and-drop board
    issues/               # Issue components
    filters/              # Filter system
  lib/
    actions/              # Server actions
    db/                   # Drizzle schema & client
    filters/              # Filter types & utils
```

## Naming
- Components: PascalCase
- Files: kebab-case
- Server actions: camelCase functions
- DB tables: camelCase (drizzle convention)

## UI
- Use shadcn/ui components from `@/components/ui`
- TailwindCSS for styling
- Framer Motion for animations
- Custom classes: `btn-premium`, `card-premium`, `glass`
