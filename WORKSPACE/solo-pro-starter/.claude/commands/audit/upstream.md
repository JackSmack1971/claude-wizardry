---
description: Run an audit-only repository pass and create one GitHub issue per confirmed finding.
argument-hint: "[scope-or-pr]"
allowed-tools:
  - Read
  - Bash(git status)
  - Bash(git diff)
  - Bash(node .claude/workflows/upstream-audit.js:*)
---

# /audit:upstream

Run an audit-only repository pass against `$ARGUMENTS` and create one issue per confirmed finding.

## Context

- Treat `$ARGUMENTS` as the audit target: a PR, branch, path, or current repository state.
- Use `@.claude/workflows/upstream-audit.js` as the phase-order contract.
- Use `@.claude/agents/upstream-auditor.md` for evidence-backed issue drafting and deduplication.

## Requirements

- Audit only. Do not edit production code, test code, or release artifacts.
- Confirm evidence before issue creation.
- Deduplicate findings.
- Issue bodies must be implementation-ready, not vague summaries.

## Execution Steps

1. Resolve the audit target from `$ARGUMENTS`.
2. Inspect the repository or diff and confirm only evidence-backed findings.
3. Deduplicate findings and discard weak or purely stylistic observations.
4. Create one issue-ready body per confirmed finding.

## Required Output

- Audit target
- Confirmed findings count
- Issue-ready bodies
- Evidence and impact summary
- Verification steps for downstream implementation
