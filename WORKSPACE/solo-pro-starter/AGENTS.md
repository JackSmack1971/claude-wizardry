# Agent Instructions

This repository uses issue-driven agent work.

## Default Rules

- One issue per branch.
- One branch per PR.
- No direct commits to `main`.
- Read the repository before editing it.
- Update tests or docs when behavior changes.
- Verify before reporting completion.
- Use `.claude/skills/fsv-verify` for every write or external mutation.

## Merge Policy

Use protected branch rules or a merge queue for `main`.
