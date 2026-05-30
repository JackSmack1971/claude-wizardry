---
description: Legacy compatibility alias for the namespaced upstream audit command.
argument-hint: "[scope-or-pr]"
allowed-tools:
  - Read
  - Bash(git status)
  - Bash(git diff)
  - Bash(node .claude/workflows/upstream-audit.js:*)
---

# /audit-upstream

Compatibility alias for `/audit:upstream`.

## Context

- Treat `$ARGUMENTS` as the audit target: a PR, branch, path, or current repository state.
- Prefer the canonical command surface at `@.claude/commands/audit/upstream.md`.
- Use `@.claude/workflows/upstream-audit.js` as the phase-order contract.

## Requirements

- Audit only. Do not edit production code, test code, or release artifacts.
- Preserve the same output shape as `/audit:upstream`.

## Execution Steps

1. Resolve the audit target from `$ARGUMENTS`.
2. Follow the canonical contract in `@.claude/commands/audit/upstream.md`.

## Required Output

- Match `/audit:upstream`.
