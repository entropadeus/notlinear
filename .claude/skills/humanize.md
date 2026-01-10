# Humanize Code Skill

Reviews code and adds human touches to make it look like a real developer wrote it - not sterile AI-generated code. The code remains fully functional but gains personality.

**Triggers:** "humanize", "make it human", "dev style", "less robotic", "add personality", "real developer"

## What This Skill Does

Takes code that looks too clean/perfect and adds realistic human touches:

### Naming Quirks
- Slightly inconsistent naming (mix of `getData` and `fetchUserInfo` styles)
- Occasional abbreviations devs actually use (`btn`, `msg`, `tmp`, `idx`, `cnt`)
- Names that reveal thought process (`actuallyWorkingVersion`, `thisFixesThatBug`)
- The odd typo that stuck (`referer`, `doublePrecison`)

### Comment Style
- Terse comments that assume context: `// fix for Safari`
- Self-deprecating: `// yeah this is ugly but it works`
- TODOs that will never get done: `// TODO: refactor this someday`
- Frustrated comments: `// why does this even work`
- Credit where due: `// stolen from stackoverflow`
- Dated comments: `// added 2024-03-15 - broke prod without this`

### Code Structure
- Not everything perfectly extracted into functions
- Occasional inline logic where "it's fine for now"
- That one function that's 80 lines because refactoring is scary
- Magic numbers with half-assed comments: `timeout: 3000, // 3 seconds, seems to work`
- Defensive code that hints at past trauma: `if (user && user.id && user.id !== null)`

### Formatting Quirks
- Slightly inconsistent spacing in places
- That one file where tabs snuck in
- A blank line or two that doesn't follow the pattern
- Commented-out code "just in case"
- Debug logs that got left in (commented)

### Logic Patterns
- Early returns mixed with else blocks
- Ternaries that are a bit too long but "readable enough"
- Array methods where a for loop "would have been fine too"
- That try-catch that catches everything because "better safe than sorry"

## Process

1. **Read the target code** - understand what it does
2. **Identify AI tells** - overly consistent naming, perfect structure, verbose comments
3. **Apply human touches** - sprinkle in quirks without breaking functionality
4. **Keep it working** - all changes are cosmetic/stylistic, logic stays intact
5. **Don't overdo it** - subtle is key, not a parody

## Examples

### Before (AI-style)
```typescript
/**
 * Fetches user data from the API and handles potential errors.
 * @param userId - The unique identifier of the user
 * @returns Promise resolving to user data or null if not found
 */
async function fetchUserData(userId: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${userId}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch user data:', error);
    return null;
  }
}
```

### After (Humanized)
```typescript
// get user from api
async function getUser(id: string): Promise<User | null> {
  try {
    const res = await fetch(`/api/users/${id}`);
    if (!res.ok) return null; // 404s happen, whatever
    return await res.json();
  } catch (err) {
    console.error('getUser failed:', err); // TODO: proper error handling
    return null;
  }
}
```

## Important Notes

- **Never break functionality** - this is purely cosmetic
- **Match the existing codebase style** - if the project has conventions, blend in
- **Subtlety matters** - we're adding personality, not creating a meme
- **Context awareness** - production code vs side project vs prototype all have different vibes
- **Preserve intent** - the code should still be maintainable

## Invoke With

"humanize this code" / "make it look like a dev wrote it" / "less AI vibes"
