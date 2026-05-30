# Project Local Claude Memory

Use this file as the in-directory memory surface for repository-local Claude behavior.

## Runtime Priorities

- Read repository manifests before proposing commands.
- Detect whether the repo is `viem`-first, `ethers` v6-first, or mixed before changing client architecture.
- Keep contract addresses, chain IDs, ABIs, and wallet flows centralized.
- Treat deployments, signer changes, admin-role edits, and ABI drift as high-risk.

## Verification Baseline

- Prefer repository-defined lint, typecheck, contract test, and e2e commands.
- Use `.claude/skills/fsv-verify` for every write or external mutation.
- If runnable verification does not exist, record the structural or manual path explicitly.
