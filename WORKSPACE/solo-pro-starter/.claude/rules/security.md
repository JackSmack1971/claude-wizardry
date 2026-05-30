---
name: security
description: Security-sensitive coding rules.
paths:
  - "src/auth/**"
  - "src/api/**"
  - "src/server/**"
  - "contracts/**"
  - "script/**"
  - "scripts/**"
  - "deploy/**"
  - ".github/workflows/**"
  - "**/*security*"
---

# Security Rules

- Validate all external input at trust boundaries.
- Do not log secrets, tokens, cookies, or authorization headers.
- Do not expose private keys, seed phrases, RPC secrets, or raw wallet exports in code, logs, fixtures, or screenshots.
- Enforce authorization server-side.
- Treat CI/CD workflow edits as privileged.
- Treat contract deployment scripts, signer selection, upgrade paths, and admin roles as privileged.
- Verify chain ID, contract address, and environment gating before any write-path or deployment change.
- Treat allowance handling, signature-backed approvals, treasury movement, and upgrade execution as privileged even when surfaced through ordinary UI code.
- Prefer dedicated rule files for chain config, signature and permit behavior, transaction execution, upgrade or admin paths, generated artifacts, and release workflow edits when those surfaces are active.
- Prefer explicit allowlists for commands, hosts, and file paths.
