# Task Completion Checklist

## Before Committing
1. Run `npm run lint` to check for linting errors
2. Test the feature manually in browser (dev server should be running)
3. Check for TypeScript errors in the terminal

## Commit Guidelines
- Short imperative messages (e.g., "Add assignee selection to issues")
- Reference issue identifiers if applicable
- Include Co-Authored-By for AI-assisted commits

## After Changes
- Use `revalidatePath()` in server actions after mutations
- Router.refresh() in client components after server action calls
