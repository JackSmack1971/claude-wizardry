---
name: github-release-workflows
description: Rules for CI, release automation, and repository workflow edits.
paths:
  - ".github/workflows/**"
  - ".github/actions/**"
  - "**/*release*"
  - "**/*workflow*"
---

# GitHub And Release Workflow Rules

- Treat CI and release workflow edits as privileged changes with repository-wide blast radius.
- Keep workflow diffs minimal and explicit; avoid unrelated refactors in the same change.
- Verify the relationship between workflow changes and the commands, scripts, or artifacts they invoke.
- If a workflow can deploy, publish, upgrade, or mutate remote state, require explicit human confirmation points in the change summary.
- When secrets, environment names, or release triggers change, document the new trust boundary and rollback path.
