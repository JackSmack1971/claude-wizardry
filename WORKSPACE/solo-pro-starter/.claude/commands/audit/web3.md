---
description: Run a focused web3 audit for wallet flows, contract surfaces, chain config, and generated artifacts.
argument-hint: "[target-path-or-pr]"
allowed-tools:
  - Read
  - Bash(git status)
  - Bash(git diff)
  - Bash(node .claude/workflows/web3-audit.js:*)
---

# /audit:web3

Run a focused audit against `$ARGUMENTS` for a TypeScript Ethereum dapp.

## Context

- Treat `$ARGUMENTS` as the primary audit target: a path, issue, PR, or local change scope.
- Use `@.claude/workflows/web3-audit.js` as the phase-order contract.
- Delegate focused read-only audit work to `@.claude/agents/web3-auditor.md` when the target is bounded enough for an isolated audit thread.
- Compose the audit with `@.claude/skills/repo-audit/SKILL.md`, `@.claude/skills/auditing-wallet-flows/SKILL.md`, `@.claude/skills/auditing-contract-surfaces/SKILL.md`, and `@.claude/skills/verifying-deployment-safety/SKILL.md` when those surfaces are in scope.

## Requirements

- Prioritize correctness and security over style commentary.
- Separate wallet-flow risk, contract-surface risk, chain-config drift, generated-artifact drift, and deployment-safety risk.
- If the audit target does not include one of those surfaces, say so explicitly instead of padding the report.

## Execution Steps

1. Resolve the audit target from `$ARGUMENTS`.
2. Identify which of the focused web3 surfaces are actually touched.
3. Audit only the in-scope surfaces, using the relevant rules and skills.
4. Return a structured risk report with explicit evidence and missing-verification callouts.

## Required Output

- Audit target
- In-scope surfaces
- Findings by severity
- Verification gaps
- Release or deployment blockers
- Recommended next action
