# NotLinear - Project Overview

## Purpose
Linear-inspired task management app with GitHub integration. Provides workspaces, projects, issues, kanban boards, and real-time collaboration.

## Tech Stack
- **Framework**: Next.js 14.2.5 (App Router)
- **Database**: SQLite with Drizzle ORM
- **Styling**: TailwindCSS + shadcn/ui components
- **Auth**: NextAuth.js (GitHub OAuth + credentials)
- **State**: Zustand (client), React Hook Form + Zod (forms)
- **Animations**: Framer Motion
- **Drag & Drop**: @dnd-kit

## Key Entities
- **users** - Auth users
- **workspaces** - Top-level organization, has owner and members
- **projects** - Belong to workspaces, track issueCounter for identifiers
- **issues** - Use PROJ-123 format, have status/priority/position, support sub-issues
- **labels, comments, views** - Supporting entities

## Issue Statuses
`backlog` | `todo` | `in_progress` | `in_review` | `done` | `cancelled`

## Priority Levels
`none` | `low` | `medium` | `high` | `urgent`
