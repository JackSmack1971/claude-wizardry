# Hooks

Hooks provide lifecycle guardrails that sit closer to enforcement than advisory markdown.

Keep hooks deterministic, narrow, and cheap to run.

Structure:
- top-level hook files orchestrate lifecycle events
- `validators/` contains focused checks for commands and file payloads
- `helpers/` contains shared emitters and risk catalogs
- `workflow/` contains reusable post-mutation or verification helpers

Push high-risk command and file checks into `validators/`, and reserve top-level hook files for orchestration.

The risk catalog should stay aligned with:
- `.claude/security-patterns.yaml` for regex-backed plugin scanning
- `.claude/claude-security-guidance.md` for model-backed security review priorities

If those three surfaces drift, tighten them together in the same change.

Execution notes:
- top-level hooks are now runnable Node entrypoints that emit structured JSON
- validators and workflow helpers should export callable functions and still support direct CLI execution for local verification
