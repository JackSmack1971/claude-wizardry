# Rules

Rules stay small and path-scoped. Add new rules only when a repository has a recurring high-risk area.

Rule stack:
- `architecture`: shared boundaries and layering rules
- `testing`: verification expectations for behavior-changing work
- `security`: high-level security constraints
- `frontend-wallets`: wallet UX and injected-provider behavior
- `signatures-and-permits`: EIP-191, EIP-712, SIWE, permit, and delegated approval behavior
- `smart-contracts`: ABI, deployment, and write-path risk
- `chain-config`: chain IDs, RPC endpoints, addresses, and environment gating
- `transaction-execution`: simulation, allowance, slippage, and receipt handling
- `onchain-data-consistency`: reads, events, cache boundaries, and chain-context coherence
- `upgrade-admin-surfaces`: proxies, admin roles, timelocks, and privileged mutation paths
- `generated-artifacts`: generated ABI, type, and codegen surfaces
- `github-release-workflows`: CI, release, and automation workflow edits

Composition order:
- start with `architecture`, `testing`, and `security`
- load `frontend-wallets`, `signatures-and-permits`, and `transaction-execution` for wallet, signing, permit, or transaction work
- load `smart-contracts`, `chain-config`, and `upgrade-admin-surfaces` for contract or deployment changes
- load `onchain-data-consistency` when reads, indexing, caching, or event-driven UI behavior are in scope
- load `generated-artifacts` and `github-release-workflows` only when those surfaces are actually touched

Prefer narrow rules over bloated general rules when a path or risk surface is clearly distinct.

Implementation note:
- use `paths:` frontmatter for conditional rule loading; rules without `paths` load at session start
