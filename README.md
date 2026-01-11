# NotLinear

**Simple issue tracking for small dev teams.**

No bloated enterprise features. No $10/seat/month. Just a clean, fast issue tracker you can self-host in minutes.

## Who This Is For

- Solo developers managing side projects
- Small teams (2-10 people) who don't need Jira's complexity
- Anyone who wants Linear's UX without the subscription

## Why SQLite?

Intentional choice. For small teams, SQLite is:
- **Zero ops** - No database server to manage
- **Fast** - All data local, sub-millisecond queries
- **Portable** - Backup = copy one file
- **Cheap** - Deploy anywhere for $5/month

You don't need Postgres until you have Postgres problems.

## Features

- **Workspaces & Projects** - Organize work your way
- **Kanban Board** - Drag-and-drop with smooth animations
- **Linear-style IDs** - Familiar `PROJ-123` format
- **GitHub Integration** - Link commits and PRs
- **Command Palette** - `Cmd/Ctrl+K` for everything
- **Real-time Updates** - See changes instantly
- **Dark Mode** - Default, as it should be

## Quick Start

```bash
git clone https://github.com/entropadeus/notlinear.git
cd notlinear
npm install
cp .env.example .env.local
npm run db:push
npm run dev
```

That's it. Open [localhost:3000](http://localhost:3000).

## Deploy

SQLite works on any platform with persistent storage:

| Platform | Cost | Notes |
|----------|------|-------|
| Railway | $5/mo | Easiest |
| Fly.io | $5/mo | With volumes |
| Render | $7/mo | Simple |
| Any VPS | $4-6/mo | Full control |

> **Note**: Won't work on Vercel/serverless (no persistent filesystem). If you need serverless, swap SQLite for [Turso](https://turso.tech) with minimal code changes.

## Self-Host on Your Network

Run NotLinear on any machine on your local network - a spare laptop, Raspberry Pi, or old desktop.

### Setup

```bash
git clone https://github.com/entropadeus/notlinear.git
cd notlinear
npm install
cp .env.example .env.local
npm run db:push
npm run build
```

Update `.env.local` with your machine's local IP:

```
NEXTAUTH_URL=http://YOUR_LOCAL_IP:3000
```

Find your local IP:
- **Windows**: `ipconfig` (look for IPv4 Address)
- **Mac/Linux**: `hostname -I` or `ifconfig`

Then start the server:

```bash
npm run start
```

Anyone on your network can access it at `http://YOUR_LOCAL_IP:3000`.

### Keep It Running

Use PM2 to run in the background and auto-restart on reboot:

```bash
npm install -g pm2
pm2 start npm --name "notlinear" -- start
pm2 startup   # Auto-start on reboot
pm2 save
```

### Raspberry Pi

Works great on Pi 4/5 (4GB+ RAM recommended):

```bash
# Install Node 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt install nodejs

# Then follow setup steps above
```

### Benefits

- Free forever (just electricity)
- Data never leaves your network
- No internet latency
- Works even if your internet goes down

## Tech Stack

- Next.js 14 (App Router)
- SQLite + Drizzle ORM
- NextAuth.js
- TailwindCSS + shadcn/ui
- Framer Motion

## Environment Variables

```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GITHUB_CLIENT_ID=optional
GITHUB_CLIENT_SECRET=optional
```

## Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run db:push      # Apply schema changes
npm run db:studio    # Database GUI
```

## License

MIT - Do whatever you want.
