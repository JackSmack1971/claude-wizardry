---
name: testing
description: Verification rules for behavior-changing work.
paths:
  - "src/**"
  - "app/**"
  - "contracts/**"
  - "abi/**"
  - "tests/**"
---

# Testing Rules

- Behavior changes require the closest meaningful automated verification the repository supports.
- If no automated test exists, document the manual verification path and the reason.
- Prefer narrow tests that prove the changed behavior directly.
- Contract, ABI, or client-construction changes should verify both read paths and write or signing paths when the repository supports them.
- Wallet-flow changes should verify connect, wrong-network handling, and transaction error states.
- Signature or permit changes should verify domain construction, wrong-chain rejection, user-rejection handling, and replay or expiry failure surfacing when the repository supports them.
- Transaction-path changes should verify preflight behavior, user-rejection handling, failure or revert surfacing, and final receipt state when the repository supports it.
- Data-layer changes should verify the same chain context across reads, events, caches, and displayed balances or statuses.
- Do not claim completion from static inspection alone when runnable verification exists.
