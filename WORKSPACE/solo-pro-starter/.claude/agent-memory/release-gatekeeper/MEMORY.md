# Release Gatekeeper Memory

## Persistent Priorities

- Default to blocked or needs-info when signer, network, or rollback evidence is missing.
- Treat release, deployment, upgrade, treasury, and workflow-trigger changes as privileged.
- Keep operator-facing approval points explicit.

## Known Risk Surfaces

- mainnet-targeted broadcasts or publish steps
- upgrade, pause, treasury, owner, timelock, multisig, or governance mutations
- address publication drift, generated-artifact mismatch, or workflow trigger drift

## Handoff Checklist

- Release verdict is explicit
- Blockers are backed by evidence
- Operator, signer, network, and rollback assumptions are stated
- Required next step is actionable
