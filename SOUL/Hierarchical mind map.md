Verified baseline and boundary
------------------------------

Anthropic’s official May 2026 materials describe Claude Opus 4.8 as released on May 28, 2026, with dynamic workflows for “hundreds of parallel subagents” and new effort settings where Opus 4.8 defaults to high effort and supports `xhigh`/`max` modes. ([Anthropic](https://www.anthropic.com/news/claude-opus-4-8 "Introducing Claude Opus 4.8 \ Anthropic")) The official Claude Code `.claude` directory reference does **not** define one mandatory, fully populated “canonical tree.” It defines a **union schema**: many entries are optional, user-authored, plugin-provided, generated at runtime, or stored in `~/.claude/` rather than project-local `./.claude/`. ([Claude Code](https://code.claude.com/docs/en/claude-directory "Explore the .claude directory - Claude Code Docs"))

Important scope boundary: this deliverable is limited to project-local `./.claude/`. Adjacent files such as `./CLAUDE.md`, `./CLAUDE.local.md`, `./.mcp.json`, and `./.worktreeinclude` are referenced only as external interaction points because the official docs list them outside `./.claude/`. ([Claude Code](https://code.claude.com/docs/en/claude-directory "Explore the .claude directory - Claude Code Docs"))

* * *

1. Hierarchical mind map: `./.claude/`
   ======================================
* `.claude/`
  
  * `CLAUDE.md`
    
    * Project-local instruction surface inside `.claude`.
    
    * Equivalent role to root `./CLAUDE.md` when used.
    
    * Loaded at session start as project memory.
    
    * Participates in the Gather phase by injecting project conventions, commands, architecture notes, and operating constraints.
  
  * `settings.json`
    
    * Shared project configuration.
    
    * Usually committed to version control.
    
    * Controls permissions, hooks, plugin enablement, environment variables, model/tool behavior, security defaults, and team-wide agent policy.
    
    * Higher priority than user settings but lower than local project and managed settings.
  
  * `settings.local.json`
    
    * Developer-local project override.
    
    * Not committed.
    
    * Stores personal project preferences such as output style, local permission overrides, or local tool settings.
  
  * `rules/`
    
    * `*.md`
      
      * Modular Markdown instructions.
      
      * Recursively discovered.
      
      * Can be unconditional or path-scoped through YAML frontmatter.
      
      * Loaded when matching files are opened/read, making them just-in-time context for the agent loop.
      
      * Example:
        
        * `rules/api-style.md`
        
        * `rules/test-standards.md`
        
        * `rules/frontend/react-components.md`
  
  * `skills/`
    
    * `<skill-name>/`
      
      * `SKILL.md`
        
        * Skill entrypoint.
        
        * Contains YAML frontmatter and procedural instructions.
        
        * Can be manually invoked as `/skill-name`.
        
        * Can be auto-selected by semantic match unless `disable-model-invocation: true`.
      
      * `references/`
        
        * Optional long-form docs loaded on demand.
      
      * `examples/`
        
        * Optional exemplars for output style and expected structure.
      
      * `scripts/`
        
        * Optional helper scripts run by the skill.
      
      * `assets/`
        
        * Optional templates, static files, schemas, CSS, media, or support assets.
      
      * `template.md`
        
        * Optional output/report template.
    
    * `<skills-dir-plugin>/`
      
      * `.claude-plugin/`
        
        * `plugin.json`
          
          * Plugin manifest when a plugin is installed through the skills directory mechanism.
      
      * `skills/`
        
        * Plugin-provided skills.
      
      * `commands/`
        
        * Plugin-provided commands.
      
      * `agents/`
        
        * Plugin-provided agents.
      
      * `hooks/`
        
        * `hooks.json`
          
          * Plugin hook registration.
        
        * `*.sh`, `*.js`, `*.py`
          
          * Plugin hook executables.
      
      * `.mcp.json`
        
        * Plugin MCP server definitions.
      
      * `.lsp.json`
        
        * Plugin LSP server definitions.
      
      * `output-styles/`
        
        * Plugin output styles.
      
      * `themes/`
        
        * Plugin themes.
      
      * `monitors/`
        
        * Plugin monitors.
  
  * `commands/`
    
    * `*.md`
      
      * Legacy custom slash command files.
      
      * Still supported, but official docs now recommend skills for new custom workflows.
    
    * `<namespace>/`
      
      * `*.md`
        
        * Namespaced slash commands.
        
        * Example: `commands/frontend/component.md` maps to a namespaced slash command.
  
  * `agents/`
    
    * `*.md`
      
      * Custom subagent definitions.
      
      * Markdown files with YAML frontmatter.
      
      * Define specialized prompts, model tier, effort, tool limits, MCP servers, hooks, background execution, worktree isolation, and memory scope.
      
      * Spawned by the parent agent, a command, a skill, or a workflow.
  
  * `agent-memory/`
    
    * `<agent-name>/`
      
      * `MEMORY.md`
        
        * Project-scoped persistent subagent memory.
        
        * First 200 lines or 25 KB are injected into that subagent’s startup prompt.
      
      * `*.md`
        
        * Optional topic memory files read on demand.
  
  * `agent-memory-local/`
    
    * `<agent-name>/`
      
      * `MEMORY.md`
        
        * Local-only subagent memory.
        
        * Not intended for source control.
      
      * `*.md`
        
        * Optional private topic notes.
  
  * `workflows/`
    
    * `*.js`
      
      * Dynamic workflow scripts.
      
      * JavaScript orchestration programs.
      
      * Spawn subagents through workflow primitives such as `agent()`, `parallel()`, `pipeline()`, and nested `workflow()`.
      
      * Keep deterministic control flow outside the model while sending localized tasks to subagents.
  
  * `output-styles/`
    
    * `*.md`
      
      * Custom output style definitions.
      
      * Modify the Claude Code system prompt role, tone, and formatting.
      
      * Project styles can be selected and saved in `settings.local.json`.
  
  * `hooks/`
    
    * `*.sh`, `*.js`, `*.py`, `*.ts`
      
      * Project hook executables.
      
      * Not automatically active unless referenced by `settings.json`, an agent, or a plugin.
    
    * `validators/`
      
      * Example convention for blocking or validating operations.
      
      * `check-file-payloads.js`
      
      * `analyze-commands.js`
    
    * `workflow/`
      
      * Example convention for formatting, tests, or cleanup.
      
      * `run-prettier-format.sh`
      
      * `run-test-verify.js`
    
    * `helpers/`
      
      * Example convention for shared wrappers.
      
      * `pre-tool-wrapper.js`
      
      * `post-tool-wrapper.js`
  
  * `claude-security-guidance.md`
    
    * Project-level natural-language guidance for the Security Guidance Plugin.
    
    * Used by model-backed security reviews.
  
  * `claude-security-guidance.local.md`
    
    * Developer-local security guidance override.
  
  * `security-patterns.yaml`
    
    * Custom regex-backed security patterns for local scanner.
  
  * `security-patterns.yml`
    
    * YAML alternative to `security-patterns.yaml`.
  
  * `security-patterns.json`
    
    * JSON alternative to `security-patterns.yaml`.
  
  * `worktrees/`
    
    * `<worktree-name>/`
      
      * Runtime-created Git worktree directory when Claude Code or subagents use worktree isolation.
      
      * Should normally be ignored by Git.
  
  * `loop.md`
    
    * Optional prompt source for `/loop`.
    
    * Used by Claude Code’s autonomous loop command when a prompt file is supplied through `.claude/loop.md`.

* * *

2. Runtime behavior in the Gather → Reason/Plan → Act → Observe/Verify → Iterate loop
   =====================================================================================

Claude Code’s official memory docs state that `CLAUDE.md` and auto memory are loaded at the start of each conversation and treated as **context**, not hard enforcement; hard blocking must be done with permissions or hooks. ([Claude Code](https://code.claude.com/docs/en/memory "How Claude remembers your project - Claude Code Docs")) The rules system recursively discovers `.claude/rules/*.md`, loads unconditional rules at launch, and loads path-scoped rules when matching files are opened. ([Claude Code](https://code.claude.com/docs/en/memory "How Claude remembers your project - Claude Code Docs")) Settings priority is managed → CLI args → local project → shared project → user, while project settings live in `.claude/settings.json` and local overrides in `.claude/settings.local.json`. ([Claude Code](https://code.claude.com/docs/en/settings "Claude Code settings - Claude Code Docs"))

| Loop phase       | Primary `.claude/` participants                                                                                            | Runtime behavior                                                                                                                                                                    |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Gather           | `CLAUDE.md`, `rules/*.md`, `settings*.json`, skill descriptions, agent definitions, output style, MCP/plugin registrations | Builds model context, loads policy, discovers tools, checks memory/rules, registers available slash commands and skills.                                                            |
| Reason / Plan    | `CLAUDE.md`, selected `SKILL.md`, selected `agents/*.md`, `workflows/*.js`, `output-styles/*.md`                           | Model reasons with project instructions; workflows keep plan state in JS; output style shapes response format; subagents receive isolated prompts.                                  |
| Act              | `settings.json`, `hooks/**`, `skills/**/scripts/**`, `commands/*.md`, `agents/*.md`, `workflows/*.js`, MCP tools           | Tool calls, edits, shell commands, MCP calls, and subagent spawns execute under configured permissions and hooks.                                                                   |
| Observe / Verify | `hooks/**`, Security Guidance files, workflow verification subagents, agent memory                                         | Post-tool hooks, Stop hooks, security reviews, tests, workflow reducers, and checker agents inspect outcomes.                                                                       |
| Iterate          | `agent-memory/**`, `agent-memory-local/**`, global auto memory outside project, workflow journals outside project runtime  | Subagents persist lessons; main session may write auto memory in global project memory; workflows resume from runtime journal rather than stuffing raw outputs into parent context. |

Skills load progressively: descriptions are cheap startup context, the full `SKILL.md` body loads only when invoked, and support files are read on demand. ([Claude Code](https://code.claude.com/docs/en/skills "Extend Claude with skills - Claude Code Docs")) Subagents run in separate contexts and return summaries to the parent; custom agents are discovered from `.claude/agents/` and can define tools, hooks, MCP servers, memory, background behavior, and effort. ([Claude Code](https://code.claude.com/docs/en/sub-agents "Create custom subagents - Claude Code Docs")) Dynamic workflows in `.claude/workflows/*.js` orchestrate many subagents while keeping the parent context mostly clean, because final results rather than all raw intermediate logs are returned. ([Claude Code](https://code.claude.com/docs/en/workflows "Orchestrate subagents at scale with dynamic workflows - Claude Code Docs"))

* * *

3. Machine-readable JSON tree
   =============================
   
    {
      "schema_version": "claude-code-project-claude-tree-union-2026-05",
      "scope": "./.claude/",
      "notes": [
   
        "This is the official-documentation union tree, not a guarantee that every project contains every item.",
        "Adjacent root files such as ./CLAUDE.md, ./CLAUDE.local.md, ./.mcp.json, and ./.worktreeinclude are interaction points but are outside this tree."
   
      ],
      "tree": [
   
        {
          "path": ".claude/",
          "type": "directory",
          "purpose": "Project-local Claude Code configuration, workflow, rules, skills, agents, hooks, and runtime-isolation namespace.",
          "key_functions": [
            "Holds project-scoped agent behavior files",
            "Provides shared team configuration",
            "Contains optional automation surfaces"
          ],
          "interacts_with": [
            "Claude Code CLI",
            "Claude Agent SDK",
            "Opus 4.8 or selected model",
            "./CLAUDE.md",
            "./.mcp.json",
            "~/.claude/"
          ],
          "format_example": ".claude/<component>/...",
          "runtime_role_in_loop": "Project configuration namespace consulted during Gather and reused across Act, Verify, and Iterate phases.",
          "children": [
            {
              "path": ".claude/CLAUDE.md",
              "type": "markdown_file",
              "purpose": "Project memory and persistent instruction surface stored inside the project Claude directory.",
              "key_functions": [
                "Defines project conventions",
                "Documents build and test commands",
                "Adds architecture and workflow guidance",
                "May import additional files with @path references"
              ],
              "interacts_with": [
                ".claude/rules/*.md",
                ".claude/skills/*/SKILL.md",
                ".claude/agents/*.md",
                "model context"
              ],
              "format_example": "# Project Guide\n\n## Commands\n- Build: npm run build\n- Test: npm test\n\n## Constraints\n- Use TypeScript strict mode.",
              "runtime_role_in_loop": "Gather: loaded at session start as project context; Reason: shapes planning; Verify: reminds model of project checks."
            },
            {
              "path": ".claude/settings.json",
              "type": "json_file",
              "purpose": "Shared project settings for permissions, hooks, plugins, environment variables, and team policy.",
              "key_functions": [
                "Defines allow/deny/ask permission rules",
                "Registers hooks",
                "Enables project plugins",
                "Sets shared project defaults"
              ],
              "interacts_with": [
                ".claude/settings.local.json",
                ".claude/hooks/**",
                ".claude/skills/**",
                ".claude/agents/**",
                ".claude/workflows/**",
                "managed settings"
              ],
              "format_example": {
                "$schema": "https://json.schemastore.org/claude-code-settings.json",
                "permissions": {
                  "allow": [],
                  "deny": [],
                  "defaultMode": "default"
                },
                "hooks": {},
                "enabledPlugins": {}
              },
              "runtime_role_in_loop": "Gather: loads configuration; Act: gates tool execution; Observe/Verify: triggers hooks and plugin checks."
            },
            {
              "path": ".claude/settings.local.json",
              "type": "json_file",
              "purpose": "Developer-local project settings override, normally gitignored.",
              "key_functions": [
                "Stores local project preferences",
                "Overrides shared project settings where allowed",
                "Can save selected output style or local tool preferences"
              ],
              "interacts_with": [
                ".claude/settings.json",
                ".claude/output-styles/*.md",
                "user settings",
                "managed settings"
              ],
              "format_example": {
                "outputStyle": "Explanatory",
                "permissions": {
                  "allow": []
                }
              },
              "runtime_role_in_loop": "Gather: applies local override after shared project settings but before managed constraints."
            },
            {
              "path": ".claude/rules/",
              "type": "directory",
              "purpose": "Modular project instruction rules loaded unconditionally or by path match.",
              "key_functions": [
                "Splits large CLAUDE.md content into focused files",
                "Allows lazy loading by file path",
                "Supports recursive organization"
              ],
              "interacts_with": [
                ".claude/CLAUDE.md",
                ".claude/agents/*.md",
                ".claude/skills/*/SKILL.md",
                "file read/open events"
              ],
              "format_example": ".claude/rules/api-style.md",
              "runtime_role_in_loop": "Gather: unconditional rules load at launch; Observe/Gather: path rules load when matching files are opened.",
              "children": [
                {
                  "path": ".claude/rules/*.md",
                  "type": "markdown_file",
                  "purpose": "Rule document containing focused project guidance.",
                  "key_functions": [
                    "Defines domain-specific coding standards",
                    "Can include YAML frontmatter with paths",
                    "Can be organized recursively"
                  ],
                  "interacts_with": [
                    "file path matcher",
                    "model context",
                    ".claude/CLAUDE.md"
                  ],
                  "format_example": "---\npaths:\n  - \"src/api/**/*.ts\"\n---\n# API Rules\nUse validated request schemas for every route.",
                  "runtime_role_in_loop": "Gather/Reason: loads relevant instructions just before or during work on matching files."
                }
              ]
            },
            {
              "path": ".claude/skills/",
              "type": "directory",
              "purpose": "Project-scoped skills and skills-directory plugins.",
              "key_functions": [
                "Provides reusable workflows",
                "Provides domain procedures and assets",
                "Supports manual slash invocation",
                "Supports model auto-selection by description"
              ],
              "interacts_with": [
                ".claude/settings.json",
                ".claude/agents/*.md",
                ".claude/workflows/*.js",
                ".claude/commands/*.md",
                "plugin loader"
              ],
              "format_example": ".claude/skills/audit-dependencies/SKILL.md",
              "runtime_role_in_loop": "Gather: skill descriptions become available; Reason/Act: full skill loads only when selected.",
              "children": [
                {
                  "path": ".claude/skills/<skill-name>/SKILL.md",
                  "type": "markdown_file",
                  "purpose": "Skill entrypoint with YAML frontmatter and procedural instructions.",
                  "key_functions": [
                    "Defines skill name and description",
                    "Controls manual and automatic invocation",
                    "Can set model, effort, tool permissions, context forking, hooks, shell, and paths",
                    "Can reference skill-local files through CLAUDE_SKILL_DIR"
                  ],
                  "interacts_with": [
                    ".claude/skills/<skill-name>/references/**",
                    ".claude/skills/<skill-name>/scripts/**",
                    ".claude/agents/*.md",
                    ".claude/settings.json",
                    "slash command runtime"
                  ],
                  "format_example": "---\nname: audit-dependencies\ndescription: Reviews dependency manifests and drafts an update report.\ndisable-model-invocation: true\nuser-invocable: true\nallowed-tools: [Read, Bash]\n---\n# Audit Dependencies\nRun the audit script and summarize findings.",
                  "runtime_role_in_loop": "Reason/Plan: supplies procedure; Act: may run tools/scripts; Observe/Verify: structures results."
                },
                {
                  "path": ".claude/skills/<skill-name>/references/",
                  "type": "directory",
                  "purpose": "Large supporting reference material for a skill.",
                  "key_functions": [
                    "Keeps SKILL.md concise",
                    "Loads detailed docs only when needed"
                  ],
                  "interacts_with": [
                    ".claude/skills/<skill-name>/SKILL.md",
                    "Read tool"
                  ],
                  "format_example": ".claude/skills/audit-dependencies/references/policy.md",
                  "runtime_role_in_loop": "Gather-on-demand: loaded by the skill when extra context is required."
                },
                {
                  "path": ".claude/skills/<skill-name>/examples/",
                  "type": "directory",
                  "purpose": "Examples of expected inputs, outputs, or transformations for a skill.",
                  "key_functions": [
                    "Provides exemplars",
                    "Improves output consistency"
                  ],
                  "interacts_with": [
                    ".claude/skills/<skill-name>/SKILL.md"
                  ],
                  "format_example": ".claude/skills/audit-dependencies/examples/report.md",
                  "runtime_role_in_loop": "Reason: informs formatting and expected quality when read."
                },
                {
                  "path": ".claude/skills/<skill-name>/scripts/",
                  "type": "directory",
                  "purpose": "Skill-local helper scripts.",
                  "key_functions": [
                    "Runs deterministic checks",
                    "Transforms files",
                    "Validates outputs"
                  ],
                  "interacts_with": [
                    ".claude/skills/<skill-name>/SKILL.md",
                    ".claude/settings.json permissions",
                    "Bash or shell tool"
                  ],
                  "format_example": ".claude/skills/audit-dependencies/scripts/run-audit.sh",
                  "runtime_role_in_loop": "Act/Verify: executes tool-supported helper logic if permitted."
                },
                {
                  "path": ".claude/skills/<skill-name>/assets/",
                  "type": "directory",
                  "purpose": "Static skill assets such as templates, schemas, CSS, or media resources.",
                  "key_functions": [
                    "Provides non-instruction support files",
                    "Supports generated artifacts or reports"
                  ],
                  "interacts_with": [
                    ".claude/skills/<skill-name>/SKILL.md",
                    "Read or file tools"
                  ],
                  "format_example": ".claude/skills/reporting/assets/report-template.md",
                  "runtime_role_in_loop": "Act: used when generating outputs or applying templates."
                },
                {
                  "path": ".claude/skills/<plugin-name>/.claude-plugin/plugin.json",
                  "type": "json_file",
                  "purpose": "Plugin manifest for a skills-directory plugin.",
                  "key_functions": [
                    "Declares plugin name and version",
                    "Registers plugin-provided skills, commands, agents, hooks, MCP servers, LSP servers, output styles, themes, and monitors"
                  ],
                  "interacts_with": [
                    ".claude/settings.json enabledPlugins",
                    ".claude/skills/<plugin-name>/skills/**",
                    ".claude/skills/<plugin-name>/agents/**",
                    ".claude/skills/<plugin-name>/hooks/**",
                    ".claude/skills/<plugin-name>/.mcp.json"
                  ],
                  "format_example": {
                    "name": "team-plugin",
                    "version": "1.0.0",
                    "skills": [],
                    "agents": [],
                    "hooks": {},
                    "mcpServers": {}
                  },
                  "runtime_role_in_loop": "Gather: plugin registry expands available commands, tools, agents, hooks, and styles after project trust."
                }
              ]
            },
            {
              "path": ".claude/commands/",
              "type": "directory",
              "purpose": "Legacy custom slash commands.",
              "key_functions": [
                "Defines Markdown slash commands",
                "Supports namespaces through subdirectories",
                "Can interpolate arguments and shell context where permitted"
              ],
              "interacts_with": [
                ".claude/settings.json",
                ".claude/skills/**",
                "slash command runtime"
              ],
              "format_example": ".claude/commands/review.md",
              "runtime_role_in_loop": "Reason/Act: manual user invocation injects a command prompt and optional arguments."
            },
            {
              "path": ".claude/commands/**/*.md",
              "type": "markdown_file",
              "purpose": "Individual command definition.",
              "key_functions": [
                "Creates a slash command",
                "Can use $ARGUMENTS and positional arguments",
                "Can call tools if permitted"
              ],
              "interacts_with": [
                "user slash invocation",
                ".claude/settings.json permissions",
                ".claude/agents/*.md"
              ],
              "format_example": "---\ndescription: Run a staged diff review.\nargument-hint: \"[scope]\"\nallowed-tools: [Read, Bash]\n---\nReview staged changes for correctness: $ARGUMENTS",
              "runtime_role_in_loop": "Act: user-triggered command turns into task instructions for the model."
            },
            {
              "path": ".claude/agents/",
              "type": "directory",
              "purpose": "Project custom subagent definitions.",
              "key_functions": [
                "Defines specialized worker agents",
                "Controls model, effort, tools, permissions, hooks, MCP servers, memory, background, and isolation",
                "Runs in separate context and returns summary"
              ],
              "interacts_with": [
                ".claude/agent-memory/**",
                ".claude/agent-memory-local/**",
                ".claude/skills/**",
                ".claude/workflows/*.js",
                ".claude/settings.json",
                ".claude/rules/*.md"
              ],
              "format_example": ".claude/agents/pr-reviewer.md",
              "runtime_role_in_loop": "Reason/Act/Verify: delegated specialist execution isolated from parent context."
            },
            {
              "path": ".claude/agents/*.md",
              "type": "markdown_file",
              "purpose": "Subagent profile with YAML frontmatter and role prompt.",
              "key_functions": [
                "Names the subagent",
                "Defines delegation trigger description",
                "Restricts or grants tools",
                "Can preload skills",
                "Can enable project or local memory",
                "Can request worktree isolation"
              ],
              "interacts_with": [
                "parent agent",
                ".claude/skills/*/SKILL.md",
                ".claude/agent-memory/<agent>/MEMORY.md",
                ".claude/settings.json permissions",
                "MCP servers"
              ],
              "format_example": "---\nname: pr-reviewer\ndescription: Reviews diffs and drafts PR notes.\nmodel: haiku\npermissionMode: plan\ntools: [Read, Grep, Bash]\nmemory: project\n---\nYou are a read-only PR review specialist.",
              "runtime_role_in_loop": "Plan/Verify: receives delegated work, executes in its own context, returns concise result."
            },
            {
              "path": ".claude/agent-memory/",
              "type": "directory",
              "purpose": "Project-scoped persistent memory for custom subagents.",
              "key_functions": [
                "Stores reusable subagent notes",
                "Survives context compaction",
                "Can be committed when team-shared"
              ],
              "interacts_with": [
                ".claude/agents/*.md",
                "subagent startup prompt"
              ],
              "format_example": ".claude/agent-memory/pr-reviewer/MEMORY.md",
              "runtime_role_in_loop": "Iterate: persists lessons and patterns for future subagent invocations."
            },
            {
              "path": ".claude/agent-memory/<agent-name>/MEMORY.md",
              "type": "markdown_file",
              "purpose": "Primary project memory file for a named subagent.",
              "key_functions": [
                "First 200 lines or 25 KB are injected at subagent startup",
                "Records build commands, fixes, conventions, or recurring findings"
              ],
              "interacts_with": [
                ".claude/agents/<agent-name>.md"
              ],
              "format_example": "# pr-reviewer Memory\n- Prefer npm run test:unit for quick validation.\n- API routes live under src/routes.",
              "runtime_role_in_loop": "Gather/Iterate: reloads durable subagent knowledge on each invocation."
            },
            {
              "path": ".claude/agent-memory-local/",
              "type": "directory",
              "purpose": "Local-only persistent memory for custom subagents.",
              "key_functions": [
                "Stores developer-private subagent memory",
                "Avoids sharing local preferences or private paths"
              ],
              "interacts_with": [
                ".claude/agents/*.md",
                ".gitignore"
              ],
              "format_example": ".claude/agent-memory-local/pr-reviewer/MEMORY.md",
              "runtime_role_in_loop": "Iterate: persists private subagent notes for local reuse."
            },
            {
              "path": ".claude/workflows/",
              "type": "directory",
              "purpose": "Project dynamic workflow scripts.",
              "key_functions": [
                "Stores deterministic JavaScript orchestration scripts",
                "Coordinates many subagents",
                "Keeps intermediate state in JS variables",
                "Returns final synthesized result to parent session"
              ],
              "interacts_with": [
                ".claude/agents/*.md",
                ".claude/settings.json permissions",
                ".claude/worktrees/**",
                "workflow runtime"
              ],
              "format_example": ".claude/workflows/api-security-audit.js",
              "runtime_role_in_loop": "Plan/Act/Verify: externalizes orchestration from the model into resumable JS control flow."
            },
            {
              "path": ".claude/workflows/*.js",
              "type": "javascript_file",
              "purpose": "Dynamic workflow implementation.",
              "key_functions": [
                "Exports workflow metadata",
                "Calls agent(), parallel(), pipeline(), or workflow()",
                "Validates structured subagent outputs with schemas",
                "Runs large-scale multi-agent procedures"
              ],
              "interacts_with": [
                "workflow runtime",
                "subagents",
                ".claude/worktrees/**",
                "tool allowlist"
              ],
              "format_example": "export const meta = { name: \"audit-api\", description: \"Audit API routes\" };\nconst result = await agent(\"Find API route files\", { schema: { type: \"object\" } });\nreturn result;",
              "runtime_role_in_loop": "Reason/Plan: deterministic coordinator; Act: spawns subagents; Verify: aggregates results."
            },
            {
              "path": ".claude/output-styles/",
              "type": "directory",
              "purpose": "Project-local custom output styles.",
              "key_functions": [
                "Defines response role, tone, and formatting",
                "Can preserve or replace built-in coding instructions",
                "Selected style affects system prompt"
              ],
              "interacts_with": [
                ".claude/settings.local.json",
                "system prompt",
                "model output"
              ],
              "format_example": ".claude/output-styles/security-auditor.md",
              "runtime_role_in_loop": "Gather/Reason: modifies communication and formatting behavior at system-prompt level."
            },
            {
              "path": ".claude/output-styles/*.md",
              "type": "markdown_file",
              "purpose": "Custom output style definition.",
              "key_functions": [
                "Sets display name",
                "Sets description",
                "Controls keep-coding-instructions",
                "Defines role and formatting rules"
              ],
              "interacts_with": [
                "system prompt",
                ".claude/settings.local.json"
              ],
              "format_example": "---\nname: Security Auditor\ndescription: Formats answers as security reviews.\nkeep-coding-instructions: true\n---\nPrioritize threat models and validation.",
              "runtime_role_in_loop": "Reason/Observe: shapes how plans, findings, and summaries are expressed."
            },
            {
              "path": ".claude/hooks/",
              "type": "directory",
              "purpose": "Project hook executable storage convention.",
              "key_functions": [
                "Holds scripts called by hook registrations",
                "Supports validation, formatting, testing, blocking, logging, and context injection"
              ],
              "interacts_with": [
                ".claude/settings.json hooks",
                ".claude/agents/*.md hooks",
                "plugin hooks",
                "tool execution lifecycle"
              ],
              "format_example": ".claude/hooks/validators/analyze-commands.js",
              "runtime_role_in_loop": "Act/Observe/Verify: executes deterministic scripts before, after, or around model actions."
            },
            {
              "path": ".claude/hooks/**/*.js",
              "type": "javascript_file",
              "purpose": "Hook script executable or helper.",
              "key_functions": [
                "Reads JSON hook payload from stdin when used as command hook",
                "Can allow, block, or add context depending on event",
                "Can run local checks"
              ],
              "interacts_with": [
                "hook runtime",
                "CLAUDE_PROJECT_DIR",
                ".claude/settings.json"
              ],
              "format_example": "const fs = require('fs');\nlet input = '';\nprocess.stdin.on('data', c => input += c);\nprocess.stdin.on('end', () => process.exit(0));",
              "runtime_role_in_loop": "Act/Verify: deterministic guardrail outside model reasoning."
            },
            {
              "path": ".claude/claude-security-guidance.md",
              "type": "markdown_file",
              "purpose": "Project security guidance for the Security Guidance Plugin.",
              "key_functions": [
                "Adds natural-language security review criteria",
                "Guides model-backed security analysis"
              ],
              "interacts_with": [
                "security-guidance plugin",
                ".claude/security-patterns.yaml",
                "git diff"
              ],
              "format_example": "# Security Guidance\nFlag IDOR, SSRF, unsafe eval, weak auth checks, and credential exposure.",
              "runtime_role_in_loop": "Observe/Verify: influences security review findings after edits or before commits."
            },
            {
              "path": ".claude/claude-security-guidance.local.md",
              "type": "markdown_file",
              "purpose": "Developer-local security guidance.",
              "key_functions": [
                "Adds private security review preferences",
                "Avoids committing local policy"
              ],
              "interacts_with": [
                "security-guidance plugin",
                ".claude/claude-security-guidance.md"
              ],
              "format_example": "# Local Security Guidance\nAlso check internal staging URLs and private package scopes.",
              "runtime_role_in_loop": "Observe/Verify: local supplement for security review context."
            },
            {
              "path": ".claude/security-patterns.yaml",
              "type": "yaml_file",
              "purpose": "Project custom security regex patterns.",
              "key_functions": [
                "Registers local risky-code patterns",
                "Supports per-edit scanner warnings",
                "Can target files and messages"
              ],
              "interacts_with": [
                "security-guidance plugin",
                ".claude/claude-security-guidance.md",
                "edited files"
              ],
              "format_example": "patterns:\n  - id: unsafe-eval\n    regex: \"eval\\\\(\"\n    message: \"Avoid eval; use a safe parser.\"\n    severity: high",
              "runtime_role_in_loop": "Observe/Verify: scanner input for immediate security warnings."
            },
            {
              "path": ".claude/security-patterns.yml",
              "type": "yaml_file",
              "purpose": "YAML extension alternative for custom security patterns.",
              "key_functions": [
                "Same role as security-patterns.yaml"
              ],
              "interacts_with": [
                "security-guidance plugin"
              ],
              "format_example": "patterns: []",
              "runtime_role_in_loop": "Observe/Verify: alternative filename for scanner configuration."
            },
            {
              "path": ".claude/security-patterns.json",
              "type": "json_file",
              "purpose": "JSON alternative for custom security patterns.",
              "key_functions": [
                "Same role as security-patterns.yaml in JSON form"
              ],
              "interacts_with": [
                "security-guidance plugin"
              ],
              "format_example": {
                "patterns": []
              },
              "runtime_role_in_loop": "Observe/Verify: alternative JSON scanner configuration."
            },
            {
              "path": ".claude/worktrees/",
              "type": "runtime_directory",
              "purpose": "Runtime-created isolated worktree parent directory.",
              "key_functions": [
                "Hosts worktrees created by --worktree or subagent worktree isolation",
                "Keeps parallel edits isolated",
                "Should normally be gitignored"
              ],
              "interacts_with": [
                ".claude/agents/*.md isolation",
                ".claude/workflows/*.js",
                "./.worktreeinclude",
                "Git"
              ],
              "format_example": ".claude/worktrees/feature-a/",
              "runtime_role_in_loop": "Act/Verify: isolates risky or parallel changes from the main working tree."
            },
            {
              "path": ".claude/loop.md",
              "type": "markdown_file",
              "purpose": "Optional prompt file consumed by the /loop command.",
              "key_functions": [
                "Stores autonomous maintenance prompt",
                "Allows repeated loop execution from a project-local file"
              ],
              "interacts_with": [
                "/loop command",
                ".claude/settings.json permissions",
                ".claude/hooks/**"
              ],
              "format_example": "# Loop Prompt\nCheck for failing tests, fix small issues, and stop after one verified improvement.",
              "runtime_role_in_loop": "Iterate: seeds repeated autonomous work when /loop is run."
            }
          ]
        }
   
      ]
    }

* * *

4. Interaction graph
   ====================
   
    flowchart TD
      User[User prompt or slash command] --> Settings[.claude/settings.json + settings.local.json]
      Settings --> Policy[Permissions, plugins, hooks, env, model defaults]
      User --> Context[Gather context]
      Context --> ClaudeMD[.claude/CLAUDE.md]
      Context --> Rules[.claude/rules/*.md]
      Context --> SkillIndex[Skill descriptions]
      Context --> AgentIndex[.claude/agents/*.md]
      Context --> OutputStyle[.claude/output-styles/*.md]
      OutputStyle --> Model[Claude Opus 4.8 or configured model]
      ClaudeMD --> Model
      Rules --> Model
      SkillIndex --> Model
      AgentIndex --> Model
      Policy --> Model
      Model --> Plan[Reason / Plan]
      Plan --> Skill[Selected .claude/skills/<name>/SKILL.md]
      Plan --> Command[Legacy .claude/commands/**/*.md]
      Plan --> Workflow[.claude/workflows/*.js]
      Plan --> Agent[Subagent from .claude/agents/*.md]
      Skill --> SkillAssets[references / examples / scripts / assets]
      SkillAssets --> Act[Tool calls and file edits]
      Command --> Act
      Workflow --> Subagents[Parallel workflow subagents]
      Agent --> Subagents
      Subagents --> AgentMemory[.claude/agent-memory/<agent>/MEMORY.md]
      Subagents --> LocalAgentMemory[.claude/agent-memory-local/<agent>/MEMORY.md]
      Subagents --> Worktrees[.claude/worktrees/<name>/]
      Act --> PreHooks[PreToolUse / Permission hooks]
      PreHooks --> AllowDeny{Allow / Ask / Deny}
      AllowDeny --> Act
      Act --> PostHooks[PostToolUse / Stop hooks]
      PostHooks --> Security[Security guidance + security-patterns]
      Security --> Verify[Observe / Verify]
      Verify --> Model
      Model --> Iterate[Iterate or final answer]
      Iterate --> AgentMemory
      Iterate --> Workflow

Hooks are official lifecycle integrations that run shell commands, HTTP endpoints, or model/prompt hooks at defined events such as `SessionStart`, `UserPromptSubmit`, `PreToolUse`, `PostToolUse`, `Stop`, `SubagentStart`, `SubagentStop`, `WorktreeCreate`, and `WorktreeRemove`. ([Claude Code](https://code.claude.com/docs/en/hooks "Hooks reference - Claude Code Docs")) The Security Guidance Plugin uses project files such as `.claude/claude-security-guidance.md` and `.claude/security-patterns.yaml|yml|json` to guide regex scanning and model-backed security review; its docs warn that guidance is not a hard guardrail and that hard blocking belongs in hooks or CI. ([Claude Code](https://code.claude.com/docs/en/security-guidance "Catch security issues as Claude writes code - Claude Code Docs"))

* * *

5. Executive summary table
   ==========================

| Path                                                 | Function                                                                                | Criticality       |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ----------------- |
| `.claude/`                                           | Project-local namespace for Claude Code configuration, automation, and runtime support. | Critical          |
| `.claude/CLAUDE.md`                                  | Project memory/instruction file loaded as context at session start.                     | High              |
| `.claude/settings.json`                              | Shared project policy for permissions, hooks, plugins, and environment defaults.        | Critical          |
| `.claude/settings.local.json`                        | Local developer override for project behavior, usually gitignored.                      | High              |
| `.claude/rules/`                                     | Container for modular project rules.                                                    | High              |
| `.claude/rules/*.md`                                 | Focused project instructions, optionally path-scoped.                                   | High              |
| `.claude/skills/`                                    | Project skills and skills-directory plugins.                                            | High              |
| `.claude/skills/<skill>/SKILL.md`                    | Skill entrypoint with invocation metadata and execution procedure.                      | High              |
| `.claude/skills/<skill>/references/`                 | Long-form support docs loaded on demand.                                                | Medium            |
| `.claude/skills/<skill>/examples/`                   | Examples that stabilize skill output behavior.                                          | Medium            |
| `.claude/skills/<skill>/scripts/`                    | Deterministic helper scripts used by a skill.                                           | High              |
| `.claude/skills/<skill>/assets/`                     | Static assets, templates, schemas, or media for skill workflows.                        | Medium            |
| `.claude/skills/<plugin>/.claude-plugin/plugin.json` | Manifest for a plugin installed through the skills directory mechanism.                 | High              |
| `.claude/skills/<plugin>/skills/**`                  | Plugin-provided skills.                                                                 | Medium            |
| `.claude/skills/<plugin>/commands/**`                | Plugin-provided commands.                                                               | Medium            |
| `.claude/skills/<plugin>/agents/**`                  | Plugin-provided agents, with restrictions on high-risk fields.                          | High              |
| `.claude/skills/<plugin>/hooks/hooks.json`           | Plugin hook registration file.                                                          | Security-critical |
| `.claude/skills/<plugin>/.mcp.json`                  | Plugin MCP server definitions.                                                          | Security-critical |
| `.claude/skills/<plugin>/.lsp.json`                  | Plugin LSP server definitions.                                                          | Medium            |
| `.claude/skills/<plugin>/output-styles/**`           | Plugin-provided output styles.                                                          | Medium            |
| `.claude/skills/<plugin>/themes/**`                  | Plugin-provided UI themes.                                                              | Low               |
| `.claude/skills/<plugin>/monitors/**`                | Plugin-provided monitoring components.                                                  | Medium            |
| `.claude/commands/`                                  | Legacy command directory.                                                               | Medium            |
| `.claude/commands/**/*.md`                           | Legacy slash command definition.                                                        | Medium            |
| `.claude/agents/`                                    | Custom subagent directory.                                                              | High              |
| `.claude/agents/*.md`                                | Subagent profile defining role, tools, model, effort, memory, hooks, and isolation.     | High              |
| `.claude/agent-memory/`                              | Project-scoped persistent subagent memory.                                              | High              |
| `.claude/agent-memory/<agent>/MEMORY.md`             | Primary memory injected into a named subagent.                                          | High              |
| `.claude/agent-memory/<agent>/*.md`                  | Optional project topic memory for subagents.                                            | Medium            |
| `.claude/agent-memory-local/`                        | Local-only subagent memory directory.                                                   | Medium            |
| `.claude/agent-memory-local/<agent>/MEMORY.md`       | Private memory injected into a named subagent.                                          | Medium            |
| `.claude/workflows/`                                 | Dynamic workflow script directory.                                                      | High              |
| `.claude/workflows/*.js`                             | JavaScript workflow that orchestrates subagents deterministically.                      | High              |
| `.claude/output-styles/`                             | Project output style directory.                                                         | Medium            |
| `.claude/output-styles/*.md`                         | System-prompt style modifier for role, tone, and formatting.                            | Medium            |
| `.claude/hooks/`                                     | Conventional location for hook scripts referenced by settings, agents, or plugins.      | Security-critical |
| `.claude/hooks/**/*.js`                              | JavaScript hook executable/helper.                                                      | Security-critical |
| `.claude/hooks/**/*.sh`                              | Shell hook executable/helper.                                                           | Security-critical |
| `.claude/hooks/**/*.py`                              | Python hook executable/helper.                                                          | Security-critical |
| `.claude/claude-security-guidance.md`                | Project security review guidance for the Security Guidance Plugin.                      | High              |
| `.claude/claude-security-guidance.local.md`          | Local security guidance override.                                                       | Medium            |
| `.claude/security-patterns.yaml`                     | YAML custom security scanner patterns.                                                  | High              |
| `.claude/security-patterns.yml`                      | Alternative YAML scanner pattern filename.                                              | High              |
| `.claude/security-patterns.json`                     | JSON custom security scanner patterns.                                                  | High              |
| `.claude/worktrees/`                                 | Runtime parent for Claude-created isolated Git worktrees.                               | Runtime-critical  |
| `.claude/worktrees/<name>/`                          | Isolated working copy for parallel agent work.                                          | Runtime-critical  |
| `.claude/loop.md`                                    | Optional prompt file used by `/loop`.                                                   | Medium            |

* * *

6. Data-flow examples
   =====================

A. Normal coding task
---------------------

1. Claude Code starts inside a project.

2. It gathers `.claude/settings.json`, `.claude/settings.local.json`, `.claude/CLAUDE.md`, unconditional `.claude/rules/*.md`, skill metadata, agent metadata, and selected output style.

3. The user asks for a change.

4. Path-scoped rules load when Claude opens matching files.

5. Before shell/edit actions, `PreToolUse` hooks and permissions evaluate the operation.

6. After edits, `PostToolUse`, `Stop`, Security Guidance, or workflow verification checks inspect the result.

7. The model either iterates or returns a final answer.

B. Skill-driven workflow
------------------------

1. User runs `/audit-dependencies`.

2. Claude loads `.claude/skills/audit-dependencies/SKILL.md`.

3. The skill reads templates, examples, or scripts from its own folder using `CLAUDE_SKILL_DIR`.

4. Tool calls execute subject to `settings.json` permissions and hooks.

5. The skill returns a report or writes files only if permitted.

Official skills support frontmatter fields for name, description, arguments, manual invocation, model, effort, allowed/disallowed tools, context forking, hooks, paths, and shell; they also support `$ARGUMENTS`, positional/named arguments, `CLAUDE_SESSION_ID`, `CLAUDE_EFFORT`, and `CLAUDE_SKILL_DIR`. ([Claude Code](https://code.claude.com/docs/en/workflows "Orchestrate subagents at scale with dynamic workflows - Claude Code Docs"))
C. Dynamic workflow with subagents
----------------------------------

1. User asks for a broad audit or runs a saved workflow.

2. `.claude/workflows/audit-api.js` starts.

3. JS workflow discovers files through an `agent()` call.

4. It fans out many subagents with `parallel()`.

5. Each subagent reads files, returns structured JSON, and may run in a worktree.

6. Workflow aggregates results and returns a compact final answer to the parent.

Official workflow docs distinguish workflows from skills and subagents: workflows keep state in script variables, scale to many subagents, are resumable, and return only the final answer to Claude’s context. ([Claude Code](https://code.claude.com/docs/en/workflows "Orchestrate subagents at scale with dynamic workflows - Claude Code Docs"))
D. MCP connector interaction
----------------------------

Project-local MCP server configuration is officially adjacent at `./.mcp.json`, not inside `./.claude/`. Skills-directory plugins can also include `.mcp.json` inside the plugin folder. MCP servers expose external tools and data such as Jira, Sentry, databases, Figma, Slack, Gmail, or other services to Claude Code. ([Claude Code](https://code.claude.com/docs/en/mcp "Connect Claude Code to tools via MCP - Claude Code Docs")) A typical flow is:

1. `.mcp.json` registers an HTTP, SSE, stdio, or WebSocket server.

2. Claude Code prompts for approval when needed.

3. MCP tools appear as available tools.

4. Skills, agents, commands, or workflows can call MCP tools subject to settings and permissions.

5. Outputs return into the active model or subagent context.

* * *

7. Non-canonical items explicitly excluded from `./.claude/`
   ============================================================

| Item                                                            | Why excluded from strict tree                                                                              |
| --------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| `./CLAUDE.md`                                                   | Official project memory file, but outside `.claude/`; `.claude/CLAUDE.md` is the in-directory alternative. |
| `./CLAUDE.local.md`                                             | Local project memory override, but outside `.claude/`.                                                     |
| `./.mcp.json`                                                   | Project MCP configuration, but outside `.claude/`.                                                         |
| `./.worktreeinclude`                                            | Worktree file-copy rules, but outside `.claude/`.                                                          |
| `~/.claude/projects/<project>/memory/`                          | Main auto memory storage is global home data, not project-local `.claude/`.                                |
| `~/.claude/plugins/`                                            | Installed plugin storage is global home data, not project-local `.claude/`.                                |
| `~/.claude/security/`                                           | Security Guidance runtime venv is global, not project-local.                                               |
| `~/.claude/history.jsonl`, transcripts, caches, shell snapshots | Application data under global home, not project-local `.claude/`.                                          |

Official docs separately identify global application data under `~/.claude/`, including transcripts, tool results, plans, debug logs, caches, session environment, task state, shell snapshots, and persistent history/cache files. ([Claude Code](https://code.claude.com/docs/en/memory "How Claude remembers your project - Claude Code Docs"))
