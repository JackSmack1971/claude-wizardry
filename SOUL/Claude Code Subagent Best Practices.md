# **Architecture and Orchestration of Claude Code Subagents: A Comprehensive Guide to Subagent Design, Configuration, and Orchestration**

## **Executive Summary of Subagent Optimization**

In complex software engineering workflows, standard single-agent sessions encounter performance degradation as the conversation history expands.1 The Claude Code CLI addresses this constraint by introducing subagents—isolated execution threads that run their own agentic loop in separate context windows and report structured summaries back to the parent session.2 This architecture preserves the primary session context, allows concurrent operations, and enforces strict security and tool constraints.2  
The following table synthesizes the fundamental engineering practices required to design, deploy, and maintain high-performing subagent systems within the Claude Code harness.

| Practice | Core Mechanism | Impact Metric | Primary Application |
| :---- | :---- | :---- | :---- |
| **Context Boundary Isolation** | Delegation of noisy, search-heavy, or exploratory tasks to dedicated subagent contexts.2 | Reduces primary session context accumulation by up to 90%.2 | Codebase search, multi-file inspection, test-execution triage.6 |
| **Strict Model Tiering** | Binding cheap, fast models (Haiku) to routine tasks and premium models (Sonnet/Opus) to complex tasks.8 | Lowers overall execution costs while optimizing token allocation.9 | Static code analysis (Haiku) vs. architectural refactoring (Opus).6 |
| **Action-Oriented Descriptions** | Writing precise intent-classification triggers in the subagent's frontmatter description.2 | Prevents misrouting and ensures deterministic auto-triggering.2 | Seamless integration with the parent agent's autonomous task planner.2 |
| **Least Privilege Tool Gating** | Constraining tool lists in the frontmatter (tools and disallowedTools).5 | Eliminates accidental file mutation and unauthorized command execution.8 | Creating read-only research specialists or sandboxed test runners.2 |
| **Directory-Specific Rule Scoping** | Organizing rules and subagent configurations into recursive project folders.5 | Ensures context-relevant instructions load dynamically.5 | Large monorepos with diverse multi-language microservices.5 |
| **Subagent Memory Persistence** | Leveraging the memory field to store learned patterns in siloed directory structures.5 | Builds long-term specialized expertise without polluting project-level configurations.13 | Maintaining distinct build, debugging, and testing notes per agent.13 |
| **Deterministic Hook Automation** | Triggering pre-tool and post-tool validation hooks at key points in the execution loop.6 | Guarantees compliance with structural, formatting, and linting standards.6 | Automated pre-commit formatting and destructive command blocking.6 |
| **Isolated Worktree Execution** | Setting isolation: worktree in frontmatter to branch tasks in temporary Git directories.5 | Eliminates parallel edit collisions and dirty workspace states.18 | Simultaneous implementation of independent features.18 |
| **Plan Mode Pre-Flighting** | Forcing subagents to output structural plans for approval before code modification.12 | Prevents wasted context loops and incorrect architectural assumptions.6 | Refactoring complex, multi-file database or routing layers.6 |

## **Subagent Design, File Architecture, and Syntax**

### **System Architecture and Recursive Discovery**

Claude Code scans for custom subagents recursively, allowing organizations to structure specialized directories without altering how agents are identified.5 Subagent discovery begins at the current working directory and walks up the directory tree to the repository root.5 While directories such as .claude/agents/review/ or .claude/agents/research/ can be created to organize files logically, the CLI identifies subagents exclusively by the name field in their YAML frontmatter, ignoring the physical filename or path.5  
Filesystem-based subagents are defined as Markdown files (.md).2 Naming conventions dictate that filenames should be written in lowercase, using hyphens instead of spaces to delineate words.20 Standard patterns include naming files according to their organizational roles, such as data-analyst.md, tech-writer.md, or growth-pm.md.20

### **YAML Frontmatter Configuration Schema**

The YAML frontmatter block of a custom subagent dictates its execution parameters, tool accessibility, and model overrides, while the subsequent Markdown body acts as the static system prompt loaded directly into the subagent's execution environment.5  
The following table details the schema fields supported within Claude Code's frontmatter parser.

| Field | Type | Required | Default | Description / Structural Constraints |
| :---- | :---- | :---- | :---- | :---- |
| **name** | String | Yes | N/A | Unique identifier using lowercase letters and hyphens.5 Used in SendMessage calls and system routing.5 |
| **description** | String | Yes | N/A | Semantic trigger text used by the parent agent to evaluate whether to delegate tasks.4 |
| **model** | String | No | inherit | Overrides the active LLM. Supports sonnet, opus, haiku, or full model IDs (e.g., claude-opus-4-8).5 |
| **permissionMode** | String | No | default | Set execution mode: default, acceptEdits, auto, dontAsk, bypassPermissions, or plan.5 |
| **tools** | Array | No | Inherited | Explicit whitelist of permitted tools.5 If omitted, inherits all tools from the parent.2 |
| **disallowedTools** | Array | No | Empty | Explicit blacklist of tools. Takes precedence over the tools whitelist.5 |
| **skills** | Array | No | Empty | Array of custom skill identifiers to preload into the subagent's system prompt at startup.5 |
| **mcpServers** | Map | No | Empty | Inline MCP server configurations or references to configured servers (e.g., "slack").5 |
| **hooks** | Map | No | Empty | Lifecycle hooks (e.g., PreToolUse, PostToolUse) scoped specifically to this subagent.5 |
| **memory** | String | No | None | Context persistence scope. Accepts user, project, or local to enable automatic memory directories.5 |
| **background** | Boolean | No | false | When true, forces the subagent to run asynchronously as a background task without blocking.5 |
| **effort** | String | No | Inherited | Configures reasoning token allocation. Accepts low, medium, high, xhigh, or max.2 |
| **isolation** | String | No | None | Set to worktree to spin up an isolated Git worktree for the subagent's file operations.5 |
| **maxTurns** | Integer | No | None | Safety cutoff limiting the number of tool execution cycles in the subagent's agentic loop.5 |
| **color** | String | No | None | Display color in the terminal interface (red, blue, green, yellow, purple, etc.).5 |
| **initialPrompt** | String | No | None | Default user prompt submitted automatically when the subagent is executed as the primary session agent.5 |

### **Context Isolation Paradigms: Forking vs. Sharing**

A core property driving subagent utility is the context option within the frontmatter 8:

* **context: fork**: This configuration creates a transactional, read-only copy of the parent session's conversation history on startup.8 While the subagent can analyze prior statements, any tool execution, research exploration, or validation steps remain completely isolated.8 The parent's session remains unpolluted, receiving only the subagent's final output.2 This is the ideal configuration for executing parallel, exploratory research, running test runs that emit heavy log files, or evaluating competing architectural hypotheses.8  
* **context: default (Shared)**: In this configuration, the subagent shares its context directly with the parent session.8 It can observe and modify the global conversation history in real-time, functioning as an active participant rather than an isolated worker.8 This mode is reserved for deep integrations where the subagent must sequentially build on the primary agent's state or dynamically adjust global variables.8

### **Production-Grade Subagent Configurations**

#### **Pre-Commit Quality Engineer**

This read-only specialist operates under strict tool constraints, ensuring it cannot modify files and only returns validation summaries.12  
name: "quality-engineer"  
description: "Validates changed files, imports, and style rules, and runs tests before a Git commit is executed."  
model: "haiku"  
effort: "low"  
permissionMode: "plan"  
tools:

* Read  
* Grep  
* Glob  
* Bash  
  disallowedTools:  
* Write  
* Edit  
* NotebookEdit  
  color: "purple"

You are a Quality Engineer subagent. Your function is strictly analytical and veridical; you are restricted from modifying the codebase.

## **Execution Protocol**

1. Query changed files by executing the following local command:  
   git diff \--name-only \--cached  
2. Inspect each modified file to verify:  
   * All external imports resolve correctly.  
   * No debug statements (e.g., console.log, print, or debugger) remain in production code pathways.  
   * All exported modules contain comprehensive documentation blocks.  
3. Run the project's verification suite:  
   * Identify the appropriate test suite command in package.json or CLAUDE.md.  
   * Run the tests in a single non-interactive pass.  
4. Synthesize the findings into a structured report using the following markdown format:  
   * **Status**:  
   * **Issues Identified**: Listed by severity (Critical, Warning, Style).  
   * **Evidence**: Provide exact line numbers and error logs.

If any test fails or validation rules are violated, explicitly recommend blocking the commit process.

#### **Security Auditor**

This specialist leverages Sonnet or Opus for deep reasoning and matches codebase patterns against known security vulnerabilities.8  
name: "security-auditor"  
description: "Scans the codebase for vulnerabilities, credentials leaks, and OWASP Top 10 violations."  
model: "sonnet"  
effort: "high"  
permissionMode: "default"  
tools:

* Read  
* Grep  
* Glob  
* Bash  
  disallowedTools:  
* Write  
* Edit  
  memory: "project"  
  color: "red"

You are an expert Security Auditor subagent. Your objective is to detect vulnerabilities, weak cryptographic patterns, and exposed secrets.

## **Vulnerability Check Matrix**

* **Injection Attacks**: Search for unparameterized database queries, dynamic shell executions, and DOM-based XSS vectors.  
* **Secrets Exposure**: Identify hardcoded API keys, bearer tokens, private keys, or credentials stored in configuration files.  
* **Authentication**: Inspect middleware configurations, JWT verification steps, and CORS headers.  
* **Data Privacy**: Ensure personally identifiable information (PII) is encrypted and not written to system logs.

## **Static Analysis Protocol**

1. Leverage Grep and Glob to search for common vulnerable patterns:  
   * DB queries constructed via string interpolation.  
   * Usage of insecure hashing functions (e.g., MD5, SHA1) for secure data.  
2. Structure all findings in a markdown table containing:  
   * **Vulnerability Type**  
   * **Risk Level**: (Critical / High / Medium / Low)  
   * **Location**: (File path and line numbers)  
   * **Mitigation Strategy**: Step-by-step remediation plan with secure code templates.

Maintain a highly objective, risk-focused tone. Do not attempt to refactor the code directly; focus entirely on static identification.

## **Structural Placements, Security Boundaries, and Resource Optimization**

### **Global vs. Project-Specific Placements**

Claude Code manages configuration scopes across multiple layers of the file system, ensuring a balance between developer-specific toolkits and team-wide standards.5  
The following table compares the operational paradigms of global and project-specific subagent placements.

| Dimension | Global Scope (\~/.claude/agents/) | Project Scope (.claude/agents/) |
| :---- | :---- | :---- |
| **Storage Location** | User's home directory.5 | Root directory of the Git repository.5 |
| **Audience & Access** | Individual developer across all local repositories.5 | All team members contributing to the repository.5 |
| **Git Management** | Typically ignored or stored in a global dotfiles repository. | Committed to version control for collaborative maintenance.5 |
| **Precedence Layer** | Evaluated as a fallback. Project agents override global agents with the same name. | Takes precedence over global configurations.5 |
| **Best Suited For** | Generic developer utilities (e.g., personal PR summary writing, repo navigation).6 | Codebase-specific architectures (e.g., customized testing routines, internal API auditors).5 |

### **Least Privilege Tool Gating and Restricted Tools**

To limit security exposure and optimize execution paths, developers should restrict subagent access to tools.7 By defining tool limits inside frontmatter, the model's context footprint is reduced, as unnecessary tool schemas are omitted from the initial prompt.7 Whitelisting is configured using tools (or allowedTools in some API contexts), which forces the subagent to utilize only the listed tools.5 Blacklisting is configured with disallowedTools, which explicitly blocks specific tools.5 If both are configured, disallowedTools takes precedence, and any tool listed in both arrays is removed.11  
The renaming of the primary execution tool in Claude Code v2.1.63 is a key architectural detail: the tool formerly called Task was renamed to Agent.2 During programmatic execution, the SDK emits Agent in tool-use blocks but retains Task in the system:init initialization list and inside the result.permission\_denials.tool\_name property.2 For proper compatibility across SDK versions, client-side tools validation logic must check both Task and Agent designations.2  
To prevent infinite loops and state instability, several critical session tools are locked at the CLI harness level and are completely unavailable to subagents, regardless of the whitelist configuration 5:

* **Agent**: Subagents cannot spawn their own subagents; they cannot contain the Agent tool in their tools array.2  
* **AskUserQuestion**: Subagents must complete their tasks autonomously and cannot prompt the terminal for user clarification.5  
* **EnterPlanMode / ExitPlanMode**: Mode switching is prohibited within subagent scopes, unless the subagent's permissionMode is explicitly configured to plan.5  
* **ScheduleWakeup**: Routine rescheduling is restricted to the primary supervisor process.5  
* **WaitForMcpServers**: Connection handshakes are managed globally by the primary runtime.5

### **Model Tiering, Cost Optimization, and Performance Modeling**

Model selection inside the frontmatter allows developers to implement tiering.9  
Claude Code resolves the active model for any subagent invocation using the following strict precedence hierarchy 5:

1. The CLAUDE\_CODE\_SUBAGENT\_MODEL environment variable (if set).5  
2. The per-invocation model parameter passed during programmatic dispatch.5  
3. The model field specified in the subagent's YAML frontmatter.5  
4. The model currently running in the parent conversation session.5

Using separate execution threads incurs a setup cost, which can be modeled analytically. Let the total token consumption of a multi-agent invocation be represented by ![][image1]:  
![][image2]  
where ![][image3] is the number of spawned subagents, ![][image4] represents the base token cost of preloading the subagent's system prompt and project-level context, and ![][image5] is the cost of the subagent's tool-use steps.  
Because subagents run in isolated context windows, they can easily multiply token usage if delegated simple, short tasks.4 However, for high-context exploration tasks, subagents deliver savings. Let the context savings ratio ![][image6] be defined as:  
![][image7]  
where ![][image8] is the final condensed summary returned verbatim to the parent session, and ![][image9] represents the total volume of file reads, command outputs, and logs processed by the subagent.2  
Additionally, utilizing the ENABLE\_TOOL\_SEARCH environment variable dynamically loads only the tool schemas required for a task.6 This reduces initial context footprints through the following optimization ratio:  
![][image10]  
This configuration yields an average context footprint reduction of up to 85%.6

### **Security Guardrails and Context Boundaries**

Deploying autonomous agents requires security controls.23 Security boundaries are maintained through isolation, permission inheritance, and proxy layers.23

#### **Permission Mode Inheritance**

When the primary session launches in a loose permission mode—such as bypassPermissions, acceptEdits, or auto—all spawned subagents inherit this mode.24 Subagents cannot downgrade their permissions.24 Because a subagent may run a highly specialized system prompt with direct terminal access, inheriting bypassPermissions grants the subagent full system access without any interactive confirmation prompts.24 To mitigate this, developers should use disallowedTools: or similar blacklists in the subagent's frontmatter to block system commands, or avoid using the bypassPermissions flag entirely in sensitive environments.24 Additionally, plugin-supplied subagents are stripped of hooks, mcpServers, and permissionMode parameters on startup to prevent malicious privilege escalation.5

#### **Container Isolation and Secure Network Architectures**

To defend against prompt injection (where malicious instructions are embedded in untrusted source files or web pages processed by a subagent), organizations should deploy Claude Code within isolated container sandboxes.23 By launching the container with \--network none, all standard network interfaces are disabled.23 External resources can only be reached through a mounted Unix socket connected to an external proxy server running on the host system.23 This proxy (e.g., Envoy, Squid, or mitmproxy) intercepts all traffic, logs outgoing requests, enforces a strict domain allowlist, and injects API credentials.23 Consequently, subagents can query external services without exposing credentials directly within the agentic execution space.23

## **Inter-Component Integration and Advanced Coordination Patterns**

### **Inter-Component Integration Map**

Claude Code's custom subagents do not operate in isolation; they integrate with other filesystem configurations located inside the .claude/ directory.16  
The following table maps the structural relationships between subagents and other CLI components.

| Component | Filesystem Path | Integration with Subagents | Precedence / Resolution Order |
| :---- | :---- | :---- | :---- |
| **CLAUDE.md** | ./CLAUDE.md or .claude/CLAUDE.md | Contains project conventions, styling rules, and commands.17 Read by subagents on startup.2 | Takes precedence over subagent system prompts if guidelines conflict.12 Built-in agents like Explore skip it.5 |
| **Path Rules** | .claude/rules/\*.md | Path-specific instructions loaded dynamically when the agent accesses specific directories.14 | Active only when matching file paths are accessed by the subagent.6 |
| **Skills** | .claude/skills/ | On-demand directories containing domain knowledge and checklists.12 | Preloaded via the subagent's skills frontmatter field, injecting the full instruction set.3 |
| **Commands** | .claude/commands/ | On-demand slash commands triggered manually by the user (e.g., /project:review).12 | Executed manually; commands can configure steps that programmatically invoke a subagent.8 |
| **Settings** | .claude/settings.json | Stores global permissions, hooks, disallowed tools, and default models.21 | Global security rules in settings.json override subagent-level tools.11 |

### **Priority-Based Memory Hierarchy**

Claude Code processes instruction overrides through a priority hierarchy, where company policies override project and user rules.22

| Priority | Memory Level | Storage Location | Scope & Behavior |
| :---- | :---- | :---- | :---- |
| **1 (Highest)** | Managed Policy | /Library/... (macOS), /etc/... (Linux/WSL), C:\\Program Files\\... (Windows).22 | System-wide, organization-enforced standards.22 |
| **1.5** | Managed Drop-ins | /managed-settings.d/\*.md alongside policies.22 | Modular drop-in files merged alphabetically (v2.1.83+).22 |
| **2** | Project Memory | ./CLAUDE.md or ./.claude/CLAUDE.md.22 | Shared project standard committed to Git version control.21 |
| **3** | Project Rules | ./.claude/rules/\*.md.22 | Path-specific, modular rules checked into Git.21 |
| **4** | User Memory | \~/.claude/CLAUDE.md.22 | Personal user-level rules applied across all local projects.21 |
| **5** | User Rules | \~/.claude/rules/\*.md.22 | Personal user-level modular rules applied globally.21 |
| **6** | Project Local | ./CLAUDE.local.md.22 | Git-ignored, developer-specific project configurations.22 |
| **7 (Lowest)** | Auto Memory | \~/.claude/projects/\<project\>/memory/.22 | Stored in MEMORY.md; contains notes Claude writes.14 |

## **Path-scoped rules within ./.claude/rules/ are loaded on demand by defining specific file matchers inside the YAML frontmatter of the rule file**

6:  
paths:

* "src/api//\*.ts"  
* "packages/core//\*.ts"

# **TypeScript API Conventions**

* Always write explicit return types for exported functions.  
* Never utilize the any keyword; use unknown for unstructured payloads. This configuration ensures these rule payloads are loaded into the subagent's context window only when files matching the target paths are accessed during execution, preventing unnecessary context bloat.6

### **Description-Driven Auto-Triggering**

The description field in the subagent's frontmatter serves as a classification prompt for the parent agent's routing mechanism.2 When the user submits a task, the parent agent matches the prompt against the descriptions of all registered subagents.2 If a match is detected, the parent delegates the work via the Agent tool.2  
To ensure reliable routing, descriptions should be structured in a "Triage Rule" format:  
*"Use this subagent when. It returns after performing \[Action Verb\] in."* 4  
If the system performs a task directly instead of delegating to a custom subagent, engineers can use explicit prompting 2: prefixing the prompt with the subagent's name (e.g., "Use the quality-engineer agent to...") bypasses the auto-trigger classifier and launches the target subagent immediately.2

### **Comparison: Subagents vs. Agent Teams**

With the release of CLAUDE\_CODE\_EXPERIMENTAL\_AGENT\_TEAMS=1, Claude Code introduces coordinated multi-agent orchestration.16 This feature differs from the standard hierarchical subagent model.3  
The following table compares these two multi-agent execution paradigms.

| Structural Dimension | Subagent Paradigm | Agent Teams Paradigm (Experimental) |
| :---- | :---- | :---- |
| **Control Topology** | Strict parent-child hierarchy. The parent spawns a subagent, waits for completion, and receives its final response verbatim.2 | Peer-to-peer coordination. A lead agent manages a shared task list and coordinates multiple active teammates.25 |
| **Communication Flow** | Subagents report back only to the parent; they cannot see or communicate with other subagents.3 | Teammates share a common messaging channel and can message each other directly via SendMessage.25 |
| **Context Boundaries** | Each subagent starts with a fresh context window. The parent must pass all context in the task prompt.2 | Fully independent context windows. Teammates can resolve dependencies and negotiate tasks dynamically.25 |
| **User Interaction** | The user interacts exclusively with the parent session.25 | The user can attach to and interact with individual teammates directly.25 |
| **Token Cost Profile** | Moderate. Context is compressed and summarized before returning to the parent.3 | High. Peer-to-peer messaging and shared task updates require frequent round-trips to the LLM.9 |
| **Execution Surface** | Runs in-process or in a temporary workspace within the parent session.5 | Often requires tmux multiplexing or split-terminal panes to display active teammates.25 |

When running agent teams, subagents can be configured as teammates.25 However, a key limitation applies: the skills and mcpServers frontmatter fields defined in a subagent's configuration are ignored when that subagent runs as an active team member.25 Teammates instead load skills and MCP configurations globally from the project and user settings files, aligning their execution environments with standard session variables.25

### **Subagent Memory Protocols**

By default, subagent executions are transactional; once the subagent returns its summary, its execution container and memory are destroyed.4 To enable long-term learning across sessions, engineers can configure the memory field inside the YAML frontmatter, choosing between user, project, or local scopes 5:

* **User Memory Scope**: Writes learnings globally to \~/.claude/agent-memory/\<name\>/MEMORY.md.13  
* **Project Memory Scope**: Stores repository-specific patterns in .claude/agent-memory/\<name\>/MEMORY.md.13  
* **Local Memory Scope**: Restricts learning files to the local checkout.5

When the memory field is set, the CLI preloads the first 200 lines (or 25 KB) of the corresponding MEMORY.md file directly into the subagent's system prompt on startup.13 The subagent is granted read/write permissions to this directory, allowing it to record debugging patterns, build commands, and successful fixes over time.13  
This persistence model differs from the session context compaction process.16 When the main session context limit is approached, conversational history is summarized.16 However, the project-root CLAUDE.md, path rules, and subagent memory files survive compaction intact, reloading from disk to preserve essential guidelines.16

## **Quick-Start Checklist and Maintenance Protocols**

### **Step-by-Step Custom Agent Creation Workflow**

To deploy a custom subagent, developers should follow this step-by-step procedure:

1. **Access the Configuration Directory**: Navigate to the repository root. Ensure hidden files are visible within the OS shell.20  
   * **macOS**: Execute mkdir \-p.claude/agents inside the terminal, or press Cmd \+ Shift \+. to reveal hidden files in Finder.20  
   * **Windows**: Use File Explorer, verify "Hidden items" is enabled in the View settings, and create .claude/agents.20  
2. **Initialize the Configuration File**: Create a new Markdown file using lowercase, hyphen-delimited names (e.g., performance-profiler.md).20  
3. **Configure YAML Frontmatter**: Construct the frontmatter block at the top of the file.8 Ensure the name uses lowercase hyphenated letters and matches the filename for clarity.5  
4. **Define the System Prompt**: Below the closing frontmatter delimiter (---), write the agentic guidelines using clear Markdown syntax.6 Specify role expectations, step-by-step verification protocols, and structured output formatting templates.6  
5. **Verify Registration**: Start or restart the Claude Code session by running claude in the terminal.5 Execute the /agents command to open the subagent management interface.5 Verify that the custom agent is listed in the Library tab and its metadata matches the frontmatter settings.5  
6. **Execute Validation Test**: Test the subagent's execution and output formatting by running a targeted prompt: claude "Use the performance-profiler agent to inspect slow queries in the db layer.".2

### **Maintenance Protocols and Configuration Health**

To prevent configuration drift and ensure subagents operate efficiently, organizations should implement the following maintenance protocols:

#### **Trimming CLAUDE.md**

CLAUDE.md is loaded at the start of every session.14 If it exceeds 150 to 200 lines, it can degrade system performance and dilute instructions.6 To prevent this, developers should offload specialized workflows, database schemas, and API documentation into distinct custom skills inside .claude/skills/.3 This ensures instructions are only loaded when matched semantically, keeping the primary context window lean.3

#### **Purging Session State**

Over time, cached transcripts, auto-memory logs, and session-specific temporary files can accumulate, leading to performance degradation.21 Developers can run the following cleanup command to purge all local state associated with a project: claude project purge.21  
This purges all stored session transcripts, resets auto-memory directories, cleans up the local cache, and removes the project's tracking entry from the global settings file \~/.claude.json.21

## **Common Pitfalls and Mitigation Strategies**

### **Pitfall 1: Over-Spawning on Trivial Tasks**

* **Analysis**: Spawning a subagent introduces system-level orchestration overhead, which includes starting an isolated container or virtual machine, checking local Git states, and compiling the subagent's prompt and tools.4 Utilizing subagents for minor tasks (e.g., single-line edits or simple file searches) consumes more time and tokens than executing the task sequentially within the primary thread.4  
* **Mitigation**: Reserve subagents for high-context or multi-file research tasks.4 Perform simple edits directly within the main conversation.28 Define explicit delegation rules to prevent automatic handoffs for minor edits.28

### **Pitfall 2: Persona and Role Overlap**

* **Analysis**: Creating multiple subagents with overlapping definitions (e.g., having both a "security expert" and a "vulnerability scanner") introduces routing ambiguities.12 When processing requests, the parent agent's routing mechanism may route tasks inconsistently, leading to duplicate executions or contradictory recommendations.4  
* **Mitigation**: Consolidate overlapping personas into a single specialist agent.12 Ensure each subagent has a distinct, non-overlapping description field that defines clear operational boundaries.4

### **Pitfall 3: Parallel Write Collisions on Shared Files**

* **Analysis**: Running multiple subagents concurrently to write code can lead to write collisions if those agents edit the same files or shared barrel modules (e.g., index.ts or route controllers).12 These concurrent modifications can result in merge conflicts, overwritten code, or broken compilation states.12  
* **Mitigation**: Configure isolation: worktree in the subagent's frontmatter.5 This isolates each subagent's filesystem operations within a temporary Git worktree, preventing concurrent writes to the same local checkout.18 Ensure sequential validation chains run after parallel edits are completed.12

### **Pitfall 4: Unmanaged Privilege Escalation via Loose Permission Modes**

* **Analysis**: Subagents inherit the permission mode of their parent session.24 If the parent session is started in bypassPermissions or auto mode, any spawned subagents also run with these loose permissions, bypassing approval prompts.24 This allows subagents to execute destructive bash commands or modify sensitive files without developer oversight.24  
* **Mitigation**: Restrict subagent tool access by explicitly defining a tools whitelist (tools:) and a disallowed tools blacklist (disallowedTools:) inside the frontmatter of sensitive subagents.5 Avoid starting the parent session in bypassPermissions mode unless working in a secured sandbox.23

## **Future Outlook**

### **Shift to Execution-Harness Frameworks**

The architecture of Claude Code represents a shift from static language modeling to active runtime execution engines.27 Early conversational models operated primarily as search interfaces, relying on users to copy-paste code blocks and manually validate files.1  
In contrast, the modern execution harness embeds the model directly within a system-level environment.16 This environment provides direct access to localized file operations, terminal execution, and secure sandboxing, turning the model into an active coding agent.16 Within this architecture, custom subagents function as specialized, isolated context boundaries, enabling safe, parallel work.2

### **Emerging Orchestration Paradigms**

                           Target Test Suite  
                                   |  
                                   v  
                    \+------------------------------+  
                    |  Pytest Collection Discovery |   
                    \+------------------------------+  
                                   |  
           \+-----------------------+-----------------------+  
           |                       |                       |  
           v                       v                       v  
                              
           |                       |                       |  
           v                       v                       v  
  \+-----------------+     \+-----------------+     \+-----------------+  
  | Haiku Subagent  |     | Haiku Subagent  |     | Haiku Subagent  |   
  |  (Run & Debug)  |     |  (Run & Debug)  |     |  (Run & Debug)  |  
  \+-----------------+     \+-----------------+     \+-----------------+  
           |                       |                       |  
           \+-----------------------+-----------------------+  
                                   |  
                                   v  
                    \+------------------------------+  
                    |     Synthesized JSON Maps    |   
                    \+------------------------------+  
                                   |  
                                   v  
                    \+------------------------------+  
                    |     Orchestration Lead       |  
                    | (Sonnet Mega PR Code Merge)  |   
                    \+------------------------------+

As orchestration patterns evolve, the manual delegation of subagents is being replaced by autonomous, programmatic map-reduce pipelines.30  
An example is the automated testing and healing pipeline implemented in community case studies.30 The parent agent programmatically runs a test discovery command (e.g., pytest \--collect-only) to compile a complete list of test targets.30  
For each identified test, the system maps a dedicated subagent to execute, debug, and patch the code in parallel.30 Once the subagents complete their tasks, they output structured JSON summaries.30  
A central coordinating agent then aggregates these summaries, compiles the modifications, and resolves conflicts to generate a single pull request.30 This map-reduce paradigm shows how structured multi-agent coordination can scale developer productivity.

#### **Works cited**

1. Best practices for Claude Code, accessed May 29, 2026, [https://code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)  
2. Subagents in the SDK \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/subagents](https://code.claude.com/docs/en/agent-sdk/subagents)  
3. Extend Claude Code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)  
4. Claude Code Subagents: A Practical 2026 Guide | Nimbalyst, accessed May 29, 2026, [https://nimbalyst.com/blog/claude-code-subagents-guide/](https://nimbalyst.com/blog/claude-code-subagents-guide/)  
5. Create custom subagents \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)  
6. Claude Code Subagents: How to Create, Use, and Debug Them, accessed May 29, 2026, [https://www.builder.io/blog/claude-code-subagents](https://www.builder.io/blog/claude-code-subagents)  
7. How the agent loop works \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/agent-loop](https://code.claude.com/docs/en/agent-sdk/agent-loop)  
8. custom-agent-definitions | Skills Ma... · LobeHub, accessed May 29, 2026, [https://lobehub.com/skills/laurigates-claude-plugins-custom-agent-definitions](https://lobehub.com/skills/laurigates-claude-plugins-custom-agent-definitions)  
9. Claude Code Agents In 2026: Views, Subagents, Teams & Costs \- CloudZero, accessed May 29, 2026, [https://www.cloudzero.com/blog/claude-code-agents/](https://www.cloudzero.com/blog/claude-code-agents/)  
10. Agentic Coding in Practice: Questions from our NYC Claude Code Workshop \- Turing, accessed May 29, 2026, [https://www.turing.com/blog/agentic-coding-in-practice-questions-from-claude-code-workshop](https://www.turing.com/blog/agentic-coding-in-practice-questions-from-claude-code-workshop)  
11. Tools reference \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/tools-reference](https://code.claude.com/docs/en/tools-reference)  
12. Claude Code Custom Commands: Build Your Own AI Agents, accessed May 29, 2026, [https://claudefa.st/blog/guide/agents/custom-agents](https://claudefa.st/blog/guide/agents/custom-agents)  
13. Your Claude Code Subagents Don't Share What They Learn ..., accessed May 29, 2026, [https://hindsight.vectorize.io/blog/2026/05/06/claude-code-subagents-shared-memory](https://hindsight.vectorize.io/blog/2026/05/06/claude-code-subagents-shared-memory)  
14. How Claude remembers your project \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)  
15. Agent SDK overview \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/overview](https://code.claude.com/docs/en/agent-sdk/overview)  
16. Glossary \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/glossary](https://code.claude.com/docs/en/glossary)  
17. Overview \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview)  
18. Run agents in parallel \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agents](https://code.claude.com/docs/en/agents)  
19. Choose a permission mode \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/permission-modes](https://code.claude.com/docs/en/permission-modes)  
20. Custom AI Agents for Product Reviews | Claude Code – Claude ..., accessed May 29, 2026, [https://ccforpms.com/fundamentals/custom-subagents](https://ccforpms.com/fundamentals/custom-subagents)  
21. Explore the .claude directory \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/claude-directory](https://code.claude.com/docs/en/claude-directory)  
22. claude-howto/02-memory/README.md at main \- GitHub, accessed May 29, 2026, [https://github.com/luongnv89/claude-howto/blob/main/02-memory/README.md](https://github.com/luongnv89/claude-howto/blob/main/02-memory/README.md)  
23. Securely deploying AI agents \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/secure-deployment](https://code.claude.com/docs/en/agent-sdk/secure-deployment)  
24. Configure permissions \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/permissions](https://code.claude.com/docs/en/agent-sdk/permissions)  
25. Orchestrate teams of Claude Code sessions, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-teams](https://code.claude.com/docs/en/agent-teams)  
26. Agent Skills \- Claude API Docs, accessed May 29, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)  
27. How Claude Code works \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works)  
28. Prompting best practices \- Claude API Docs, accessed May 29, 2026, [https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices](https://platform.claude.com/docs/en/build-with-claude/prompt-engineering/claude-prompting-best-practices)  
29. Claude Mythos and Cyber Security, What the Leak Actually Tells Defenders \- Penligent, accessed May 29, 2026, [https://www.penligent.ai/hackinglabs/claude-mythos-and-cyber-security-what-the-leak-actually-tells-defenders/](https://www.penligent.ai/hackinglabs/claude-mythos-and-cyber-security-what-the-leak-actually-tells-defenders/)  
30. A case study in testing with 100+ of Claude agents in parallel \- Imbue, accessed May 29, 2026, [https://imbue.com/blog/mngr\_part\_2](https://imbue.com/blog/mngr_part_2)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAaCAYAAAAue6XIAAAB8klEQVR4Xu2WzSsFYRTGj7AQN6FYsEAoNpJko3wksbBRSrETCYkssFOysFCIWCjJipBSFhb+AZIVC4lslYVYycfzdGbyeq97mxvGVfPUr3vnzLxnzj33ec+MSKBA/1MN4ArceqRRl/mvBLAINkG+c0ytglfQ7BwnglpwA6qcmO/KAVsg24hlgGPRwnKNeBrYAHlGzFfxLx2xYuXgAWyDJCPOH7EAQkbMV7WDEivWCd7AmBXPAr3yYZW4EP36DGrsE/GmSH6NS1WCJwn3629rGryAVvtENEXyqyuOrXo7GEH09oDoFPGidYmhWCZfk+h+HRTvCTkWV+SXio3mV1qiX9Qih2Be9CFClYE50YfLEEgBheAI3Ik2oNu5tlp0/HH9JEh14lRMxXrxq52wAhyIjjWqCyyJrme+PfncWXaa04bivzRrnLNzh4kz9hTci3rV5RFciN7QlJ2QG4MxV7z+XLSzXxVLpYMmMCOf19q5vy03YaboI5pdsou9BKXOd7fYYpAMRsEOKBDN40uxLKQOtIF9UZ9SfPGhp1mgWWwfKAJnTpzi5GE+ftK7P15sD9gFw6IvNOzWhOjm4qOYXWNXKXaem2wcdDjXLsvHhpsStSCtxLzX4AS0cPFPiV3gjU3xmF60xVfLkBVjp20fBwoU6C/1DggKZXJfoaoYAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,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>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABMAAAAaCAYAAABVX2cEAAABHElEQVR4XmNgGAWUAkcgfg3E/6F4BxBzIsnzAfEuJHkQXgfE3EhqUAAjEM8C4l9A/BOILVGlwSAIiNcwoFqEFQgC8UIgzmeA2DyFAWIBMigC4mg0MaxAH4j7gVgSiK8D8RMgVkSSZwHi2VB1BAHIxnQou4EB4rocuCwDgwgDxOUgHxAEfUBsDGXrAPF7ID4BxPxQMRsgngxl4wWw8ALZDgIgLy0H4n9A7AEVA7mapPBCDnCQISDDQIaCYo+s8IIBkPdA3gR514mByPACuQYUFqboEkAQwwCJiGtA3IkmhxWghxcyEGeAJBOQgUSFF8gLoKzBhS4BBQ1A/BaINdHEUYALEH9hQOQ1UBbyRlEBAaBkAsqrBMNrFIyCIQMA260zNBT6yKgAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAAAaCAYAAAAHfFpPAAACjklEQVR4Xu2XX2hOYRzHv2JFaCFDXLypKUVIazeLyGq2pFaTuFGihWK2tVrNFeVGJKW0jLQLmj+Lq7W0UC6UXAg32pIrF1aLUgrfb7/ndJ6O98/O+56bvXs+9ek953fe93nPec7v9zvPAQKBQADYSz/TL7N0n/2sOlhAb9D7NOf2xSD9Q1vc/kK6m07RBherCtbQB7TOi62gb2AXu96LL6P36AYvNudROnclYtvoDB2hi7y4JuY6Xe7F5jwddFMidpT+pX2J+Cp6EnGZVC2q/9+0KXlgPlCo/ucNO+lP/F//5bCLTtO7yQMlqKUX6fbkgTyoIV9xn5lQqP7LpR3pJ0AX8xy2PimFGvZLutntq0Gfjg+nQ81tCNnW/wGkn4BK2EKvJoOzpVT9r6UX6GXYwmkPLE11gXfoUnqcPkG8WtQEPKU99Bk9RZe4Y4Xwx8jBFmq36CH6iN6kq+li2utiW2kjfU8n3ff3IyWl6l9loZQWypBmt63YBGyhVEMfwy5c6PMFrK7FGdgF5Bs/Qpk4jHgMrTy/Is5KPaXOu22lvCZW5y5SZ5zWAG/pd1jtR/6gHxEPLA67uE6uDbY8FvrTCdgECJ2APwH+CWm8D3SjF8uHP4Z+846uc/u6EVGP0n8qW8qegDQo5XbQS7Ay6XTxtBMwBWtexah0ApRh9S6WGSdgTUYoLVWbwp8AqW1/ApQxSmuhl6sxxJNViEonQPHoBmXGOVj9qRSuIe4BemyN0mOw9wqVzidYg1Sp3IadsJbR4y5eDDVBNbLXtJU+pL9g7yFHYGPLg7SffnPfycEeh69oN6xJZ4rSSndST4uo/iP8uJ4G0R2PUHNc6cXV0AbyeBaVv2zpv3QOgUAgECjGP3Mjhz/aZHyCAAAAAElFTkSuQmCC>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAaCAYAAADhVZELAAACyElEQVR4Xu2XS8hNURTHl1DeQqEICSnv18AjIopk4lGKUCJJeVNEUoqZt8hbkkchjwEGXyYGykB5DKibiRklBlL4/1r7dLbj3vtdX/dL997zr1/n7HX22Wfftdded22zXLly5aq+Zon34kOFzPbX6ldtxHFxXQwKbXRW/BRzQ7utmCEKYlKw1a36iBuid2TrIZ6bO6BfZO8iroj+ka0uxVbYnLGNEV/ELdEusuOso6JrZKtLLRHDMrZl4pfYmbH3Emst3WINJfLJDzEt+6BRVSqfNLQmiG/2dz5piaaLz+JS9kGtqVQ+aakWWo07hQR6waqbTxZYjTuluXzSV+wVB82LvZlirPmPvig6i9XijqVVL065J7aJ+2K96BieldNU8wW6JhaZz43vnhHbxXBxJLSZA9/eZz4PygbmirqJ/eKyuCtGB3vFai6fsKXYDohImhPusTWZF3ftxW1zZyCuT0X30N4gTlnx8RONEw/NSwDgfqR5JO8Q58QAcdq86GSsE2I5L4frMdHJ3BG0O5jPa3foU1bUKC/EJ/NckvBVvDF3VKKlwX5VzDcv/RE/vMncKYjIiZ0Sbx/Gey0GR7asDpg7cnGA+2Q8nPvAPPoGBhtjvTNfNPpzxZGTxavwvNWEt1lFJl0Q64L9X51SMK+aS4k6qVweWiE+ihGhzVgF+3MBEe2X1srHkjXmYYw4FHKQRLFTgPvYKURWUgVzwHxkqQOLiT7xlhsqRoX7iebzoBInYuhDjiIyiGTEt4hk8iK7IDnU0o9DbVW1yXwV+fhhS3MKK8HeXWV+jmLbvTVPgEzuvHlIc0R4EuzlxLbcKm6KlebJnRxy0nz7ksyniO/imZgnhojHYovYZencWDy+ybcPifHBXjWR0FgF/gmSfJIotvNPkERGIhJwz8hOot5ThI2WHjh5J4mWSkV/3otVas65cuXKlet/6DcEI4oKZXW9VAAAAABJRU5ErkJggg==>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAaCAYAAAAEy1RnAAAC+UlEQVR4Xu2XWahNURjH/0KRKclUhmt4MSVJShQyJiVTMqSIkGRIhtCNFA/KFEKmkpSxSMmDKB4UniReKFEeJYnC/9e3tnPu7naHLjfnOP/6tfde3z7rrG+t71vr21JFFf23am/Gm7lmkGmZ2tuZXum+bDTYPDafzWWz0Vwwd80Qc8dM+v12iau12WG+ma2mbU2zxplP5p3KZKVx+Lj5bubkbJnamNsJ7kteq8xPs820yNmKdd5szzeWogaa9+a16Z2z5XVaZZLP1YpV3ptrr02dFKlQ0uJYum9+qExWsCHqad6aD6Z/ztYc4hQ4kK7Npsxp4L4usdmNyTc2UcPNQ0Xx02zqbJ6ofqe7mDOmW95QqiK8yOlpeUMSRxhVWXZ+8zzL7DOHE5Smo9P9IcXmSBvn+WZzMrVXmeXpmcjBds0MS7ajyTY/tVM7dFWoo9ltbiqKqFPmiCI1dinGQwU5Ib1fp/qaV+aB6ZGzUZXR4QYVzm8i4qLpYFopJoQN8YTiSENrFZOJ+B3OZOf7qHRPLU8ft8zIIhsV39j0TH/0n/WxKN0TdWsUR+wWMzu9z+8mp/t6VWUemS/mnFmqWBnybaJqFiwcW7z7zOxUzbTANsXsVxQymTgZmFTsC83Q1M5k3VDBaa7PVegTh4CouWdmpnaO1+yIXaD4TmAhZqjwYdQg4ViVInRhgGrvgDZyfLG5rhhkd7PJXDX9FIMrdhpncXqeWaeIENRQp9ESRVQsU/wvEYpIoRGKSXijSJs/LgbEBwmTBMfMVMVgs8EThjjNlVVChPwL1Qy/xjhdbfooNt/iyFuhQuSQHqTBHxcD4jNztVmpyF0GwqZzVrFR7TFPFbOfrSoDY7WJCsQKkdsfFRFCPnL9qtgQSYOXiemKMGbDpXrkS/CSYg9ar8h97AfViJxujJhlQpxBs1LF4jnflonfZaveWJEyVxRphfh/NtdsUumbia8tHUtW1Ac4zccRwjmi5K/k778kzmn2hWpF+lAdltXKVlRRE/ULdFOF17LXFHIAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEUAAAAaCAYAAADhVZELAAAC50lEQVR4Xu2XachNQRjH/7JESBJR5GTLVrakLPUSZYmEJBRFKL7ggyVxSz5KdkmyJJG1bKHcEMoXSREKJcpHSZbC/98z45x37o1z3+v11rnnX7/OOc/MmTPzzMxzngFy5crVSGpH6sgcMoA0d/a2pLu7rxkNJPfJJ3KKrCHHyHUyiFwlE3/Xzrhakk3kG1lP2tQvxjjykbxFjawUOWQ/+U5mB2Vercllh+4zrxXkJ9lAmgVlSR0lG0NjFtWHvCMvSI+gLNQh1Eg8KcBWybbAXk4dYFst09Jvt0h+oEZWQBp1I2/Ie9IrKMuSCuQrWRfYy8o7Rej+T1IwHh0aU6g9WRkam0D6SaRySkfyEH93SidymHQJC1JoMNkRGptAqZ0ibYfFlMlhgZN+0cpqff4SkQPkJNkCc1ZnWPpfIEfILtKVjCJPyCtykEwhQ2EdVD29s4RcgMW0CKVtDyd7YO/PJedgOZW+Kal/s8hxcoKMcXb9EJaTS7B+3UIFTulJnpPbsIEkpax2M1mN+vnLeFhmW0dOw85Ge8lCV67rbtg702FOSEqDKMICvTp/HlZPCtvuR0Y621hXR6mBJkqaATuGqB2lFzqOaBxbEedd/hupnSJF5B75DJvBRWQnuUMmoDShGwGbXQ1KUpB+CfuoDpC6XnHl5ZwiWxHx+yr3Tgnb9rZHiLe42hctyBnYCtF3NRkPyCTyGLETpYq2j5cGHpGZjt6IT8ahwo4PIa+dPZR3igbQN2EronqnaPvddPdJqZ7qJ/vTIKdUorDj2mZaGfPcsxw8jbRC7BTV1R9MSjrF50oNcYq0ChaD5HRpGOlPrpEFzqb+aDU1mlMicpZ8IPvcs6T9fAO213U+0hKWFG/ukrWweCHplH2RLIbFq6fkGZmK0raFbF9gAXy+qysUuDUhsiv4LoW1pxiigK5VtAzmDAV7/85/V7mjgJ611JPS7Ckl0BZVmZ6rkU7uydUl/etv5MqVK1euavULoTaRsCgVElkAAAAASUVORK5CYII=>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAH0AAAAaCAYAAACacVPHAAAEmElEQVR4Xu2Ze+ifUxzH33LbmGTLUDY/97mU5ZrLNNdcUjIhFkIoQyjXTT9bK5Q/3CKJUS5bLlMuNWIoFCGlCX9QLkX5Q9Kyhverzzm+z07P7/ud32+N57fzrnff53vOec7zOZ/355zPec4jVVRUVFRsgphkzjbPNvczN0/l25q7puuKcYL9zffN38yl5vXmk+YK8wDzNfPEf1pXdBpbmvPNP8ybzYnrVmuW+av5nepMHxdA8IfMNeacoi5jgvlKItcVHceV5l/mLeZmRV0TT5i3loUV3cNe5g/mV+a0oq7Eo6r5fFxgWDHLFxflbdhekQoqOgxey1aaf6rO4E0Gu5jfmj+aexR14wEzzFWKwCbANzS2UaS8teYZRd3/Fll0yHU/sNk7qizsAA4xl2uw6Gxgr9LgdiXyatkZ0XcwP9Rg0aeYj5lTy4oOYH1F38l8WIPbleic6OAeRU4/paxIYAZwKtd8fz/CvM+8V7ER5Gg2gxO9JeZT5v2KzR99HGs+Yz6rOATireEB82VFMJ2qOAG8zBxKdY+Y55gvKATZW/FayanghYp+ZypeJZco7LhUIXLeozRF58DpNvNO83Hz6NSG1Pam+XMqpw9Af8OKvhnvzo1yxoDt1H+iwaLT5xsKX76oON4eyR7GxNjh1Qo/c42P6IfrbOOosJv5pfmOeoPKwKjbzeu07vs7ApDLwDxF4ACOaT9SCLqvot/DzZMU/bNizE7l083DzM8Uqwz932XepAB1nP4dk/7zPMQmiDgR5Dl8EwBnqZe3ebvAqVmEpugHKZ7NLzMbEbCzbAe2MB8056b//BLEWykC+txUzpg+1mDRs10E80XmQvW3h3G/rViN8QWHYtsp/Mab1pjfoobM98zfFVGNUUTXu+bxaj+wwfknK4RipgGi+DmFw5pAsLZXQhz9qXqpBcGz6G11+WCIMupoA3D4SvUEw5420QEfjggWRPwg1be1Y/Z/rXgus5LfV80jzc9TPfg3y3vTroyR7MG/rD6Iz2r3U6o7QbFqbhAg7JB5ZuKe6n1Za4J2N5jPm7srBpFFxzHMgjJIqG87yWsTtp/ouW60orOqEcg4eHIqbxOdNHKw+U2jPqO0ayyi97MHDCuOx69R+O8O83LF7N+oKB1+gWIw/DIg8htLFSAo9lHs/Jkl+SMOaYDTv6YDCRTy2lhFL0Voisn9OUBx3OvmJYrZ22yHvTsqbD4vtce+09VLLTntsOQi3GhE72cPwKbvFfn7QIVv56W6jQpyCdGXNzyLFDmN5XtrRVQuU6SIuxXLFGKTBtiAsFEjaukHBz+t2KzwuvSW4syAgbOSrFZsoM43v0jkmjK++HHvkEKIl8yLFfuPVantaakNbbnnOIWtiHqj4hk8E+eymWQ55QtjFpq9CUKQtrCZvQlgQ0X+JdAZ9y+Kz9EzU30brlCMbYV6m7BDNbI9AP9QhuB85GKjmwPiP0GeVW1AUMQugeFt99CWezjsaEsp6wNmIrOF+9ldlykmg/op6bcEZczcEtm+JmjbfB5g9i9o4bVq7xf0swewccxjGYt/KioqKioqKioquoy/AVWA8Z6EbLLKAAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,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>