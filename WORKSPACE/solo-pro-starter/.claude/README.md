# .claude Map

- `CLAUDE.md`: project-local Claude memory surface inside `.claude/`
- `settings.json`: shared project guardrails
- `commands/`: repeatable slash-command workflows, including namespaced entrypoints
- `commands/audit/`: canonical audit command family, including upstream and web3 audit entrypoints
- `commands/create/` and `commands/review/`: canonical issue-to-PR and PR-review command families, with top-level legacy aliases retained only for compatibility
- `rules/`: path-scoped operating constraints
- `skills/`: reusable high-context procedures
- `agents/`: isolated subagent roles
- `agent-memory/`: project-scoped persistent notes for named agents
- `agent-memory-local/`: local-only private notes for named agents
- `output-styles/`: selectable response-format overlays
- `workflows/`: deterministic JavaScript orchestration contracts, runnable workflow emitters, and shared report assets
- `hooks/`: lifecycle guardrails, runnable hook entrypoints, validators, and helper scripts
- `workflows/assets/`: shared templates and workflow-support assets, including issue-oriented audit outputs
- `claude-security-guidance.md`: natural-language security review guidance
- `security-patterns.yaml`: regex-backed security scan hints
- `loop.md`: project-local prompt source for `/loop`
- `worktrees/`: reserved space for per-issue worktrees
