# NotLinear

A comprehensive task management application inspired by Linear, with GitHub integration. Built with Next.js 14, Drizzle ORM, SQLite, and Framer Motion for buttery-smooth animations.

## Features

- **Workspaces & Projects**: Organize work into workspaces and projects
- **Issue Management**: Full CRUD operations with sub-issues support
- **Kanban Board**: Drag-and-drop kanban board with smooth animations
- **GitHub Integration**: Link commits and pull requests to issues
- **Comments**: Markdown-supported comments on issues
- **Command Palette**: Quick navigation with Cmd/Ctrl+K
- **Smooth Animations**: Framer Motion powered transitions and micro-interactions
- **Authentication**: NextAuth.js with GitHub OAuth and credentials

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with Drizzle ORM
- **Authentication**: NextAuth.js
- **Styling**: TailwindCSS + shadcn/ui
- **Animations**: Framer Motion
- **State Management**: Zustand
- **Forms**: React Hook Form + Zod
- **Drag & Drop**: @dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd notlinear
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

4. Initialize the database:
```bash
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Management

- **Push schema changes**: `npm run db:push`
- **Generate migrations**: `npm run db:generate`
- **Open Drizzle Studio**: `npm run db:studio`

## Project Structure

```
notlinear/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/      # React components
│   │   ├── ui/          # shadcn/ui components
│   │   ├── issues/      # Issue-related components
│   │   ├── kanban/      # Kanban board components
│   │   └── layout/      # Layout components
│   ├── lib/
│   │   ├── actions/     # Server actions
│   │   ├── db/          # Database schema and client
│   │   └── auth.ts       # NextAuth configuration
│   └── types/           # TypeScript types
├── drizzle.config.ts     # Drizzle configuration
└── package.json
```

## Key Features Implementation

### Issue Identifiers
Issues use Linear-style identifiers: `PROJ-123` format, where `PROJ` is derived from the project name and `123` is an auto-incrementing counter.

### GitHub Integration
- Commits can be linked to issues via commit messages: `fixes #PROJ-123`
- Pull requests can reference issues in their body
- GitHub webhooks are supported at `/api/webhooks/github`

### Animations
All interactions use Framer Motion for smooth transitions:
- Page transitions
- Staggered list animations
- Drag-and-drop animations
- Micro-interactions on hover/focus

## Development

### Adding a New Feature

1. Create server actions in `src/lib/actions/`
2. Add database schema changes if needed
3. Create components in `src/components/`
4. Add pages in `src/app/`

### Database Schema Changes

1. Update `src/lib/db/schema.ts`
2. Run `npm run db:push` to apply changes
3. Or generate migrations with `npm run db:generate`

## License

MIT

