---
description: Legacy compatibility alias for the canonical namespaced review PR command.
argument-hint: "[pr-url-or-number]"
allowed-tools:
  - Read
  - Bash(git diff)
  - Bash(git log --oneline -20)
---

# /review-pr

Compatibility alias for `/review:pr`.

## Context

- Primary input: `$ARGUMENTS`
- Prefer the canonical command surface at `@.claude/commands/review/pr.md`.
- Use the existing project workflow contract in `@.claude/workflows/review-readiness.js`.
- Apply the active rule stack when security, wallet, transaction, chain, or release surfaces are touched.

## Requirements

- Preserve the same output shape as `/review:pr`.

## Execution Steps

1. Parse the PR reference from `$ARGUMENTS`.
2. Follow the canonical contract in `@.claude/commands/review/pr.md`.
3. Return the same merge-readiness report shape.

## Required Output

- Match `/review:pr`.
