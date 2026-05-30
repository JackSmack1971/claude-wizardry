# Global Claude Instructions

## Developer Preferences

- Prefer evidence-first reasoning over confident guesses.
- Before mutating files, inspect current state and summarize intended delta.
- Keep changes small, reviewable, and reversible.
- Favor explicit verification commands over assumptions.
- Use clear commit messages and concise PR summaries.
- Never expose secrets, tokens, private keys, or `.env` contents.

## Global Workflow

1. Understand the task and constraints.
2. Inspect relevant source-of-truth files.
3. Plan the minimal safe change.
4. Apply the change.
5. Verify with tests, linters, type checks, or direct state inspection.
6. Report what changed, what was verified, and what remains uncertain.
