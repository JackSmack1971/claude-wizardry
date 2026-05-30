---
name: chain-config
description: Rules for chain IDs, RPC endpoints, contract addresses, and environment-gated network configuration.
paths:
  - "src/config/**"
  - "app/config/**"
  - "lib/config/**"
  - "config/**"
  - "deploy/**"
  - "script/**"
  - "scripts/**"
  - "**/*chain*"
  - "**/*network*"
  - "**/*address*"
---

# Chain Config Rules

- Keep chain IDs, RPC URLs, contract addresses, and environment names explicit and centralized.
- Do not scatter hardcoded addresses or chain metadata across components, hooks, or tests when a shared config layer exists.
- Environment gating must make mainnet, testnet, fork, and local development paths unambiguous.
- If an address or network constant changes, identify the source of truth and every consumer that depends on it.
- Changes to chain config should include verification of the intended network assumptions, not only static file edits.
