---
description: Implement one issue as a focused pull request for a TypeScript Ethereum dapp.
argument-hint: "[issue-url-or-number]"
allowed-tools:
  - Read
  - Edit
  - Write
  - Bash(git status)
  - Bash(git diff)
---

# /create:pr

Implement exactly one GitHub issue as a focused PR for a TypeScript Ethereum dapp.

## Context

- Primary input: `$ARGUMENTS`
- Treat `$1` as the issue URL or issue number when it is provided as a single token.
- Use the existing project workflow contract in `@.claude/workflows/issue-to-pr.js`.
- Respect the active rule stack, especially `@.claude/rules/frontend-wallets.md`, `@.claude/rules/transaction-execution.md`, `@.claude/rules/chain-config.md`, and `@.claude/rules/smart-contracts.md` when those surfaces are touched.

## Requirements

- Implement exactly one issue scope. Do not silently widen the change into a repo-wide refactor.
- Keep generated artifact churn, chain-config changes, and workflow edits explicit if they are required.
- If the issue changes contract writes, wallet UX, ABI surfaces, or deployment assumptions, call those risks out directly.
- Use the narrowest meaningful verification the repository supports and distinguish executed checks from missing ones.

## Execution Steps

1. Parse the issue reference from `$ARGUMENTS` and restate the exact scope before editing.
2. Inspect the touched paths and load only the relevant rules, skills, and workflow surfaces.
3. Implement the issue in a focused branch-sized change set.
4. Verify the behavior with the closest meaningful commands or manual checks available in the repository.
5. Draft a PR-ready summary that makes network, wallet, ABI, address, and deployment assumptions explicit.

## Required Output

- Branch name
- Scope summary
- Files changed
- Verification commands and results
- Networks, RPC assumptions, and wallet assumptions
- ABI, address, contract-surface, or generated-artifact changes
- Open risks or follow-up items
- PR URL or exact reason no PR was created
