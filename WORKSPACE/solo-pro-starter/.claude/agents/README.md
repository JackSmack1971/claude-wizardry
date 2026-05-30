# Agents

Agents handle bounded high-context work that benefits from isolation.

Agent stack:
- `implementation-agent`: one issue, real code changes, bounded verification, PR-sized diff
- `web3-auditor`: focused read-only audit of wallet, chain, contract, artifact, and deployment-risk surfaces
- `pr-reviewer`: findings-first merge-readiness review for local diffs or PRs
- `release-gatekeeper`: read-only release, deployment, upgrade, and signer-risk review
- `upstream-auditor`: audit-only issue generator for confirmed repository findings

Contract expectations:
- each agent should declare a narrow delegation trigger, explicit risk surfaces, and a clear output contract
- project memory should stay aligned with the named files under `.claude/agent-memory/`
- if an agent supports a workflow, say which workflow or command should delegate to it
