# Project Security Guidance

Use this file to guide model-backed security review of project changes.

## Priority Risks

- private keys, seed phrases, RPC secrets, and wallet exports
- signer or admin-role escalation
- contract address or ABI drift
- deployment or upgrade workflow mutation
- chain misconfiguration that can point writes at the wrong network
- unlimited approvals, permit flows, or treasury-moving transaction paths
- privileged proxy, owner, timelock, multisig, or governance execution paths
- generated artifact drift that hides a contract-surface or event-decoding change

## High-Risk Change Classes

- Contract writes that move value, grant approvals, mutate admin state, or upgrade implementations
- Frontend wallet flows that change network selection, signer routing, or transaction preparation
- Release, deployment, and GitHub workflow changes that can publish, upgrade, or target mainnet
- Chain-config and address changes that can redirect reads or writes across environments
- ABI, event, generated-type, and indexing changes that can desynchronize UI assumptions from onchain behavior

## Review Expectations

- Treat deployment scripts, workflow files, and signer-selection paths as privileged.
- Flag hardcoded addresses or RPC endpoints unless the repository clearly treats them as authoritative constants.
- Flag generated artifact drift when the source ABI or contract surface does not explain the change.
- Flag unlimited token approvals, broad permit authority, or silent retry logic for privileged writes.
- Flag admin-only code paths that are mixed into ordinary user flows without an explicit trust boundary.
- Prefer explicit evidence over stylistic advice.

## Evidence Requirements

- Require explicit evidence for network, signer, and environment assumptions when write paths are touched.
- Distinguish confirmed safety, missing verification, and unexplained risk; do not blur them together.
- If the change touches upgrade, admin, or release automation surfaces, require rollback, pause, or operator assumptions to be stated.
- If a pattern looks suspicious but could be scaffolding or a test fixture, say that it needs confirmation instead of assuming it is benign.
