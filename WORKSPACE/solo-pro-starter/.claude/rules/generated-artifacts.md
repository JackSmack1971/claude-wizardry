---
name: generated-artifacts
description: Rules for generated ABI, type, and client artifacts.
paths:
  - "abi/**"
  - "types/**"
  - "generated/**"
  - "**/*.abi.json"
  - "**/*generated*"
---

# Generated Artifact Rules

- Prefer regenerating artifacts from the authoritative source instead of hand-editing generated output.
- If the repository intentionally commits generated artifacts, keep the generation path deterministic and documented.
- Generated artifacts should stay synchronized with their ABI or contract source-of-truth in the same change.
- When a diff mixes manual logic edits and generated churn, separate signal from noise and verify the intended source change first.
- If a repository already hand-edits a generated surface, call that out explicitly before extending the pattern.
