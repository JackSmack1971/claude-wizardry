---
name: upgrade-admin-surfaces
description: Rules for proxies, privileged contract control, governance executors, and admin mutation paths.
paths:
  - "contracts/**"
  - "deploy/**"
  - "script/**"
  - "scripts/**"
  - "src/admin/**"
  - "app/admin/**"
  - "**/*upgrade*"
  - "**/*proxy*"
  - "**/*owner*"
  - "**/*admin*"
  - "**/*governance*"
  - "**/*timelock*"
---

# Upgrade And Admin Surface Rules

- Treat ownership transfer, proxy upgrade, pausability, treasury control, and parameter mutation as privileged changes.
- Keep the authorized executor explicit: EOA, multisig, timelock, governance module, or deployer script.
- Do not merge upgrade-path changes without identifying the target contracts, expected state continuity, and rollback or pause posture.
- If the repository uses upgradeable contracts, verify storage-layout and initializer assumptions through the repository's existing tooling or review process.
- Keep admin-only UI actions, scripts, and environment configuration separated from normal user flows.
- Defer general deployment metadata and network-address discipline to `chain-config`; defer broad contract interface concerns to `smart-contracts`.
