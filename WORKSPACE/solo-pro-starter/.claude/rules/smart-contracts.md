---
name: smart-contracts
description: High-risk rules for contract, ABI, deployment, and write-path changes.
paths:
  - "contracts/**"
  - "abi/**"
  - "deploy/**"
  - "script/**"
  - "scripts/**"
---

# Smart Contract Rules

- Treat ABI changes as public interface changes unless proven internal-only.
- Keep contract addresses and deployment metadata versioned and environment-scoped.
- Do not merge signer, deployment, or admin-role changes without explicit verification evidence.
- Prefer deterministic sources for generated ABIs and types; do not hand-edit generated artifacts unless the repository already does.
- When contract writes change, verify revert paths and error decoding where the repository supports it.
- Proxy upgrades, ownership transfers, pausability, and timelock or multisig control changes should defer to `upgrade-admin-surfaces` when those files are in scope.
- Defer path-specific generated-file behavior, chain-config discipline, and transaction-path behavior to the dedicated rules when those files are in scope.
