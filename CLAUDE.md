# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NotLinear is a Linear-inspired task management app with GitHub integration. Built with Next.js 14 App Router, SQLite/Drizzle ORM, and TailwindCSS.

## Commands

```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint
npm run db:push      # Push schema changes to SQLite
npm run db:generate  # Generate Drizzle migrations
npm run db:studio    # Open Drizzle Studio GUI
```

## Architecture

### Data Flow
- **Server Actions** (`src/lib/actions/`) handle all database operations with session validation
- Actions verify workspace membership before allowing operations
- `revalidatePath()` used after mutations to refresh UI

### Database Schema (`src/lib/db/schema.ts`)
Core entities:
- **users** - Auth users (NextAuth with GitHub OAuth + credentials)
- **workspaces** - Top-level organization unit, has owner and members
- **projects** - Belong to workspaces, track `issueCounter` for identifier generation
- **issues** - Use `PROJ-123` identifier format, have status/priority/position, support sub-issues via `parentId`
- **labels, comments, gitCommits, pullRequests** - Supporting entities with many-to-many joins

### Issue Statuses
`backlog` | `todo` | `in_progress` | `in_review` | `done` | `cancelled`

### Priority Levels
`none` | `low` | `medium` | `high` | `urgent`

### Route Structure
```
src/app/
  (auth)/login, register     # Auth pages
  (dashboard)/
    dashboard/               # Main dashboard, projects list, settings
    w/[workspaceSlug]/       # Workspace-scoped routes
      issue/[issueId]/       # Issue detail
      projects/[projectId]/  # Project issues list
        board/               # Kanban board view
```

### Key Components
- `src/components/kanban/` - Drag-and-drop board using @dnd-kit
- `src/components/command-palette.tsx` - Cmd/Ctrl+K quick navigation
- `src/components/ui/` - shadcn/ui primitives

### State Management
- **Zustand** for client-side state
- **React Hook Form + Zod** for form handling

### Path Alias
`@/*` maps to `./src/*`

## Environment Variables

Required in `.env.local`:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<secret>
GITHUB_CLIENT_ID=<optional>
GITHUB_CLIENT_SECRET=<optional>
```

## GitHub Integration

- Commits linked via message: `fixes #PROJ-123`
- Webhook endpoint: `/api/webhooks/github`
