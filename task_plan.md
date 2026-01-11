# Task Plan: Filters & Views System

## Goal
Build a Linear-style filter system with URL-based filters, a filter bar UI, and saved views that persist to the database.

## Phases
- [x] Phase 1: Research existing codebase structure (schema, issue fetching, routing)
- [x] Phase 2: Design database schema for saved views
- [x] Phase 3: Build filter parsing utilities (URL <-> filter state)
- [x] Phase 4: Create server actions for filtered issue fetching
- [ ] Phase 5: Build FilterBar UI component
- [ ] Phase 6: Build SavedViews sidebar component
- [ ] Phase 7: Integrate into project/workspace pages
- [ ] Phase 8: Add quick filters (My Issues, Recently Updated)
- [ ] Phase 9: Test and polish

## Key Questions
1. What fields can we filter on? (status, priority, assignee, labels, dates)
2. How does the current issue fetching work?
3. What's the URL structure for workspace/project pages?
4. Do we need workspace-level AND project-level views?
5. How to handle "My Issues" - need current user context

## Architecture Decisions
- [Pending]: URL structure for filters
- [Pending]: Filter state management (URL vs Zustand vs both)
- [Pending]: Server-side vs client-side filtering

## Errors Encountered
(none yet)

## Status
**Currently in Phase 1** - Researching existing codebase structure
