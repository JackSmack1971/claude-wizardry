---
description: Check release readiness for a TypeScript Ethereum dapp before merge, publish, or deploy.
argument-hint: "[branch-or-pr]"
allowed-tools:
  - Read
  - Bash(git status)
  - Bash(git diff)
  - Bash(git log --oneline -20)
  - Bash(node .claude/workflows/release-readiness.js:*)
---

# /release:readiness

Check whether `$ARGUMENTS` is ready for release, publish, or deployment.

## Context

- Treat `$ARGUMENTS` as the release target: a branch, PR, or current working tree.
- Use `@.claude/workflows/release-readiness.js` as the phase-order contract.
- Apply `@.claude/rules/chain-config.md`, `@.claude/rules/generated-artifacts.md`, `@.claude/rules/upgrade-admin-surfaces.md`, and `@.claude/rules/github-release-workflows.md` when those surfaces are touched.

## Requirements

- Treat missing verification, chain ambiguity, signer ambiguity, workflow trigger drift, and generated-artifact drift as release blockers until disproven.
- Keep the report focused on release safety, not general code style.
- Make rollback, pause, and operator assumptions explicit when privileged write paths or upgrades are involved.

## Execution Steps

1. Resolve the release target from `$ARGUMENTS`.
2. Inspect the current diff or PR scope and isolate release-relevant files.
3. Check chain config, addresses, generated artifacts, admin or upgrade paths, and CI or release workflow mutations.
4. Return a release readiness decision with explicit blockers and evidence.

## Required Output

- Release target
- Verdict: ready / blocked / needs info
- Release blockers
- Verification evidence
- Operator, signer, network, and rollback assumptions
- Required next step
