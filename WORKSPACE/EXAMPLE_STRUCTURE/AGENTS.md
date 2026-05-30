# Repository Guidelines

## Project Structure & Module Organization
This repository is a scaffold for a Claude Code operating environment, not a single runnable application. The top level is split into three layers:

- `enterprise-system/` for administrator-managed policies and shared settings.
- `user-home/.claude/` for user-wide agents, commands, hooks, rules, skills, and workflows.
- `project-root/your-project/` for repository-local Claude configuration such as `CLAUDE.md`, `.claude/agents/`, `.claude/rules/`, and `.claude/workflows/`.

Use [FILE-TREE.txt](/F:/claude-wizardry/WORKSPACE/EXAMPLE_STRUCTURE/FILE-TREE.txt) as the quick index when locating example files.

## Build, Test, and Development Commands
There is no global build or test pipeline in this scaffold. The main workflow is inspection, copying, and auditing:

- `Get-Content README.md` reviews the scaffold purpose and layering.
- `Get-Content FILE-TREE.txt` shows the full example layout.
- `Get-Content INSTALL-NOTES.md` lists the supported copy/install patterns.
- Copy project assets into a real repo root: `Copy-Item project-root\your-project\* <target> -Recurse`

Audit any shell hooks before enabling them. `CLAUDE.local.md` and `.claude/settings.local.json` are intended to stay local.

## Coding Style & Naming Conventions
Keep Markdown instructional and terse. Use clear headings, short bullet lists, and concrete paths such as `.claude/skills/` or `project-root/your-project/`.

Follow the existing naming patterns:

- Hyphenated Markdown filenames for policies and guides, for example `global-security-baseline.md`.
- Lowercase directory names under `.claude/`.
- Script names that describe the action, such as `issue-to-pr.js` or `list_manifests.py`.

## Testing Guidelines
Validate changes by reading the affected layer in context and checking cross-references. For scripts, run the smallest targeted command available inside the destination repository after copying. For hooks, review behavior before execution; do not enable unaudited scripts.

## Commit & Pull Request Guidelines
This export does not include `.git`, so local history is unavailable here. Match the repository’s existing style when used in a real checkout: short imperative commit subjects, one focused change per commit, and PRs that explain scope, affected paths, and any setup implications.

For project-layer work, keep team-safe files versioned and keep machine-specific overrides untracked.
