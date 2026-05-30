# Skills

Use skills to isolate repeatable procedures that would otherwise bloat `CLAUDE.md`.

Skill stack:
- `stack-detection`: classify the repo before architectural or client-layer changes
- `auditing-wallet-flows`: inspect connect, network, signing, and transaction UX paths
- `auditing-contract-surfaces`: inspect ABI, address, write-path, and generated-artifact drift
- `verifying-deployment-safety`: inspect deployment, upgrade, signer, and release-risk paths
- `dependency-audit`: inspect package and lockfile risk, especially duplicate web3 stacks
- `repo-audit`: broad audit that can compose the focused skills above
- `fsv-verify`: verify every mutation and external side effect

Suggested composition:
1. `stack-detection`
2. one or more focused web3 audit skills
3. `dependency-audit` if package or toolchain drift matters
4. `repo-audit` for broader synthesis
5. `fsv-verify` around any actual mutation

Metadata note:
- keep trigger intent inside `description`; use invocation-control frontmatter only where the current Claude Code skills docs explicitly support it
