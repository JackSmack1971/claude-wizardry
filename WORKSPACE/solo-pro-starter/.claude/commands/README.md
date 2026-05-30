# Commands

Commands stay user-invoked, concise, and output-driven. Keep complex reusable logic in skills and workflows; use commands as stable entrypoints into that deeper stack.

Command stack:
- `create:pr`: implement one issue as a bounded branch-to-PR flow
- `review:pr`: review one PR for merge readiness
- `audit:web3`: run a focused wallet, contract, chain, and generated-artifact audit
- `audit:upstream`: audit the repository and create one issue per confirmed finding
- `release:readiness`: check release and deployment readiness before merge or deploy

Composition order:
- use commands when the developer wants an explicit slash entrypoint with a fixed report shape
- use skills for reusable domain procedures and deeper references
- use workflows for orchestration, phase ordering, and subagent fan-out behind the command surface

Compatibility notes:
- canonical entrypoints live under namespaced paths such as `create/pr.md`, `review/pr.md`, `audit/*.md`, and `release/*.md`
- keep legacy aliases only when they forward to a clearer namespaced command surface
- current compatibility aliases are `/create-pr`, `/review-pr`, and `/audit-upstream`
