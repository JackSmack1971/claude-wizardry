---
description: Review one pull request for merge readiness with chain, wallet, ABI, and deployment risk checks.
argument-hint: "[pr-url-or-number]"
allowed-tools:
  - Read
  - Bash(git diff)
  - Bash(git log --oneline -20)
---

# /review:pr

Review one PR for merge readiness in a TypeScript Ethereum dapp.

## Context

- Primary input: `$ARGUMENTS`
- Treat `$1` as the PR URL or PR number when it is provided as a single token.
- Use the existing project workflow contract in `@.claude/workflows/review-readiness.js`.
- Apply the active rule stack with emphasis on `@.claude/rules/security.md`, `@.claude/rules/transaction-execution.md`, `@.claude/rules/onchain-data-consistency.md`, `@.claude/rules/upgrade-admin-surfaces.md`, and `@.claude/rules/github-release-workflows.md` when those surfaces are touched.

## Requirements

- Findings come first. Lead with the highest-severity merge blockers, not a summary.
- Distinguish blocking defects, verification gaps, and informational notes.
- Treat wallet flows, contract writes, chain-config drift, generated artifacts, admin paths, and release automation as privileged review surfaces.
- If evidence is missing, say that explicitly instead of inferring safety.

## Execution Steps

1. Parse the PR reference from `$ARGUMENTS`.
2. Inspect the diff and recent commit intent before judging implementation quality.
3. Check for correctness, security, chain, wallet, ABI, generated-artifact, admin-surface, and release-workflow risk.
4. Identify missing verification or unclear assumptions separately from concrete defects.
5. Return a merge-readiness report with a crisp verdict and file-scoped findings.

## Required Output

- Verdict: approve / request changes / needs info
- Blocking findings with file references when possible
- Non-blocking suggestions
- Verification gaps
- Chain, wallet, ABI, generated-artifact, and deployment safety notes
- Merge safety summary
