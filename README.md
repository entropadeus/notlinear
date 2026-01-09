# NotLinear

**An open source, Linear-adjacent task management app.**

Built for teams who want the Linear experience without the price tag. Self-hostable, extensible, and free forever.

## Features

- **Workspaces & Projects** - Organize work into logical hierarchies
- **Kanban Board** - Drag-and-drop with buttery-smooth animations
- **Issue Management** - Full CRUD with sub-issues support
- **Linear-style IDs** - Familiar `PROJ-123` identifiers
- **GitHub Integration** - Link commits and PRs to issues
- **Command Palette** - Quick navigation with `Cmd/Ctrl+K`
- **Markdown Comments** - Rich text on every issue
- **Dark Mode** - Easy on the eyes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite + Drizzle ORM
- **Auth**: NextAuth.js
- **Styling**: TailwindCSS + shadcn/ui
- **Animations**: Framer Motion
- **State**: Zustand
- **Forms**: React Hook Form + Zod
- **DnD**: @dnd-kit

## Quick Start

```bash
git clone https://github.com/entropadeus/notlinear.git
cd notlinear
npm install

cp .env.example .env.local
# Edit .env.local with your secrets

npm run db:push
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=optional-for-oauth
GITHUB_CLIENT_SECRET=optional-for-oauth
```

## Commands

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run db:push      # Push schema changes
npm run db:studio    # Drizzle Studio GUI
```

## License

MIT
