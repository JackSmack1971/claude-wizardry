# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Purpose

This directory is a documentation library covering Claude Code configuration, architecture, and best practices. All content is Markdown. There are no build, lint, or test commands — the source of truth is the documents themselves.

## Content Map

| File | Subject |
|---|---|
| `BRAND_VOICE.md` | Style and tone standard — governs all documents in this repo |
| `Hierarchical mind map.md` | Canonical reference for the `.claude/` directory union schema and runtime loop |
| `Claude Code Configuration Best Practices.md` | Ranked best practices for `.claude/` workspace engineering |
| `Claude Code Subagent Best Practices.md` | Subagent design, YAML frontmatter schema, and context isolation |
| `Claude Code Hooks Best Practices Report.md` | Lifecycle hook architecture and deterministic guardrail patterns |
| `Claude Code Global Rules Guide.md` | Global `~/.claude/` rules and multi-project instruction strategy |
| `Claude Code Workflows Best Practices.md` | Dynamic workflow orchestration via `.claude/workflows/*.js` |
| `Claude Skills Management Best Practices.md` | Skill lifecycle, frontmatter fields, and invocation patterns |
| `Claude Code Output Styles Guide.md` | Output style definition and system-prompt modification |
| `Claude Code Custom Commands Guide.md` | Legacy slash command definition and argument interpolation |

## Style Standard

All new and edited content must conform to `BRAND_VOICE.md`. Key constraints:

- **Tone:** Forensic, direct, evidence-led. Never reassuring without proof.
- **Completion language:** Never write "done" without evidence. Prefer VERIFIED / INFERRED / HYPOTHESIS / UNKNOWN labels.
- **Avoided phrases:** "Probably fine", "Looks good", "Should work", "Hopefully", "Just", "Easy", "Quick fix".
- **Structure:** What happened → Evidence → Open risks → Next step.
- **Density:** High. Eliminate conversational padding.

## Architectural Context

`Hierarchical mind map.md` is the authoritative reference for the `.claude/` directory union schema. It documents every recognized path, its runtime role in the Gather → Reason/Plan → Act → Observe/Verify → Iterate loop, and how components interact. Before adding documentation about any `.claude/` sub-path, verify the claim against that file's executive summary table.

Settings priority order (highest to lowest): managed → CLI args → local project → shared project → user.

`CLAUDE.md` and `rules/*.md` are context, not hard enforcement. Hard blocking requires permissions or hooks.
