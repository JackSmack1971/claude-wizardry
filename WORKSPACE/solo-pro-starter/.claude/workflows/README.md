# Workflows

Workflows keep orchestration state in JavaScript instead of bloating model context.

Use them for repeatable multi-step repository procedures that may coordinate agents, verification, and GitHub state checks.

Workflow stack:
- `issue-to-pr.js`: one issue to one PR-sized implementation flow
- `web3-audit.js`: focused Ethereum TypeScript repository audit flow
- `review-readiness.js`: local-diff or PR review orchestration flow
- `release-readiness.js`: deploy, upgrade, signer, and release gate review flow
- `upstream-audit.js`: audit-only findings-to-issues flow for confirmed repository problems

Shared assets live under `assets/` so workflows can stay short and structured.

Contract expectations:
- each workflow should declare phase order, risk surfaces, gating checks, output sections, and handoff memory targets
- commands should point into workflows for phase ordering; skills should provide the deeper domain procedures behind workflow steps
- workflow outputs should be evidence-led and map cleanly into the shared templates under `assets/`

Execution notes:
- these workflow files are now runnable with `node` as structured contract emitters
- they do not implement the full Claude workflow SDK locally; they emit invocation-aware contract JSON that matches the project scaffold

Usage examples:
- if a workflow expects an audit or release target and you omit it, the emitted contract should report `readiness: "needs-input"`
- `node .claude/workflows/issue-to-pr.js 123`
- `node .claude/workflows/web3-audit.js src/wallet`
- `node .claude/workflows/review-readiness.js 42`
- `node .claude/workflows/release-readiness.js main`
- `node .claude/workflows/upstream-audit.js origin/main`
