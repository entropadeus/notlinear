# Notes: Filters & Views Implementation

## Existing Schema Analysis

### Filterable Fields on Issues:
- `status`: text - backlog, todo, in_progress, in_review, done, cancelled
- `priority`: text - none, low, medium, high, urgent
- `assigneeId`: text - references users.id (can be null for unassigned)
- `projectId`: text - for workspace-level filtering
- `createdAt`: timestamp
- `updatedAt`: timestamp
- `completedAt`: timestamp (null if not done)

### Labels (many-to-many):
- `issueLabels` join table links issues to labels
- Will need LEFT JOIN or subquery for label filtering

## Current Issue Fetching
- `getIssues(projectId?, workspaceId?)` in `src/lib/actions/issues.ts`
- Simple projectId/workspaceId filter only
- Returns `Issue[]` interface

## URL Structure Decision
Format: `/w/{slug}/projects/{id}?status=todo,in_progress&priority=high,urgent&assignee=me,{userId}&label={labelId}`

Special values:
- `assignee=me` → current user
- `assignee=none` → unassigned issues

## Architecture

### 1. Filter Types (`src/lib/filters/types.ts`)
```typescript
interface IssueFilters {
  status?: string[]        // multiple statuses
  priority?: string[]      // multiple priorities
  assignee?: string[]      // user IDs or "me" or "none"
  labels?: string[]        // label IDs
  project?: string[]       // project IDs (workspace-level only)
  createdAfter?: Date
  createdBefore?: Date
}
```

### 2. Database Schema Addition
```sql
CREATE TABLE views (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  filters TEXT NOT NULL,      -- JSON stringified IssueFilters
  workspaceId TEXT NOT NULL,
  projectId TEXT,             -- null = workspace-level view
  createdById TEXT NOT NULL,
  isDefault INTEGER DEFAULT 0,
  icon TEXT,
  color TEXT,
  createdAt INTEGER,
  updatedAt INTEGER
)
```

### 3. Server Action Changes
- Extend `getIssues` or create `getFilteredIssues`
- Use drizzle's `and()`, `or()`, `inArray()` for dynamic queries
- Handle "me" → session.user.id substitution
- Handle "none" → IS NULL

### 4. Quick Filters (Built-in)
- "My Issues" → assignee=me
- "Recently Updated" → sort by updatedAt desc
- "Active" → status=todo,in_progress,in_review
- "Backlog" → status=backlog

## Component Structure

```
src/components/filters/
├── filter-bar.tsx          # Main filter bar with dropdowns
├── filter-dropdown.tsx     # Reusable multi-select dropdown
├── filter-pill.tsx         # Active filter display
├── save-view-dialog.tsx    # Save current filters as view
└── views-list.tsx          # Sidebar views list
```

## Integration Points
1. Project page - pass searchParams, fetch filtered issues
2. Workspace page - same pattern
3. Sidebar - show saved views
4. URL updates - useRouter to push filter changes

## Workspace Members for Assignee Filter
Need to fetch workspace members for assignee dropdown:
- Already have `workspaceMembers` table
- Create `getWorkspaceMembers(workspaceId)` action
