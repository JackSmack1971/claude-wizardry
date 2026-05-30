---
name: architecture
description: Architecture and change-boundary rules for dapp application code.
paths:
  - "src/**"
  - "app/**"
  - "services/**"
  - "lib/**"
  - "contracts/**"
  - "abi/**"
  - "wagmi/**"
---

# Architecture Rules

- Keep modules cohesive and boundaries explicit.
- Prefer extending existing seams over adding parallel abstractions.
- Minimize cross-layer leakage between UI, domain, and infrastructure code.
- Keep chain metadata, addresses, ABIs, and client construction centralized instead of scattering them across UI components.
- Do not build duplicate wrappers around the same `viem` or `ethers` client surface without a clear repo-specific reason.
- Keep read models, transaction flows, and privileged admin paths isolated enough that they can be audited independently.
- Push deeper constraints for generated files, chain config, transaction execution, data consistency, upgrade or admin paths, and release workflow edits into their dedicated rules instead of duplicating them here.
- If a change increases coupling, explain why the tradeoff is necessary.
- Remove dead paths introduced by refactors in the same change.
