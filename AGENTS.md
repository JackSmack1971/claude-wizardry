# AGENTS.md — Claude Code Framework Architect

## Mission

This repo (`claude-wizardry`) is a **Claude Code framework factory**.  
`SOUL/` is the private SSOT. `WORKSPACE/` is the build area.  
You architect, generate, and maintain Claude Code frameworks for users — not Codex-native artifacts.

> **Codex executes. Claude Code is the target. `.claude/` is the product.**

---

## Repository Layout

| Path                           | Role                                                        |
| ------------------------------ | ----------------------------------------------------------- |
| `SOUL/`                        | Private knowledge base and SSOT — never expose publicly     |
| `WORKSPACE/`                   | All generated frameworks live here in slug-style subfolders |
| `WORKSPACE/EXAMPLE_STRUCTURE/` | Canonical Claude Code scaffold reference                    |

**Naming rules:** uppercase for root docs (`CLAUDE.md`, `AGENTS.md`), kebab-case for command/rule files (`.claude/commands/review-pr.md`), slug-style folder names in `WORKSPACE/` (e.g., `web3-solo-dev-mev-bot`). ASCII only unless a file already uses Unicode.

---

## Inspection Commands (Read-Only First)

```powershell
# Inspect example scaffold tree
Get-ChildItem -Recurse WORKSPACE\EXAMPLE_STRUCTURE

# Review internal project guidance before editing related docs
Get-Content SOUL\CLAUDE.md

# Validate public scaffold description
Get-Content WORKSPACE\EXAMPLE_STRUCTURE\README.md
```

```bash
# Cross-platform discovery before any edit
find . -maxdepth 3 -type f \( -name "CLAUDE.md" -o -name "package.json" \
  -o -name "pyproject.toml" -o -name "Makefile" -o -name ".mcp.json" \)
find . -maxdepth 4 -path "*/.claude/*" -print 2>/dev/null || true
```

**Always read existing Claude Code artifacts before modifying them. Never overwrite without reading first.**

---

## Framework Tier Model

Classify the user's context, then build only what is needed:

| Tier                  | User Type                    | Core Artifacts                                     |
| --------------------- | ---------------------------- | -------------------------------------------------- |
| `home_light`          | Home coder, learner          | `CLAUDE.md`, `settings.json`, 2 commands           |
| `solo_pro`            | Serious solo dev, consultant | + rules, 3 skills, 1–2 agents                      |
| `team_standard`       | Small team, OSS, agency      | + review/release commands, output styles           |
| `startup_scale`       | Growing team, CI/CD          | + hooks, workflow scripts, security rules          |
| `enterprise_governed` | Enterprise platform group    | + managed settings, MCP allowlists, audit          |
| `regulated_secure`    | Regulated org, research lab  | + traceability, approval gates, evidence templates |

Use advisory Markdown for guidance. Use `settings.json`, hooks, and CI for **enforced** behavior.

---

## Claude Code Artifact Targets

Generated frameworks must be Claude Code-native:

```
CLAUDE.md · CLAUDE.local.md · .claude/settings.json
.claude/rules/*.md · .claude/skills/<name>/SKILL.md
.claude/agents/*.md · .claude/commands/*.md
.claude/hooks/** · .claude/output-styles/*.md
.claude/security-rules.md · .claude/workflows/*.js
```

Do **not** create `.codex/` config or Codex-native `.agents/` unless explicitly requested.

---

## Code Style & Conventions

- **Do:** Use design tokens and path-scoped rules for domain-specific standards
- **Do:** Keep `CLAUDE.md` compact — lazy-load detail via `.claude/rules/`
- **Do:** Build fully functional frameworks — no placeholders, ever
- **Do:** Isolate high-context work in subagents; encode reusable flows as skills
- **Don't:** Put everything into one giant `CLAUDE.md`
- **Don't:** Treat `WORKSPACE/` subfolders as nested repos (GitHub nesting issue)
- **Don't:** Commit `SOUL/` content or user-local settings to version control
- **Don't:** Add secrets, machine-local paths, or fake values to generated files
- **Don't:** Create subagents for tiny tasks or workflows for simple commands

---

## Security Defaults (All Tiers)

Always deny in `settings.json`:

- Reading `.env` and secrets directories
- Destructive shell patterns (`rm -rf`, force push, direct DB drops)

Always require confirmation for:

- Dependency additions · DB migrations · public API changes · deployments

For `enterprise_governed` and `regulated_secure`: use managed settings, MCP allowlists, audit logs, and hard hook gates instead of advisory text.

---

## Commit & PR Guidelines

- **Format:** `docs: tighten AGENTS guide` · `scaffold: add enterprise hook example` · `fix: correct hook path`
- **Scope:** One framework or documentation concern per PR
- **PR body:** List affected paths, manual verification performed, and screenshots if rendered docs changed
- **Pre-merge:** Confirm new scaffolds include expected `.claude/` paths, referenced files exist, and `SOUL/` content is not exposed

---

## Verification (Structural, No Test Suite)

There is no automated test runner at the repo root. Verification is structural:

1. Confirm scaffold includes expected Claude Code paths
2. Confirm all referenced files exist
3. Confirm `SOUL/` content is absent from public-facing output
4. If adding scripts, include a focused usage example in the same directory

---

## When Stuck

Do **not** guess at framework tier, user intent, or missing context.  
Instead: **propose a classification + ask one clarifying question** before generating artifacts.

Example: *"Based on the repo, I'd classify this as `solo_pro`. Does that match your context, or are you building for a team?"*

---

## Reference

- Canonical scaffold → `WORKSPACE/EXAMPLE_STRUCTURE/`  
- Full tier doctrine and artifact contracts → `SOUL/CLAUDE.md`  
- Framework design mantra: *home = simple · solo = repeatable · team = consistent · startup = guarded · enterprise = governed · regulated = traceable*
