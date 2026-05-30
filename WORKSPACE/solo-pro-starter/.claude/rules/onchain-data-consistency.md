---
name: onchain-data-consistency
description: Rules for reads, event-derived state, cache boundaries, and chain-context consistency.
paths:
  - "src/**"
  - "app/**"
  - "components/**"
  - "hooks/**"
  - "lib/**"
  - "services/**"
  - "wagmi/**"
  - "abi/**"
  - "**/*balance*"
  - "**/*event*"
  - "**/*index*"
  - "**/*cache*"
---

# Onchain Data Consistency Rules

- Keep balances, positions, allowances, and status reads tied to an explicit chain and address context.
- Do not mix cached data, event-derived state, and live RPC reads without making the freshness boundary clear.
- If the UI derives state from logs or indexing layers, document which source is authoritative when they disagree.
- Keep event decoding and ABI assumptions synchronized with the contract surface that produced them.
- When a change affects both read models and write paths, verify that post-transaction refresh logic updates the same entities the UI renders.
- Defer network identity and address source-of-truth concerns to `chain-config` when those files are in scope.
