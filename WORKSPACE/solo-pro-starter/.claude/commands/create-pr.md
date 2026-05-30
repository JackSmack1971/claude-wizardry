---
description: Legacy compatibility alias for the canonical namespaced create PR command.
argument-hint: "[issue-url-or-number]"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash(git status)
  - Bash(git diff)
---

# /create-pr

Compatibility alias for `/create:pr`.

## Context

- Primary input: `$ARGUMENTS`
- Prefer the canonical command surface at `@.claude/commands/create/pr.md`.
- Use the existing project workflow contract in `@.claude/workflows/issue-to-pr.js`.
- Respect the active rule stack when wallet, transaction, chain, contract, generated-artifact, or release surfaces are touched.

## Requirements

- Preserve the same output shape as `/create:pr`.

## Execution Steps

1. Parse the issue reference from `$ARGUMENTS`.
2. Follow the canonical contract in `@.claude/commands/create/pr.md`.
3. Return the same issue-to-PR report shape.

## Required Output

- Match `/create:pr`.
