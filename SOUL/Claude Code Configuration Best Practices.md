# **Architectural Guide for Agentic Workspace Orchestration: Enterprise Configuration, Security, and Governance of the.claude Infrastructure in Claude Code**

The deployment of autonomous AI terminal agents across professional software engineering departments requires a paradigm shift from ad-hoc prompting to systematic workspace engineering.1 Anthropic’s Claude Code CLI serves as an agentic assistant running directly in local terminal environments, executing complex command structures, editing files, managing version control states, and coordinating external integrations.1  
Operating this agentic environment securely and productively at scale relies on a structured configuration directory located at the project-level (.claude/) and the global user-level (\~/.claude/).3 Left unconfigured, agentic operations are subject to context saturation, repetitive instructions, and vulnerability to prompt injection or accidental data modification.2  
This report provides a comprehensive, production-proven architectural blueprint for configuring, securing, and maintaining the .claude folder schema to achieve maximum velocity and organizational compliance.

## **1\. Executive Summary and Ranked Best Practices**

The integration of terminal-based AI agents introduces unique operational challenges, primarily centered on context window limitations, model instruction drift, and local privilege escalation.2 The development of a robust workspace infrastructure acts as a critical mitigation strategy against these failures.7  
To guide engineering departments, the top best practices have been analyzed and ranked by their systemic impact on security, operational velocity, token efficiency, and codebase maintenance.

### **High-Impact Configuration Best Practices**

| Rank | Strategic Best Practice | Primary Operational Subsystem | Core Mechanism and Systemic Benefit | Reference Citations |
| :---- | :---- | :---- | :---- | :---- |
| **1** | Enforce Strict Permission Deny Lists over .claudeignore | Workspace Security / Permissions | Implements hard filesystem and command boundaries via the permissions.deny array in settings.json to prevent the CLI harness from executing unauthorized reads or writes. This neutralizes the systemic risk of model bypasses associated with .claudeignore files. | \[6, 8, 9, 10\] |
| **2** | Establish Centralized Org-Level Managed Settings | Compliance & Governance | Deploys immutable configuration baselines via Server-Managed UI, MDM policies, or Drop-In directories (managed-settings.d/) to enforce enterprise limits that cannot be overridden by local developers. | 8 |
| **3** | Require the Real-Time Security Guidance Plugin | Continuous Vulnerability Scanning | Enforces security-guidance@claude-plugins-official in project settings to execute multi-layered, regex-backed, and agentic scans on all files changed in the session prior to commits. | 12 |
| **4** | Constrain CLAUDE.md to Under 200 Lines | Context Optimization | Adheres to strict token limits (\<200 lines or 25KB) in the main project instructions to maximize rule adherence and defer the onset of context compaction. | \[2, 15, 16\] |
| **5** | Implement Path-Scoped Instruction Splitting | Rule Modularization | Modularizes detailed styling and API parameters into .claude/rules/\*.md using glob patterns, allowing the agent to lazy-load context on an as-needed basis. | 3 |
| **6** | Deploy Specialized Custom Subagents | Workflow Parallelization | Configures narrow-scoped subagents in .claude/agents/ utilizing cheaper, faster models (e.g., Haiku) and restricted tools to delegate background tasks. | 17 |
| **7** | Restrict Skill Model-Invocation via Frontmatter | Side-Effect Control | Sets disable-model-invocation: true in SKILL.md files to prevent the AI from autonomously initiating high-risk tasks such as deployments or Slack integrations. | 18 |
| **8** | Hydrate Workflows with Dynamic Context Injection | Real-Time Workspace Awareness | Employs command execution interpolation (\!\`\<command\>\` ) in skills to inject live workspace telemetry directly into the context window before prompt evaluation. | 18 |
| **9** | Standardize Repository Configuration Files | Team Consistency | Commits .claude/settings.json directly to source control to standardize workspace tools, required plugins, and safe command allowlists for all collaborators. | \[4, 5, 8\] |
| **10** | Tune the autoMode Classifier with $defaults | Autonomous Execution | Configures the background safety classifier via the autoMode block in global user settings, maintaining built-in protections while registering trusted repositories. | 17 |

## **2\. Comprehensive Visual Anatomy of the.claude Directory**

Operating Claude Code effectively requires a clear understanding of where configurations are located and how they interact.3 Workspace management is divided into two filesystems: the **Project-Level** directory, which is committed to the repository to standardize team workflows, and the **Global Home** directory, which holds machine-specific user settings, authentication caches, and persistent session histories.4  
The following diagram illustrates the complete file and folder structure of a mature, production-grade .claude configuration:

your-project/ (Repository Root)  
├── CLAUDE.md                        \# Project-level primary instructions (committed)  
├── CLAUDE.local.md                  \# Machine-specific instruction overrides (gitignored)  
└──.claude/  
    ├── settings.json                \# Project-level team settings (committed)  
    ├── settings.local.json          \# Personal project configurations (gitignored)  
    ├── rules/  
    │   ├── api-style.md             \# Path-scoped API rule: loaded when /api/ matches  
    │   └── test-standards.md        \# Path-scoped Test rule: loaded when /tests/ matches  
    ├── skills/  
    │   └── db-migrate/  
    │       ├── SKILL.md             \# Custom reusable workflow (committed)  
    │       └── template.md          \# Markdown template used by the skill  
    ├── agents/  
    │   └── pr- reviewer.md          \# Custom specialized subagent configuration  
    └── worktrees/                   \# Isolate branch workspaces generated by agent

\~/.claude/ (User Home Directory)  
├── CLAUDE.md                        \# Global personal preferences (applied to all projects)  
├── settings.json                    \# Global user settings (applied to all projects)  
├──.claude.json                     \# Session states, OAuth keys, and project trust caches  
├── rules/                           \# Global path-scoped rules (applied to all projects)  
├── skills/                          \# Global personal skills (applied to all projects)  
├── agents/                          \# Global personal subagents (applied to all projects)  
└── projects/  
    └── \<project-hash\>/  
        ├── MEMORY.md                \# Claude's self-generated auto-memory index  
        └── sessions.jsonl           \# Local JSONL database of conversation logs

### **Reference Table: Configuration Schema**

The table below catalogs every file and folder in the .claude ecosystem, specifying its organizational scope, recommended git status, resolution priority, and operational purpose:

| File / Folder Path | Operational Scope | Git Status | Resolve Priority | Functional Purpose & Execution Lifecycle |
| :---- | :---- | :---- | :---- | :---- |
| /etc/claude-code/ or MDM | Organization | N/A | 1 (Highest) | **Managed Settings:** System-wide or group-level profiles distributed via MDM or system directories. Prevents local developers from bypassing key security policies. 8 |
| \--model / CLI flags | Session Only | N/A | 2 | **CLI Parameter Overrides:** Commands passed directly at launch to temporarily modify models, permission profiles, or debug flags. \[8, 21\] |
| .claude/settings.local.json | Project Local | Gitignored | 3 | **Local Project Settings:** Overrides team project configurations for machine-specific path resolutions, database strings, or personal keys. 8 |
| .claude/settings.json | Project Shared | Committed | 4 | **Shared Project Settings:** Establishes standard team rules, required plugins, and approved command matrices. Checked into version control. 8 |
| \~/.claude/settings.json | Global User | Personal | 5 (Lowest) | **Global User Settings:** Configures global defaults, fallback models, themes, and personalized shell environment overrides. 8 |
| \~/.claude.json | Global User | Personal | N/A | **Identity & State Storage:** Contains active OAuth tokens, global workspace cache data, trusted path definitions, and local CLI state metadata. 8 |
| CLAUDE.local.md | Project Local | Gitignored | Additive | **Personal Project Instructions:** Injects user-specific instruction layers directly into the primary prompt block without affecting team files. 3 |
| .claude/CLAUDE.md | Project Shared | Committed | Additive | **Shared Project Instructions:** The foundational context layer loaded at the start of every session, defining build, test, and style commands. 3 |
| \~/.claude/CLAUDE.md | Global User | Personal | Additive | **Global User Instructions:** Declares personal coding preferences (e.g., specific naming paradigms or comment densities) across all projects. \[3, 4, 20\] |
| .claude/rules/\*.md | Project Shared | Committed | Lazy Loaded | **Path-Scoped Rules:** Instructions designed to lazy-load into the context window only when files matching the target glob pattern are accessed. 3 |
| .claude/skills/\<name\>/ | Project Shared | Committed | On-Demand | **Invocable Skills:** Packages of custom workflows, templates, and scripts launched via a slash command or triggered automatically by context. \[3, 18\] |
| .claude/agents/\*.md | Project Shared | Committed | Agent Scoped | **Custom Subagents:** Markdown profiles defining focused, specialized agent personas, specifying their target models, tool sets, and memory rules. 17 |
| \~/.claude/projects/\*/MEMORY.md | Global/Project | N/A | Additive | **Auto Memory Index:** Self-generated notes written dynamically by the agent to record build parameters, corrections, and debugging profiles. \[2, 15, 22\] |

### **Precedence Resolution Engine**

When executing a task or resolving configurations, Claude Code handles settings using a dual-modality resolution model:

* **Scalar Settings Cascade:** Standard scalar configuration keys (such as model, outputStyle, or env variables) are governed by a strict cascading override model.8 The system evaluates layers from the top down (Managed \-\> CLI \-\> Local Project \-\> Shared Project \-\> Global User).8 The first non-empty value encountered for a specific key is used, completely overriding any values defined in lower-priority tiers.8  
* **Permission Merger and Enforcement:** Unlike scalar values, standard permission matrices (allow, deny, and ask blocks) **merge additively across all active configuration scopes**.8 This ensures that if a command or directory path is blocked at the global user level (\~/.claude/settings.json), it cannot be unblocked or allowed by a project-level configuration file committed to a repository.8

However, system administrators can override this default merging behavior by declaring "allowManagedPermissionRulesOnly": true in the managed policy tier.8 This locks the CLI client to the organization's administrative rules, ignoring all local and project-level permission modifications.8

## **3\. Deep-Dive: Project Instructions and Modular Rule Optimization**

To ensure instructions are followed effectively, developers must treat the agent's context window as a finite resource.7 A common mistake is the creation of monolithic, all-encompassing CLAUDE.md files that saturate the context window and cause instructions to degrade over time.4

### **The Context Window and Compaction Mechanics**

Every Claude Code session maintains a context window containing the conversation history, file reads, tool outputs, system instructions, and active configuration files.2 As a session progresses, this window fills toward its limit.2  
When the context window approaches capacity, the CLI engine executes an automatic **Compaction** sequence.2 This operation removes older tool outputs and summarizes previous conversation turns.2  
While raw chat instructions can be lost during compaction, project-level configurations, the auto-memory index, and CLAUDE.md files survive compaction and are re-read fresh from disk.2  
However, if CLAUDE.md is too large, it permanently consumes a significant portion of the context window, leaving less room for code files and command outputs, which accelerates compaction and increases the likelihood of instruction decay.2  
To maintain strong instruction adherence and control token costs, engineering teams must adopt the following standards:

1. **The 200-Line Standard:** Keep the primary project CLAUDE.md strictly **under 200 lines (or 25KB)**.2 It should focus exclusively on high-level architecture maps, run commands, test execution parameters, and core styling guidelines.15  
2. **The @ Import Protocol:** Split dense reference materials, database schemas, or dependency guides into separate markdown files, importing them only when needed using the @path/to/import syntax.15 Relative import paths resolve based on the directory of the file containing the import statement, up to a **maximum recursive depth of four hops**.15 When external imports are first loaded in a workspace, the client pauses and prompts the user for explicit security approval.15  
3. **Monorepo Directory Isolation:** For monorepos containing multiple independent codebases, configure the claudeMdExcludes property in settings to prevent instructions from unrelated directories from loading and cluttering the session.15

### **Glob-Matching and Path-Scoped Rules**

For large codebases, domain-specific instructions must be offloaded to **Path-Scoped Rules** located in .claude/rules/\*.md.15 Unlike standard instructions, path-scoped rules are lazy-loaded on-demand.3 The CLI engine reads their glob headers and injects their contents into the context window only when the agent opens or writes to files that match the target patterns.3

#### **Production-Grade Path-Scoped Rule: .claude/rules/nest-controllers.md**

## **globs: \["src/api/controllers//\*.controller.ts", "src/api/dto//\*.dto.ts"\]**

# **NestJS Controller and DTO Standards**

## **Request Validation and Serialization**

* Every controller route parameter must be strongly typed with an validated DTO.  
* All DTO properties must have explicit decorators from the class-validator library.  
* Password fields must utilize the @IsString() and @MinLength(12) decorators.

## **Controller Execution Rules**

* Controllers are strictly forbidden from executing raw database queries or transaction logs.  
* Delegate all domain business logic directly to injected core service classes.  
* Wrap all responses in standard API enveloping types as defined in src/common/types/api-response.ts.

### **Before-and-After Implementation Comparison**

The following sections contrast a low-adherence, monolithic instruction style with an optimized, high-adherence modular structure.

#### **Before: Unoptimized Monolithic CLAUDE.md (Anti-Pattern)**

# **My Project Guide**

We use TypeScript and React here. Make sure code is formatted and write tests.

# **Code Style**

Always write clean code. Don't use too many comments unless necessary. Format beautifully.  
Use ES modules for imports and exports.

# **Database**

Our postgres database has tables for users, logs, and billing. Make sure queries are optimized.  
Users Table Schema:

* id: UUID  
* email: string  
* created\_at: Timestamp

# **How to run**

To run our app, run npm start. Or run dev if you are in development.  
To test, run npm test, npm run test:unit, or npm run test:integration.

# **Deploy**

Deployments are done by executing npm run deploy or running the script deploy.sh.  
Do not deploy unless tests are completely green.

#### **After: Optimized Modular Instruction Structure (Production Pattern)**

##### **File 1: .claude/CLAUDE.md (Project Root Core Guidelines)**

# **Workspace Baseline Guide**

## **Environment Execution Commands**

* Build Project: npm run build  
* Local Development: npm run dev  
* Target Unit Tests: npm run test:unit 23  
* Target Integration Tests: npm run test:integration

## **Essential Architectural Constraints**

* Language Engine: TypeScript, Node.js 22.x LTS.  
* Coding Paradigm: Strict functional programming. Class structures are prohibited.  
* Module Imports: Standard ES modules syntax (import/export). Destructure imports explicitly.23

## **Component References**

* Refer to @package.json for validated operational script parameters.15  
* Refer to @docs/database-schema.md for local schema tables and mapping targets.15  
* Sub-domain instructions are split and modularized via glob-matching rules in .claude/rules/.3

##### **File 2: .claude/rules/react-components.md (Path-Scoped Component Rules)**

## **globs: \["src/components//\*.tsx", "src/hooks//\*.ts"\]**

# **React Component Development Standards**

## **State Management and Hooks**

* Components must be functional. Extract state logic into custom hooks in src/hooks/.  
* Limit component rendering depth. Keep individual files under 150 lines.  
* Wrap complex computations and click handlers in useMemo and useCallback to maintain performance.

## **Styling and Interface Constraints**

* Stylings must be constructed using Tailwind CSS utility classes within the element markup.  
* Every component must declare explicit TypeScript interface definitions for props.

## **4\. Reusable Workflows: Skills, Commands, and Specialized Subagents**

To automate complex workflows, developers can utilize two custom automation frameworks in Claude Code: **Skills** and **Subagents**.4

### **Transitioning from Legacy Commands to Modern Skills**

In early versions of the CLI, custom workflows were defined in .claude/commands/ as simple markdown files containing static prompts.4 While these legacy commands are still supported for backward compatibility, new custom workflows should be implemented as **Skills**.24  
A Skill is a structured directory containing metadata configurations, template patterns, helper scripts, and support files.18 This structure allows skills to use dynamic environmental parameters, handle complex logic, and control model-execution boundaries.18

.claude/skills/audit-dependencies/  
├── SKILL.md                 \# Entry point, frontmatter configuration, and main instructions  
├── template.md              \# Template layout for writing findings and summaries  
└── scripts/  
    └── run\_audit.sh         \# Helper bash script executed during run cycles

#### **The SKILL.md File Format**

The main entry point of a skill contains a YAML frontmatter block that configures execution permissions, tool access, and model interactions.18

## **name: audit-dependencies description: Reviews the package manifest, runs a security audit, and drafts a dependencies update report. disable-model-invocation: true user-invocable: true allowed-tools:**

# **Security and Dependency Auditing Workflow**

## **Dynamic Telemetry Acquisition**

* Initialize the process by running the local security scanner script:  
  \!bash ${CLAUDE\_SKILL\_DIR}/scripts/run\_audit.sh

## **Operational Procedure**

1. Parse the security findings generated by the audit script.  
2. Read the project's dependency definition files from package.json.  
3. Draft a comprehensive remediation report using the template at ${CLAUDE\_SKILL\_DIR}/template.md.  
4. Present the drafted report to the user and request confirmation before writing to DEPENDENCY\_ALERTS.md.

### **Workspace Variables and Shell Command Interpolation**

The Skill execution engine resolves several runtime variables, allowing workflows to adapt dynamically to the environment 18:

* **System-Defined Variables:**  
  * $ARGUMENTS: Captures all trailing parameters passed to the slash command.18  
  * $0, $1, $N: Resolves specific, space-delimited positional arguments.18  
  * ${CLAUDE\_SESSION\_ID}: The unique identifier for the active CLI session.18  
  * ${CLAUDE\_EFFORT}: The current model reasoning budget (low, medium, high, xhigh).18  
  * ${CLAUDE\_SKILL\_DIR}: Resolves to the absolute path of the skill's source directory, allowing the engine to execute relative helper scripts regardless of the current working directory.18  
* **Dynamic Context Injection:** Using the \!\`\<bash command\>\` syntax allows a skill to run local bash commands and inject their standard output directly into the context window *before* the model evaluates the prompt.18 This ensures the agent is grounded in real-time system state (such as active git branches, compiler outputs, or local configurations).18  
* **Automatic Compaction Lifecycle:** To prevent active workflows from degrading when the context window fills up, the engine preserves recently invoked skills.18 The compaction process carries forward the first **5,000 tokens** of the most recently invoked skills, maintaining a combined skill memory budget of up to **25,000 tokens**.18

### **Designing Specialized Subagents in .claude/agents/**

When a task requires intensive background processing—such as analyzing large test outputs, crawling extensive subdirectories, or compiling builds—running it in the main conversation thread can quickly fill the context window with temporary data.2  
The solution is to spawn a **Subagent**.16 Subagents are specialized, independent workers that execute in their own isolated context windows, returning only a final summary to the main conversation thread.17  
Custom subagents are defined as markdown files with YAML configurations 17:  
name: schema-architect  
description: Evaluates data mutations and generates migration files for the relational database.  
model: haiku  
tools:  
permissionMode: plan  
memory: project  
skills:

* database-conventions

You are an expert PostgreSQL database administrator. Your objective is to review proposed code modifications and generate SQL migration scripts.  
Analyze the codebase and draft a migration plan under 'db/migrations/'. You operate in a read-only plan mode; do not modify files directly or run migrations.

#### **Subagent Execution and Permission Boundaries**

Custom subagents run securely within the parent session by following strict execution rules 17:

1. **Model Optimization:** By defining cheaper, faster models (such as haiku) in the agent's metadata, teams can run background research tasks at a fraction of the cost of the main model.17  
2. **Permission Mode Controls:** The permissionMode property (e.g., default, acceptEdits, plan, dontAsk, bypassPermissions, auto) defines the subagent's operational autonomy.17 An agent configured as plan can read files and run exploratory commands but cannot write changes directly to disk, protecting the primary codebase from unintended mutations.17  
3. **Parent Safety Override:** If the parent CLI session is running in a restrictive mode, that safety context takes precedence.17 The subagent cannot override the parent's boundaries to use a more permissive mode.17  
4. **Auto Mode Integration:** If the parent is running in auto mode, the subagent inherits this context.17 Any permissionMode declared in the subagent's frontmatter is ignored, and all of the subagent's actions are evaluated by the parent's background safety classifier.17

## **5\. Security Architecture, Sandboxing, and Collaboration Governance**

Engineering teams must distinguish between **behavioral instructions** and **enforced security boundaries**.9

### **The Security Vulnerability of .claudeignore**

Many development guides suggest using a .claudeignore file (relying on .gitignore syntax) to prevent Claude from reading sensitive data, API keys, .env files, or production databases.7  
This is a critical security vulnerability.9  
The Claude Code terminal harness does not natively enforce, parse, or recognize .claudeignore files.9  
While models may hallucinate that .claudeignore is active, it does not prevent the underlying Read tool from accessing files.9 If the model is prompted to read a file listed in .claudeignore, the CLI tool executes the request without restriction.9

### **Hard Security Enforcement via settings.json**

To establish reliable security boundaries, teams must configure explicit file access and execution blocks in the permissions array within .claude/settings.json or global user configurations.6

JSON  
{  
  "permissions": {  
    "deny":,  
    "allow":,  
    "defaultMode": "acceptEdits"  
  }  
}

* **Glob Pattern Matching:** Permissions support standard glob patterns.8 A single asterisk (\*) matches characters within a single directory level, while double asterisks () recursively traverse nested subdirectories.8  
* **System-Enforced Protected Paths:** In all permission modes except bypassPermissions (and even then, protected file rules are bypassed only as of v2.1.126), Claude Code hard-blocks modifications to critical system paths and configurations 17:  
  * **Protected Directories:** .git, .vscode, .idea, .husky, .claude (excluding routine folders like commands, agents, skills, and worktrees).17  
  * **Protected Files:** .gitconfig, .gitmodules, .bashrc, .bash\_profile, .zshrc, .zprofile, .profile, .ripgreprc, .mcp.json, .claude.json.17  
* **Physical Circuit Breakers:** To prevent catastrophic errors (such as an agent executing rm \-rf \~), the CLI harness retains an un-bypassable confirmation prompt for highly destructive operations targeting root or user-home directories, even if the session is running under bypassPermissions mode.17

### **The Security Guidance Plugin**

Anthropic's **Security Guidance Plugin** (security-guidance@claude-plugins-official) runs as an active background process, continuously auditing code changes generated by the agent before they can be committed or pushed.12  
The plugin implements a **Three-Layer Review Mechanism** 14:

\[Agent Edits Code\]  
        │  
        ├──► LAYER 1: Local Regex Scanner (Regex Check)  
        │             Scans immediately for \~25 known high-risk patterns (e.g., eval injection, unsafe child\_process).  
        │             Execution: Instantly flags vulnerabilities with zero API cost.   
        │  
        ├──► LAYER 2: End-of-Turn LLM Diff Review (Fast LLM Call)  
        │             Triggered at the end of each turn, sending the git diff to a background model (Opus 4.7).  
        │             Execution: Identifies complex logic-level vulnerabilities like IDOR or SSRF. \[12, 14\]  
        │  
        └──► LAYER 3: Commit / Push Agentic Hook (Deeper Agent Run)  
                      Intercepts 'git commit' or 'git push' commands.  
                      Execution: Runs a deeper review that reads surrounding files and callers  
                                 to validate sanitizers and minimize false positives. \[12, 14\]

To enforce this security check across all developers, teams can require the plugin in the project's checked-in configuration 12:

#### **.claude/settings.json**

JSON  
{  
  "enabledPlugins": {  
    "security-guidance@claude-plugins-official": true  
  }  
}

Teams can extend the plugin's capabilities by adding two custom rules files to the project directory 12:

* .claude/security-rules.md: Injects natural language guidelines for the Layer 2 and Layer 3 model-backed reviews.12  
* .claude/security-patterns.json (or .yml): Registers custom regex patterns for the Layer 1 local string scanner.12

### **Enterprise Deployment and MDM Policy Delivery**

In enterprise environments, administrators must lock down developer environments using system-level managed settings.5 Managed settings cannot be modified or bypassed by local developers, project configurations, or command line arguments.8

#### **Platform Deployment Paths**

* **macOS MDM Profiles:** Configured via MDM tools (Jamf, Kandji) targeting the com.anthropic.claudecode preference domain.8  
* **Windows Registry policies:**  
  * Administrator Scope: HKLM\\SOFTWARE\\Policies\\ClaudeCode 8  
  * Registry Key: Settings (REG\_SZ or REG\_EXPAND\_SZ) containing the configuration JSON.8  
* **File-Based Paths:**  
  * macOS: /Library/Application Support/ClaudeCode/managed-settings.json 8  
  * Linux / WSL: /etc/claude-code/managed-settings.json 8  
  * Windows: C:\\Program Files\\ClaudeCode\\managed-settings.json (The legacy path C:\\ProgramData\\ClaudeCode\\ is deprecated as of v2.1.75).8

#### **Managed Drop-In Directories (managed-settings.d/)**

Administrators can deploy independent, modular policy fragments to the managed-settings.d/ directory alongside the main configuration file.8 These files are merged alphabetically at startup 8:

1. **Prefix Mappings:** Use numeric prefixes (e.g., 10-telemetry.json, 20-security.json) to control the alphabetical merging order.8  
2. **Merging Rules:**  
   * Scalar values are overridden by later files.8  
   * Objects are recursively deep-merged.8  
   * Arrays (such as allowed plugins or denied domains) are concatenated and de-duplicated.8

## **6\. Advanced Iteration, Lifecycle Management, and Tool Integration**

As team adoption grows, organizations can extend workspace capabilities through advanced integrations, model tuning, and automation controls.1

### **Model Optimizations and Reasoning Controls**

To manage computational budgets effectively, developers can adjust the model's adaptive reasoning settings directly within the session or permanently in settings.21 For reasoning models such as Claude Opus 4.8 and Sonnet 4.6, developers can set specific **Effort Levels** 21:

* **Effort Budgets:** Configurable via /effort \<low | medium | high | xhigh\>.21  
* **Ultracode Mode:** Triggered using /effort ultracode (or by passing "ultracode": true via CLI flags).21 This temporary, session-scoped setting maximizes the model's reasoning budget (xhigh) and instructs Claude Code to orchestrate advanced, multi-agent workflows to decompose and execute complex, codebase-wide tasks.21

### **Dynamic Scaling with Model Context Protocol (MCP)**

To connect Claude Code to external data sources—such as documentation portals, databases, or ticketing systems—teams can deploy project-scoped MCP servers.1

#### **.mcp.json (Project-Scoped Server Configuration)**

JSON  
{  
  "mcpServers": {  
    "confluence-mcp": {  
      "type": "http",  
      "url": "${CONFLUENCE\_API\_GATEWAY:-https://api.internal.net}/mcp",  
      "headers": {  
        "Authorization": "Bearer ${CONFLUENCE\_API\_KEY}"  
      }  
    },  
    "postgresql-schema-analyzer": {  
      "type": "stdio",  
      "command": "npx",  
      "args":  
    }  
  }  
}

* **Environment Variable Expansion:** Claude Code expands ${VAR} and fallback parameters ${VAR:-default} at startup.17 This allows teams to commit .mcp.json files to source control without exposing sensitive production keys or credentials.17  
* **Execution Directory Hydration:** For STDIO transport servers, the CLI automatically injects the current repository path into the environment variable CLAUDE\_PROJECT\_DIR, allowing local scripts to resolve paths relative to the active codebase.17  
* **Precedence Resolution:** Duplicate server definitions are resolved using the precedence model: *Local \~/.claude.json \> Project.mcp.json \> User Scope \~/.claude.json \> System/Plugin-provided servers*.17

### **Tuning the autoMode Background Classifier**

For highly autonomous workflows, developers can enable **Auto Mode** (available on Claude Opus 4.6+ and Sonnet 4.6 running over the Anthropic API).17 Auto Mode uses a dedicated background safety classifier model to approve and execute commands without prompting the developer.17  
To prevent the classifier from blocking routine internal operations (such as pushing code to a private remote, or querying an internal staging endpoint), developers must configure trusted infrastructure in the global \~/.claude/settings.json file 17:

JSON  
{  
  "autoMode": {  
    "environment": \[  
      "$defaults",  
      "github.com:our-org/\*",  
      "\*.staging.internal.net"  
    \],  
    "soft\_deny":,  
    "hard\_deny":  
  }  
}

* **The $defaults Array Splicing:** To append custom infrastructure rules without discarding Anthropic's built-in security protections, developers must include the string literal "$defaults" in the arrays.19 Omitting "$defaults" completely replaces the built-in system protection matrices, removing critical safety blocks (e.g., data exfiltration guards and auto-mode bypass blocks).19  
* **Classifier Precedence Model:** The background safety engine resolves execution calls using four tiers 19:  
  1. **hard\_deny:** Unconditional block. No user-stated exceptions or model intent can override.19  
  2. **soft\_deny:** Blocked by default. However, explicit user instruction in the chat history or specific allow parameters can override.19  
  3. **allow:** Explicit exceptions that bypass soft\_deny.19  
  4. **Classifier Review:** If no rules match, the model reviews the action and verifies that it does not target unrecognized external environments.19  
* **Classifier Analysis Tools:** Developers can run three utility subcommands to debug and validate custom configurations:  
  * claude auto-mode defaults: Prints the built-in system rules.19  
  * claude auto-mode config: Prints the merged configuration actually utilized by the active session.19  
  * claude auto-mode critique: Runs a model-backed evaluation of the custom rule set, outputting security feedback and identifying potential configuration gaps.19

## **7\. Quick-Start Progression Guide**

To transition from basic usage to a secure, enterprise-grade workspace, teams should follow this progressive roadmap:

                  ┌──────────────────────────────────────────────┐  
                  │          PHASE 3: ENTERPRISE PLATFORM        │  
                  │ \- Deploys Server-Managed policies.           │  
                  │ \- Implements custom Subagents in agents/.    │  
                  │ \- Connects secure workspace MCP servers.     │  
                  └───────────────────────▲──────────────────────┘  
                                          │  
                  ┌───────────────────────┴──────────────────────┐  
                  │          PHASE 2: TEAM STANDARDIZATION       │  
                  │ \- Splits CLAUDE.md into rules/ files.        │  
                  │ \- Enforces the Security Guidance Plugin.     │  
                  │ \- Commits standard settings.json configurations.│  
                  └───────────────────────▲──────────────────────┘  
                                          │  
                  ┌───────────────────────┴──────────────────────┐  
                  │          PHASE 1: WORKSPACE FOUNDATION       │  
                  │ \- Runs /init to generate CLAUDE.md (\<200 lines).│  
                  │ \- Ignores settings.local.json via git.       │  
                  │ \- Configures global settings.json defaults.  │  
                  └──────────────────────────────────────────────┘

### **Phase 1: Workspace Foundation (Entry Level)**

* **Goal:** Establish baseline guidelines and configure personal overrides.20  
* **Steps:**  
  1. Initialize the project workspace by running the interactive command /init in the repository root to generate a starter CLAUDE.md.2  
  2. Limit CLAUDE.md to under 200 lines by detailing only essential build and test execution parameters.15  
  3. Add .claude/settings.local.json to the global .gitignore to prevent personal configurations or credentials from leaking into source control.8

### **Phase 2: Team Standardization (Medium Level)**

* **Goal:** Enforce quality standards and secure team environments.4  
* **Steps:**  
  1. Split detailed guidelines out of CLAUDE.md and move them into path-scoped files in .claude/rules/ using glob patterns.15  
  2. Create a standard .claude/settings.json file, commit it to the repository, and define the team's default permission modes and approved command list.4  
  3. Require the Security Guidance Plugin (security-guidance@claude-plugins-official) in the project configuration to analyze code changes in the background.12

### **Phase 3: Enterprise Platform (Advanced Level)**

* **Goal:** Lock down environments and scale agent capabilities.8  
* **Steps:**  
  1. Define specialized subagents in .claude/agents/ to handle routine background tasks (e.g., pr-reviewers, code-janitors).17  
  2. Implement organization-wide policy controls by deploying managed settings via MDM profiles or system-level configuration files.8  
  3. Integrate custom project-scoped MCP servers via .mcp.json to securely connect the agent to internal databases, Confluence wikis, or Jira schemas.17

## **8\. Common Pitfalls and Mitigation Strategies**

The table below catalogs common errors encountered when configuring and operating Claude Code workspaces, along with their technical consequences and verified mitigations:

| Pitfall | Technical Root Cause | Systemic Consequence | Verified Mitigation Strategy |
| :---- | :---- | :---- | :---- |
| **Relying on .claudeignore** | The CLI terminal harness has no native parsing or enforcement logic for .claudeignore.9 | The agent can easily bypass the ignore list and read or write to sensitive files if prompted.9 | Implement explicit glob blocks in the permissions.deny array in settings.json.6 |
| **Bloated CLAUDE.md Files** | Project instructions exceeding 200 lines consume excess token budgets in the context window.15 | Accelerates context window saturation, triggers frequent compactions, and degrades instruction adherence.2 | Offload domain-specific rules to path-scoped files in .claude/rules/.15 |
| **Exposing Keys in settings** | Storing plain-text API credentials directly within committed project settings files.8 | Compromised credentials leak into public repositories or shared version control.5 | Use environment variable expansion (${VAR:-default}) within .mcp.json or project settings.17 |
| **Unrestricted Script Skills** | Skills containing commands with major side-effects run automatically.18 | The agent can autonomously run destructive tasks, like publishing code or deploying to production.18 | Set disable-model-invocation: true in the skill's frontmatter to limit runs to manual slash commands.18 |
| **Bypassing Local Permissions** | Configuring high-privilege permissions in repository files without administrative oversight.8 | Malicious repositories can grant themselves auto-mode or execute arbitrary code on developer machines.26 | Enforce policy controls via MDM or system-level managed configurations.8 |

## **9\. Appendix: Real-World Case Studies and Templates**

### **Case Study: Regulated FinTech Team Deployment**

A FinTech engineering department migrated 150 developers to Claude Code.13

* **The Challenge:** The organization needed to enforce strict data privacy standards, prevent modifications to production deployment files, and reduce the manual security review burden on pull requests.12  
* **The Solution:** The administration deployed file-based managed settings (managed-settings.json) across all developer workstations.8 These settings restricted direct internet access, blocked file reads of local credentials, and enforced the real-time Security Guidance Plugin globally.8  
* **The Outcome:** The real-time security plugin identified and corrected 25 vulnerability classes (such as unsafe inputs and DOM vulnerabilities) directly in developer sessions.12 This integration reduced downstream security-related comments on pull requests by **35%**, accelerating overall deployment cycles while maintaining compliance.13

### **Template: Production-Grade Project Configuration (.claude/settings.json)**

This standard configuration defines safe command lists, requires the Security Guidance Plugin, and enforces strict file boundaries 6:

JSON  
{  
  "model": "sonnet",  
  "outputStyle": "default",  
  "env": {  
    "BASH\_DEFAULT\_TIMEOUT\_MS": "300000",  
    "API\_TIMEOUT\_MS": "1200000"  
  },  
  "enabledPlugins": {  
    "security-guidance@claude-plugins-official": true  
  },  
  "permissions": {  
    "defaultMode": "acceptEdits",  
    "deny":,  
    "allow":  
  }  
}

### **Template: Reusable Validation Skill (.claude/skills/deploy-verifier/SKILL.md)**

This skill registers a /deploy-verifier command to validate build status, utilizing dynamic environment checks and positional arguments 18:

## **name: deploy-verifier description: Validates local git changes, runs verification checks, and generates a pre-deploy status report. disable-model-invocation: true user-invocable: true allowed-tools:**

# **Pre-Deployment Verification**

## **Real-Time Workspace State**

* Active workspace modifications are parsed below:  
  \!git status \-s

## **Verification Steps**

1. Parse the active workspace changes. If uncommitted changes exist, notify the developer before proceeding.  
2. Run local code quality checks and compilers:  
   Bash  
   npm run lint

3. Execute the verification suite targeting the subsystem specified in positional arguments (e.g., /deploy-verifier auth maps subsystem to $0):  
   Bash  
   npm run test:subsystem \-- \--scope=$0

4. Build the project locally to confirm stability:  
   Bash  
   npm run build

5. If all compilation and verification steps succeed, output a clean pre-deployment status report.

### **Template: Specialized Subagent Configuration (.claude/agents/pr-reviewer.md)**

This subagent template defines a read-only code reviewer, constraining its execution model and tool access to reduce API costs 17:  
name: pr-reviewer  
description: Evaluates uncommitted git modifications and drafts structural PR descriptions.  
model: haiku  
tools:  
permissionMode: plan  
memory: project  
skills:

* lint-standards

You are an expert, automated quality assurance agent.  
Your objective is to review local git modifications and compare them against the target branch. Assess code readability, structure, performance, and adherence to team guidelines.  
Output a structured Markdown summary of your code quality findings, code improvements, and a completed pull request description. You operate strictly in a read-only plan mode; do not modify files or run compilers.

## **10\. Workspace Maturity Checklist and Scorecard**

Engineering teams can evaluate their workspace configuration maturity and compliance score by assessing their setup against this checklist:  
![][image1]

### **Scorecard Metrics**

\[  \] (10 pts) The primary project 'CLAUDE.md' is documented, accurate, and kept strictly   
              under 200 lines.   
\[  \] (10 pts) '.claude/settings.local.json' is configured, gitignored, and active.   
\[  \] (15 pts) Path-scoped rules in 'rules/' are used to lazy-load domain-specific   
              instructions. \[3\]  
\[  \] (15 pts) The Security Guidance Plugin is active, verified, and required in project   
              settings.   
\[  \] (10 pts) Sensitive keys and.env files are blocked via the 'permissions.deny' array   
              in 'settings.json'. \[6\]  
\[  \] (15 pts) Custom skills use YAML frontmatter permissions and resolve relative paths   
              via ${CLAUDE\_SKILL\_DIR}.   
\[  \] (10 pts) Custom subagents run with restricted tool sets in 'plan' or 'acceptEdits'   
              permission modes.   
\[  \] (15 pts) Centralized MDM profiles or system configuration files enforce standard   
              workspace policies globally. 

### **Maturity Classifications**

* **Level 1: Foundational Workspace** (Score: ![][image2] points) The project uses basic instructions and personal overrides. The workspace lacks automated guardrails and is subject to context saturation and permission prompts.20  
* **Level 2: Standardized Team Workspace** (Score: ![][image3] points) The workspace uses modular rules and committed team settings.4 Real-time security scanning is active, and common workflow permissions are standardized.12  
* **Level 3: Governed Enterprise Platform** (Score: ![][image4] points) The environment is managed via MDM profiles.8 The agent uses specialized custom subagents and project-scoped MCP servers to scale automated workflows.17 Hard boundaries are enforced, protecting local systems and enterprise data.6

#### **Works cited**

1. Overview \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview)  
2. How Claude Code works \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works)  
3. Use Claude Code features in the SDK, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/claude-code-features](https://code.claude.com/docs/en/agent-sdk/claude-code-features)  
4. Anatomy of the .claude Folder \- Every File Explained (2026 ..., accessed May 29, 2026, [https://codewithmukesh.com/blog/anatomy-of-the-claude-folder/](https://codewithmukesh.com/blog/anatomy-of-the-claude-folder/)  
5. Security \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/security](https://code.claude.com/docs/en/security)  
6. Setting up Claude Code for success \- DEV Community, accessed May 29, 2026, [https://dev.to/mrpercival/setting-up-claude-code-for-success-4g73](https://dev.to/mrpercival/setting-up-claude-code-for-success-4g73)  
7. Using Claude Code More Intentionally | Viget, accessed May 29, 2026, [https://www.viget.com/articles/using-claude-code-intentionally](https://www.viget.com/articles/using-claude-code-intentionally)  
8. Claude Code settings \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings)  
9. \[BUG\] .claudeignore does not prevent Claude from reading ignored files \#36163 \- GitHub, accessed May 29, 2026, [https://github.com/anthropics/claude-code/issues/36163](https://github.com/anthropics/claude-code/issues/36163)  
10. Constraining Claude? | by Martin Larsson | Kantega \- Medium, accessed May 29, 2026, [https://medium.com/kantega/constraining-claude-514a7eed9fc7](https://medium.com/kantega/constraining-claude-514a7eed9fc7)  
11. Configure server-managed settings \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/server-managed-settings](https://code.claude.com/docs/en/server-managed-settings)  
12. Catch security issues as Claude writes code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/security-guidance](https://code.claude.com/docs/en/security-guidance)  
13. Anthropic Launches Free Claude Code Security Plugin \- AI Weekly, accessed May 29, 2026, [https://aiweekly.co/alerts/anthropic-launches-free-claude-code-security-plugin](https://aiweekly.co/alerts/anthropic-launches-free-claude-code-security-plugin)  
14. Getting Started with the Claude Code Security Plugin: Check 25 High-Risk Vulnerability Types While You Code, and How the Three-Layer Review Works, accessed May 29, 2026, [https://claudeapi.com/en/blog/dev-guides/claude-code-security-guidance-plugin-2026/](https://claudeapi.com/en/blog/dev-guides/claude-code-security-guidance-plugin-2026/)  
15. How Claude remembers your project \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)  
16. Extend Claude Code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)  
17. Create custom subagents \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)  
18. Extend Claude with skills \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)  
19. Configure auto mode \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/auto-mode-config](https://code.claude.com/docs/en/auto-mode-config)  
20. Beginner here, can someone explain the ideal file structure for Claude Code? : r/ClaudeCode \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1sqvkoc/beginner\_here\_can\_someone\_explain\_the\_ideal\_file/](https://www.reddit.com/r/ClaudeCode/comments/1sqvkoc/beginner_here_can_someone_explain_the_ideal_file/)  
21. Model configuration \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/model-config](https://code.claude.com/docs/en/model-config)  
22. Glossary \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/glossary](https://code.claude.com/docs/en/glossary)  
23. Mejores prácticas para Claude Code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/es/best-practices](https://code.claude.com/docs/es/best-practices)  
24. Plugins in the SDK \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/plugins](https://code.claude.com/docs/en/agent-sdk/plugins)  
25. Beginner here, can someone explain the ideal file structure for Claude Code? \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeAI/comments/1spqnwq/beginner\_here\_can\_someone\_explain\_the\_ideal\_file/](https://www.reddit.com/r/ClaudeAI/comments/1spqnwq/beginner_here_can_someone_explain_the_ideal_file/)  
26. Managing Project Context | CodeSignal Learn, accessed May 29, 2026, [https://codesignal.com/learn/courses/customizing-claude-code-for-your-projects/lessons/managing-project-context](https://codesignal.com/learn/courses/customizing-claude-code-for-your-projects/lessons/managing-project-context)

[image1]: <data:image/png;base64,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>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAACNklEQVR4Xu2WsUscQRjFPwmCEjWKNoKCiJgIioqpLMRCDDZB0CJomSIhCCKCtoYgqGCT0koRwX/AShEhnXYWNlFEkaQKosQmIOY9vl2dXXfWPff2DGEe/OD2u7m5N29mZ0bEycnJKTc1gHfhoqGXYAEsgRFQGvy6IKoA46IePoNmUBRoocrZawv4BLbBNVgJfn2rIXAAOkAZ+AI2wQuzUcZqBzugF1SBD+APmJRgGI/yyiAGQTc4k+gg6sF3MGrUaGQPjBm1rPVVdLLees++h1+i46BSe60FJxIdBDu9Al1GjTOwJjpDTL0QWgQ34L33XA6+gUvR1UKl9hoXBGci3DnFtj9BY6ielYpBDXjmPbeCcwkOMLXXuCBYs3UeVS+EuGlylk9F9wJfNk+2+j3ZgmDSOxLdSeLO86jnYF00gCPwRu5WSF682oLgH29JdCcPdV4EqkX7TkKJ/iyxXoEfYFXUZxqvt7IFQdk6sdV9VYI50bM8CQP6s8Ri0Hw9uIF+9Go2T7b6PcUFMSvRnbAtj9y6UD0LcaOc8OBnX9OiQfi+U3uNC4LnNs/vPqPGZbzhkeuSfow4MA4wPEj6ZRA8LajUXv0guNS45EzxPd8FM0atSTThuCt5PuVflJbl7obo++IR2hmqzXjPVCKvTI6NmCKTJb/BPmgz2r0Gx2AKDIve1OYluEyzFveQQ9H/5aA4wxde3VTmXrkr94teyTlDTyEu7V7RAfaIfXD/glcnJycnJ6f/VX8BTTua4GX0OSQAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEIAAAAZCAYAAACFHfjcAAACaElEQVR4Xu2WTYiNURjH/0KR70ykaHaiFFKjmdCsMGmkEMVGFmQjKdMs7VhIDaVQvppGRllZjZopC0VZ2aGQ7GZEKZGP/79znrnnPe+9rt47TpPOr35133POfd/nPvc5z3uATCaT+TsW0pP0Kj1LV9MZhRXAftpF5/u5ZfQw3RAu+sfspLfpOroicjmd7ddVinU9HaPddAk9Rr/R06glYxa9R39FDtNFfk0K+lCOwRyna9FCrAP0B93tr5WMZ6jd2LhOX9B39D7dRWcG8ylQDA/gKte8Rt/QM6j9cZVivQCXsaP+egF9TD/DVYtxiW4KrlOjMr9C26LxzfQOnRuMVYpV+0o3t4xp/32E2y56uFHp5lOIfqh+tErf0N7XP94ejImWY1XTHIQrqbixXKYX6XP6nj6hGwsr0qKEaFsfiCfQQqzz6F24BLymO1DeUzdofzCuLjxBOyZXpGUrHUH9Bjglsa6hH+D2nRJkqHeEyVkJl+0hFMs1RM1rKcqvukbOcV9rip6n56oi6lEl1hIKXttDDfR4NBeiwN/CVZDe4fVYTM+h2OX/ZI/7WlOsjx2KJxrQNFY1ylNeO4wIe1/f8tdH6E8UE2M3l/qcEp11FF9vPIGKsaqzfvGGXVYJ0IOs9Cwx4c2t3MZQfLukQOeE73RLPIGKsa6iL+lN1JqO9vRTuNKzTtsJ14nDqlG3/kr3BmMpUB95iPKfZ1SOVfvyFT1PD8I95JMfN9Q3dOQehTt4qVJ08jzh51KiBv4IjRPRUqzKcjfdR7ehmM0QVdAeuh31X1up0AFK2yJ+xYdMl1gzmUwmk/kf+Q31GZNbjIm2UQAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAE0AAAAZCAYAAAB0FqNRAAACvklEQVR4Xu2XT6hOQRjGn5sUkT9JUsSViIjCgoWVlIWbuoqQrZKdIlZKCksbZWdhq6RbQtyo2+1a6CoUSqSs7Ngo8Tzeme/MGWfON8V3SPOrp/udd+ad885z55yZAxQKhcL/yWzqEHWNukytp4ZqPYy1sHb1U3/l/S1WUgfjYEBOrfG8lZPFfOomdZRaSm2iHlEnUTdulHpBbabmUuepe7D8rlhHHaceUN+o6/XmHjm16rdialMf9VWOcvtygjobxTZQT6lhd72cek0d7vUAFlJPYPldIdP2UTuoD2g2LbfW0y6mNo9yXlJLglgjuvEl1FeVVpxM06oTGuwLtaXXw/rfoMZh/6kuUX3v0GxaTq3exDh/G/WZGoniv3CB+k5doea42AFqDJUZaosLEbrpR2pVFB80babl1KoV+8nFQpSjXHnSygrqFcy4N7CExy7u0eCpQprig6bNtFRNYdybE+en4o3I+fcw4yQlzXNtWm3j6F9Il6RMy611L6p5hmSbtgy2so7BdlAlacAJahHskb3v4m2FNDEEG0OTzNEsS+tLyrTcWvfgN0zTOeU2bCfxyMRbsEH9bpMyJxX3LKAuws5BOdJkckiZJlI1hfGUOal4De2Oep/p8QyRmXdQJes9lypEW7+M7pI203Jq1WagTSHO96bFR7Aa6qQDXdPup0TtREJbsA6Tu6rmn4/SmFPuY/WnaDMtp1b/7otrV85X9zeJku9SZ1A/py2GDbrdXeu9NEWdc9diNew/1/YpMyi8aTp7hXWL3FqPwDa/YXetcfR1MImMrxwNOA0zTwdDrbDnsE0hLGgr9ZY6Re2HHQ51KJ4Z9Bk0WgGavFaS3+l1GH1GbQz65dSq31eph7CvDBmmeetzKosZsEdVN9iN6pAbo7jadRN9rvzL5NSqRbEGNu+d6HYBFAqFQqFQKKT4AQoxxDigdkwxAAAAAElFTkSuQmCC>