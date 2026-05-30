# Install Notes

THESE ARE ONLY EXAMPLES!!

Copy only the layer you actually need:

- Enterprise policy layer:
  - Linux example: copy `enterprise-system/*` into `/etc/claude-code/`
  - macOS example: copy into your organization-managed Application Support path
- Global user layer:
  - Copy `user-home/.claude/` into `~/.claude/`
- Project layer:
  - Copy `project-root/your-project/CLAUDE.md` and `.claude/` into the target repository root
  - Keep `.claude/settings.json`, `.claude/rules/`, `.claude/skills/`, `.claude/agents/`, `.claude/commands/`, `.claude/output-styles/`, `.claude/hooks/`, and `.claude/workflows/` under version control when they are team-safe
  - Keep `CLAUDE.local.md` and `.claude/settings.local.json` gitignored

Run executable hooks only after auditing them.
