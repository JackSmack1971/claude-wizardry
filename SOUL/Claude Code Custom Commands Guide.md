# **Comprehensive Guide to Custom Commands and Skills Architecture in Claude Code**

Custom commands in Claude Code provide a highly adaptable mechanism designed to eliminate prompt drift, a phenomenon where developers repeatedly write similar instructions to an artificial intelligence engine only to receive inconsistent, non-deterministic responses.1 By saving preferred instructions, workflows, and evaluation criteria as structured Markdown files within specific local directories, development teams can codify engineering guidelines, automate repetitive diagnostics, and streamline complex tasks into simple slash commands.1  
While legacy custom commands remain fully supported for simple prompt macros, the ecosystem has evolved toward the Agent Skills open standard.4 This guide analyzes the technical requirements, directory scopes, security architectures, and execution environments necessary to design, implement, and secure custom commands and modern skills inside local developer environments.

## **Introduction and Overview**

Claude Code relies on a hierarchical directory structure to discover, parse, and execute custom prompt interfaces.5 These commands are implemented as standard Markdown files where the file name without the extension dictates the exact terminal slash command.1  
To configure a global custom command, a developer initializes a target directory within the home folder, mapping to \~/.claude/commands/.3 Commands stored in this global scope are available across every terminal session and codebase accessed on the host machine.5 Conversely, project-level commands reside within the specific repository root directory under .claude/commands/.3 These commands are intended to be committed to version control, ensuring that codebase-specific tasks, build loops, and styling conventions are consistently shared across all contributors.2  
The system architecture supports a dual execution model where custom commands exist alongside the modern Agent Skills subsystem.4 The Skills system represents a directory-centric evolution that integrates supportive assets, test scripts, and reference documents within a single workspace.4  
The structural characteristics and differences between these primary execution directories are summarized below:

| Configuration Directory | Scope of Availability | Version Control Strategy | Execution Model |
| :---- | :---- | :---- | :---- |
| \~/.claude/commands/ | Global (across all system projects) 5 | Local to developer workstation (typically ignored) 2 | User-driven; executed exclusively via manual slash invocation 1 |
| .claude/commands/ | Project-specific (active workspace only) 5 | Committed to repository source control 2 | User-driven; executed exclusively via manual slash invocation 1 |
| \~/.claude/skills/ | Global (across all system projects) 4 | Local to developer workstation (typically ignored) 8 | Dual-mode; manual user invocation or autonomous model selection 4 |
| .claude/skills/ | Project-specific (active workspace only) 4 | Committed to repository source control 9 | Dual-mode; manual user invocation or autonomous model selection 4 |

## **Command Creation Best Practices**

The creation of custom slash commands requires adherence to specific formatting rules, parameter placeholders, and dynamic execution features to ensure the Claude Code interpreter accurately parses the prompt payload.5

### **YAML Frontmatter Configurations**

A custom command file must begin with valid YAML frontmatter wrapped in triple-dash (---) markers.4 This metadata configures terminal visibility, restricts automated executions, and authorizes tool usage.5 Supported frontmatter keys include:

* **description:** A clear text summary defining the command's primary function.3 This string appears as interactive help text in the terminal command auto-complete dropdown menu.3  
* **argument-hint:** An informational string displaying parameter expectations (e.g., \[issue-number\]\[priority\]) to guide developers during terminal invocation.5  
* **allowed-tools:** A structured array of pre-approved operations (such as Read, Edit, or specific Bash parameters) that Claude is permitted to execute without prompting the developer for permission during that command's run cycle.5

### **Argument Handling and Positional Parameters**

To support dynamic execution, custom commands accept terminal inputs using variable placeholders 5:

* **$ARGUMENTS:** Captures the complete, raw text string appended after the slash command.1 For example, typing /verify src/auth \--verbose maps $ARGUMENTS to the exact value src/auth \--verbose.3  
* **Positional Shorthands ($1, $2,... $N):** Separates input arguments by whitespace.5 When executing a command named /fix-issue 451 critical, $1 resolves to 451 and $2 resolves to critical.5

### **Shell Command Execution (Shell Injection)**

Custom commands can run local bash scripts to dynamically include real-time system state in the prompt payload before it is submitted to the language model.1 The syntax supports two patterns:

* **Inline Execution:** Indicated by an exclamation-mark prefix and backticks (\!\`cmd\`\`\`).1 A line configured as \`- Current Branch:\!\`git branch \--show-current dynamically pulls the active branch name into the context.1  
* **Multi-Line Block Execution:** Indicated by a fenced code block opened with \!.4 For example:

\! git status \--short git diff \--cached \`\`\` This block executes the commands sequentially and inlines the standard output as raw text in the prompt context.4

### **File and Resource Referencing**

Within interactive sessions or custom command instructions, the @ prefix serves as a reference mechanism to supply the model with specific context.12 Typing @src/controllers/user.ts reads the complete contents of the file and attaches it to the conversation.12  
Similarly, typing @src/controllers/ provides a comprehensive directory listing.12 This syntax also supports Model Context Protocol (MCP) integrations, allowing developers to query remote resources directly within custom prompts using URI schemas like @github:issue://123.3

## **Organization and Structure**

Proper organization of custom commands ensures scalability, minimizes naming collisions, and simplifies maintenance across shared engineering teams.2

### **Namespacing and Directory Layouts**

As custom command libraries expand, storing all files in a single flat directory can lead to naming clutter.3 Claude Code supports organizational namespacing by parsing subdirectories within the target command folders.3  
Consider the following folder structure:

Plaintext  
.claude/commands/  
├── frontend/  
│   ├── component.md         \# Creates the /frontend:component command  
│   └── style-check.md       \# Creates the /frontend:style-check command  
├── backend/  
│   ├── api-test.md          \# Creates the /backend:api-test command  
│   └── db-migrate.md        \# Creates the /backend:db-migrate command  
└── review.md                \# Creates the global /review command

Using this structure, subdirectories partition commands into namespace hierarchies.3 While the subdirectory is displayed within the command’s CLI listing, the exact terminal invocation uses colon formatting (e.g., /project:frontend:component or /frontend:component).3

### **Naming Conventions and Internal Documentation**

To maintain structural clarity, commands should follow a strict set of naming conventions:

* **File Naming:** Use lowercase, kebab-case formatting for all filenames to avoid shell casing issues (e.g., security-audit.md rather than SecurityAudit.MD).10  
* **Instructional Style:** Write the body of custom commands using imperative, infinitive-form language (e.g., "Analyze the code," "Verify the build," or "Generate mock data").13 Avoid passive phrasing or second-person guidance to ensure instructions are clear and direct.13  
* **Structural Sections:** Use standard Markdown headings (\#\# Context, \#\# Requirements, \#\# Execution Steps) to establish logical boundaries for the model's reasoning loop.3

## **Security Considerations**

Because Claude Code operates within the local operating system's shell environment, executing commands can expose sensitive data or allow unauthorized actions if not properly secured.14 The model runs with the execution privileges of the active terminal session, meaning unchecked custom commands or repository-level overrides could read ssh keys, delete directories, or perform unsanctioned network calls.14

### **The Core Permissions Framework**

Claude Code secures execution tools through a tiered permissions framework configured across four states 14:

* **Allow:** Pre-authorizes execution without prompting the user.14  
* **Ask:** Requires explicit, manual confirmation from the user for every run.14  
* **Auto:** Delegates the execution decision to Claude's internal safety model, allowing safe commands while blocking risky operations.15  
* **Deny:** Permanently blocks the execution of specified tools under all circumstances.14

By default, read-only tools like directory listings and text searches run automatically without prompt barriers.14 All write, edit, and shell execution tools require explicit, session-specific consent unless otherwise configured in the configuration profiles.14

### **Securing Workspaces via settings.json**

Developers can manage permission rules through personal (\~/.claude/settings.json) or project-level (.claude/settings.json) configuration files.6 Project-scoped configurations can be committed to the repository, providing standard permission rules for the entire team.6  
The configuration below details a secure permission structure:

JSON  
{  
  "$schema": "\[https://json.schemastore.org/claude-code-settings.json\](https://json.schemastore.org/claude-code-settings.json)",  
  "permissions": {  
    "allow":,  
    "deny":,  
    "defaultMode": "auto"  
  },  
  "disableSkillShellExecution": true,  
  "disableBypassPermissionsMode": true  
}

This configuration applies specific security controls:

* **disableSkillShellExecution: true:** Completely disables inline shell command interpolation (\`\`\!\`cmd\`\`\` or multi-line blocks) inside all custom commands, skills, and plugins.4 This blocks repository-level exploits from executing malicious scripts under the guise of an automated custom command.16  
* **disableBypassPermissionsMode: true:** Blocks the use of the \--dangerously-skip-permissions CLI flag, ensuring that all actions are evaluated against the permission engine.15

### **Enterprise managed-settings.json Deployments**

For organizations requiring centralized administrative control, Claude Code supports managed settings that cannot be altered or overridden by local user or project-level configurations.6 These rules can be distributed using OS-level preferences or system directories 6:

* **macOS Plist Domain:** Administered via MDM configuration profiles deploying to the com.anthropic.claudecode domain.6  
* **Windows Registry Keys:** Controlled via Group Policy Objects (GPOs) using path keys under HKLM\\SOFTWARE\\Policies\\ClaudeCode.6  
* **Linux/WSL System Folder:** Configured within /etc/claude-code/managed-settings.json.6  
* **Windows System Folder:** Configured within C:\\Program Files\\ClaudeCode\\managed-settings.json.6 Note that the historical pathway C:\\ProgramData\\ClaudeCode\\managed-settings.json is deprecated as of v2.1.75 and must be migrated.6

Managed settings also support an alpha-numeric drop-in folder structure (managed-settings.d/).6 Separate teams can deploy independent JSON policy files (e.g., 10-telemetry.json, 20-security.json) which are sorted alphabetically and deep-merged over the base configuration, allowing organizations to manage permissions across large teams.6

## **Example Commands**

The following section details three production-ready custom commands and skills, demonstrating exact file formatting, syntax parameters, and execution logic.

### **Example 1: Surgical Code Review Command**

This project-scoped command uses specific guidelines to analyze staged git changes.5 It focuses the review on code simplicity and correctness, avoiding unnecessary modifications to adjacent files.8  
**File Path:** .claude/commands/review.md  
description: "Run a surgical, non-destructive code review on staged changes."  
allowed-tools:

* Bash(git diff \--cached)  
* Read

# **Surgical Review Protocol**

Analyze the staged modifications in this repository to verify code quality. Follow these strict behavioral guidelines:

## **Context**

Current Git Diff:  
\!  
git diff \--cached

## **Core Principles**

1. **Think Before Suggesting:** If multiple interpretations of a change exist, list the assumptions explicitly. Do not assume intent.  
2. **Simplicity First:** Recommend the minimum amount of code necessary. Do not suggest abstract patterns, wrapper files, or features that were not explicitly requested.  
3. **Surgical Changes:** Focus recommendations strictly on the lines modified in the diff. Do not suggest refactoring adjacent code or altering whitespace style.  
4. **Goal-Driven Criteria:** Verify that the code handles standard edge cases, executes successfully, and matches the target project's framework guidelines.

## **Execution Steps**

1. Parse the git diff output provided above.  
2. Generate a Markdown table containing the following columns:  
   * **File Path & Line Range**  
   * **Issue Classification** (Correctness, Security, Performance, Style)  
   * **Surgical Suggestion** (Provide the specific, minimal replacement code block)  
3. If no critical issues are found, explicitly output: "Review complete. Code changes are surgically clean."

#### **Explanation of Effectiveness**

This command handles context efficiently by retrieving the diff of the staging area via git diff \--cached.5 This limits the context size compared to sending full files.5  
By defining clear principles in the prompt, it reduces the risk of generic AI recommendations, ensuring suggestions are focused on the actual changes.8

### **Example 2: Dynamic Test Suite Runner**

This command allows developers to run specific test suites with optional parameters, helping to automate diagnostic testing.5  
**File Path:** \~/.claude/commands/test.md  
description: "Execute tests matching a specified pattern and diagnose failures."  
argument-hint: "\[test-file-pattern\]\[--verbose | \--coverage\]"  
allowed-tools:

* Bash(npm run test \*)  
* Read  
* Edit

# **Test Runner and Diagnosis Engine**

Execute the project's test suite matching the target arguments: **$ARGUMENTS**

## **Execution Protocol**

1. Run the test command with the specified arguments:  
   npm run test \-- $ARGUMENTS  
2. If all tests pass successfully, output a summary and terminate:  
   * Total Tests Executed  
   * Total Duration  
   * Code Coverage metrics (if present in logs)  
3. If any test fails, analyze the test failure output:  
   * Identify the specific assertions that failed.  
   * Read the relevant test and implementation files.  
   * Propose a targeted, minimal fix to make the tests pass.  
   * Ask for confirmation before editing the code files.

#### **Explanation of Effectiveness**

This command uses the $ARGUMENTS placeholder to dynamically run specific test files or flags.1 It automates a common testing workflow by running the tests, parsing the output, and locating failures in a single step.5  
By requesting confirmation before making code edits, it maintains developer control over codebase changes.14

### **Example 3: Cross-Platform Semantic Version Manager**

This command manages project versioning by updating a VERSION file and git tags, using explicit constraints to prevent the creation of unnecessary files.11  
**File Path:** .claude/commands/version-bump.md  
description: "Manage semantic project versioning using a centralized VERSION file."  
argument-hint: "\[patch | minor | major | current\]\[--dry-run\]"  
allowed-tools:

* Read  
* Write  
* Bash(git status \*)  
* Bash(git tag \*)

# **Semantic Versioning Engine**

Apply semantic version management to this project using the specified parameters: **$ARGUMENTS**

## **Execution Constraints**

* **Strict File Limit:** Do not create or write to any files other than an existing VERSION file, unless explicitly executing updates on known package managers. Do not generate custom helper bash or shell scripts.  
* **Dry-Run Guard:** If \--dry-run is specified in the arguments, calculate and print the expected target version, but do not write any changes to disk.

## **Action Steps**

1. **Read Current State:** Locate the VERSION file in the root directory. If it does not exist, initialize it with content "0.0.1".  
2. **Parse Argument:**  
   * current: Print the active version.  
   * patch: Increment patch segment (e.g., 1.2.3 \-\> 1.2.4).  
   * minor: Increment minor segment and reset patch (e.g., 1.2.3 \-\> 1.3.0).  
   * major: Increment major segment and reset minor/patch (e.g., 1.2.3 \-\> 2.0.0).  
3. **Synchronize Package Manifests:** If a write operation is occurring, check for the presence of standard manifests and update their version strings:  
   * package.json (Node)  
   * Cargo.toml (Rust)  
   * pyproject.toml (Python)  
4. **Git Synchronization:** Print the equivalent git command required to tag the repository: git tag \-a v \-m "Release v" but do not execute it unless requested.

#### **Explanation of Effectiveness**

This command uses negative constraints ("Do not generate custom helper bash or shell scripts") to prevent Claude from creating temporary scripts to handle version updates.11  
Additionally, the \--dry-run parameter allows developers to verify version calculations before writing changes to disk, reducing potential execution errors.11

## **Maintenance and Troubleshooting**

Maintaining custom commands across team repositories requires addressing context limits, naming conflicts, and platform compatibility issues.2

### **Mitigating Context Bloat**

A common issue with custom commands is context bloat.4 When large prompt templates or long documentation files are loaded into the system context, they consume tokens, reduce reasoning speed, and can lead to model confusion.4  
To minimize context size:

* Keep the core instructions in custom command files concise and focused on execution logic.4  
* Store detailed reference guides, API schemas, and style rules in separate files.4  
* Retrieve these external resources on-demand inside the command using the @ prefix, loading them into context only when needed.12

### **Resolving Command Conflicts and Precedence**

Naming conflicts can arise when global commands, project commands, and skills share similar names.4 Claude Code resolves these naming conflicts using a defined precedence hierarchy:  
Enterprise Managed Settings (Administrative Override)  
└── \~/.claude/skills//SKILL.md (Personal Skill)  
└── \~/.claude/commands/.md (Personal Command)  
└──.claude/skills//SKILL.md (Project Skill)  
└──.claude/commands/.md (Project Command)  
└── Installed Plugin Skills  
If a command and a skill share the same invocation name, the skill takes precedence and is executed.4 Developers can view all active and registered commands within a session by running the / menu or checking settings files.21

### **Cross-Platform Windows and UNIX Compatibility**

Executing shell commands within custom prompts can create platform compatibility issues when sharing commands across macOS, Linux, and Windows systems.23

* **Quoting and Variable Issues:** Passing inline commands can lead to quoting discrepancies between bash and Windows shell environments.24 Additionally, native environment variables like $\_ may be eagerly expanded by bash before PowerShell processes them, leading to execution errors.24  
* **Pathing Differences:** UNIX paths use forward slashes (/), while Windows filesystems default to backslashes (\\).23 To maintain compatibility, run cross-platform automation scripts using native Node.js (node) or Python rather than platform-specific shells (sh, bash, powershell).23  
* **PowerShell Integration:** As of version 2.1.120 and 2.1.126, Claude Code treats PowerShell as the primary shell on Windows when enabled, detecting system installations from the Microsoft Store, MSI packages, and.NET global tools.20 If PowerShell is configured, use standard, platform-agnostic tools to ensure commands run consistently across environments.20

## **Comparison to Skills System**

The Skills System represents a major update to the Claude Code capability framework.4 While legacy custom commands are useful for simple prompt shortcuts, skills introduce a more structured, directory-based approach.4

### **Key Mechanical Differences**

The primary technical differences between legacy custom commands and the modern Skills system are analyzed below:

| Architectural Feature | Legacy Custom Commands | Modern Skills System |
| :---- | :---- | :---- |
| **Storage Structure** | Flat, single Markdown file (command.md) 5 | Structured directory containing SKILL.md and assets 4 |
| **Invocation Model** | Manual only; requires user typing /command 1 | Dual-mode; manual invocation or autonomous selection 4 |
| **Trigger Mechanism** | Direct keyboard entry by the user 1 | Semantic match against frontmatter descriptions 9 |
| **Startup Token Cost** | Moderate; processes entire filename list 4 | Low; reads only \~100 token descriptions at startup 8 |
| **Supporting Assets** | Unsupported; commands are single-file only 4 | Built-in support for references, examples, and scripts 4 |
| **Context Isolation** | Unsupported; runs directly in main chat context 4 | Supports isolated subagents via context: fork 4 |
| **Token Compaction** | Standard session-level context pruning 22 | Re-attaches 5k tokens of active skills post-compaction 4 |

### **Progressive Loading and Token Preservation**

Legacy custom commands must be fully loaded into the prompt context when invoked, which can impact performance in long sessions.4  
In contrast, the Skills system uses a progressive loading model 8:

1. **Discovery Phase:** At startup, Claude Code scans all available skills but only loads their high-level descriptions (costing about 100 tokens per skill).8  
2. **Activation Phase:** The full instructions in SKILL.md are only loaded into the active token context when the skill is explicitly triggered.4  
3. **Compaction Phase:** During long conversations, Claude Code compresses historical messages.4 To ensure key instructions are preserved, the engine re-attaches the first 5,000 tokens of the most recently used skills *after* the conversation summary, within a total shared budget of 25,000 tokens for all active skills.4

## **Recommendations**

For development teams managing workflows in Claude Code, transitioning from legacy custom commands to the modern Skills system is recommended.4

### **When to Use Custom Commands**

* Use custom commands for simple text macros that do not modify codebase files.4  
* Use commands for basic shortcuts like adding a standard header, querying git status, or printing local system specs.5

### **When to Migrate to Skills**

* Use skills for multi-step processes like builds, test suites, or deployments.4  
* Use skills when instructions require supporting resources like schemas, file templates, or helper scripts.4  
* Use skills for tasks that should run in an isolated environment via context: fork to keep the main conversation clean.4  
* Use skills when you want Claude to automatically recognize and trigger tasks based on natural language descriptions.4

### **Migration Playbook: Custom Commands to Skills**

Development teams can migrate legacy commands to skills using this step-by-step workflow:

1. **Create the Directory:** Initialize a dedicated skill folder using the kebab-case command name:  
   Bash  
   mkdir \-p.claude/skills/code-review

2. **Initialize the SKILL.md:** Create the primary SKILL.md file inside that folder 4:  
   Bash  
   touch.claude/skills/code-review/SKILL.md

3. **Port and Format Content:** Copy the instructions from the old legacy command file into SKILL.md, ensuring instructions use imperative language.13  
4. **Refactor YAML Frontmatter:** Update the YAML metadata block to include the modern skill parameters:  
   * Write a detailed description explaining what the skill does and when Claude should trigger it.8  
   * Set disable-model-invocation: true for any tasks that perform write operations or deployments.4  
5. **Separate Large References:** Move extensive templates, guidelines, or schemas into a dedicated references/ subdirectory, and reference them in SKILL.md using the @ symbol.4  
6. **Deprecate the Legacy Command:** Delete the old command file to prevent naming conflicts:  
   Bash  
   rm.claude/commands/review.md

7. **Test the Migration:** Open a new Claude Code session and run /skills to confirm that the migrated skill is registered, active, and functioning correctly.21

## **Summary of Key Takeaways**

The key integration practices for custom commands and skills in Claude Code are summarized below:

* **File Naming Rules:** Filenames must be lowercase kebab-case, with the name mapping directly to the slash command.5  
* **Argument Handling:** Use $ARGUMENTS to capture the entire raw input, or positional parameters ($1, $2) to parse whitespace-separated values.5  
* **Context Management:** Keep core instructions concise. Store large reference materials in a references/ subdirectory to prevent context bloat.4  
* **Security Best Practices:** Manage permissions using Allow, Deny, Ask, and Auto states inside settings.json.14 Set disableSkillShellExecution: true to prevent untrusted commands from executing local shell scripts.4  
* **Platform Compatibility:** Use native Node.js scripts for multi-platform environments instead of platform-specific shells.23 Ensure path variables are resolved using path.join().23  
* **Skills Transition:** Migrate complex workflows to the Skills system to leverage progressive loading, isolated subagents, and automated semantic triggering.4

#### **Works cited**

1. Claude 6 — Custom Slash Commands \- Medium, accessed May 29, 2026, [https://medium.com/@abhishekjainindore24/claude-6-custom-slash-commands-e15ec1a4b5be](https://medium.com/@abhishekjainindore24/claude-6-custom-slash-commands-e15ec1a4b5be)  
2. What are Claude Code custom commands? \- PromptLayer, accessed May 29, 2026, [https://www.promptlayer.com/glossary/claude-code-custom-commands/](https://www.promptlayer.com/glossary/claude-code-custom-commands/)  
3. Claude Code Commands | Developing with AI Tools \- Steve Kinney, accessed May 29, 2026, [https://stevekinney.com/courses/ai-development/claude-code-commands](https://stevekinney.com/courses/ai-development/claude-code-commands)  
4. Extend Claude with skills \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)  
5. Slash Commands in the SDK \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/slash-commands](https://code.claude.com/docs/en/agent-sdk/slash-commands)  
6. Claude Code settings \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings)  
7. claude-code-skills/CLAUDE.md at main \- GitHub, accessed May 29, 2026, [https://github.com/daymade/claude-code-skills/blob/main/CLAUDE.md](https://github.com/daymade/claude-code-skills/blob/main/CLAUDE.md)  
8. Best Claude Code Skills to Try in 2026 \- Firecrawl, accessed May 29, 2026, [https://www.firecrawl.dev/blog/best-claude-code-skills](https://www.firecrawl.dev/blog/best-claude-code-skills)  
9. About Claude Skills \- A comprehensive guide \- GitHub Gist, accessed May 29, 2026, [https://gist.github.com/stevenringo/d7107d6096e7d0cf5716196d2880d5bb](https://gist.github.com/stevenringo/d7107d6096e7d0cf5716196d2880d5bb)  
10. The Complete Guide to Building Skills for Claude | Anthropic, accessed May 29, 2026, [https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf](https://resources.anthropic.com/hubfs/The-Complete-Guide-to-Building-Skill-for-Claude.pdf)  
11. Streamlining Development Workflows with Claude Code Custom ..., accessed May 29, 2026, [https://www.vincentbruijn.nl/articles/custom-slash-commands/](https://www.vincentbruijn.nl/articles/custom-slash-commands/)  
12. Referencing Files and Resources in Claude Code | Developing with AI Tools | Steve Kinney, accessed May 29, 2026, [https://stevekinney.com/courses/ai-development/referencing-files-in-claude-code](https://stevekinney.com/courses/ai-development/referencing-files-in-claude-code)  
13. claude-code/plugins/plugin-dev/skills/skill-development/SKILL.md at main \- GitHub, accessed May 29, 2026, [https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md?plain=1](https://github.com/anthropics/claude-code/blob/main/plugins/plugin-dev/skills/skill-development/SKILL.md?plain=1)  
14. claude-permissions | Skills Marketplace \- LobeHub, accessed May 29, 2026, [https://lobehub.com/bg/skills/otrebu-agents-claude-permissions](https://lobehub.com/bg/skills/otrebu-agents-claude-permissions)  
15. What Is Claude Code Auto Mode? The Safer Alternative to Bypass Permissions | MindStudio, accessed May 29, 2026, [https://www.mindstudio.ai/blog/what-is-claude-code-auto-mode](https://www.mindstudio.ai/blog/what-is-claude-code-auto-mode)  
16. Securing Claude Code for Teams \- Adversis, accessed May 29, 2026, [https://www.adversis.io/blogs/securing-claude-code-for-teams](https://www.adversis.io/blogs/securing-claude-code-for-teams)  
17. How to use Allowed Tools in Claude Code \- Instructa.ai, accessed May 29, 2026, [https://www.instructa.ai/blog/claude-code/how-to-use-allowed-tools-in-claude-code](https://www.instructa.ai/blog/claude-code/how-to-use-allowed-tools-in-claude-code)  
18. Move over 2.1.90 \- 2.1.91 is here : r/ClaudeCode \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1sb0fpn/move\_over\_2190\_2191\_is\_here/](https://www.reddit.com/r/ClaudeCode/comments/1sb0fpn/move_over_2190_2191_is_here/)  
19. Claude Code \- Complete settings.json Reference (Updated April 13 ..., accessed May 29, 2026, [https://gist.github.com/mculp/c082bd1e5a439410158974de90c89db7](https://gist.github.com/mculp/c082bd1e5a439410158974de90c89db7)  
20. claude-code-best-practice/best-practice/claude-settings.md at main \- GitHub, accessed May 29, 2026, [https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md)  
21. Use skills in Claude | Claude Help Center, accessed May 29, 2026, [https://support.claude.com/en/articles/12512180-use-skills-in-claude](https://support.claude.com/en/articles/12512180-use-skills-in-claude)  
22. Commands \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/commands](https://code.claude.com/docs/en/commands)  
23. Cross-Platform Claude Code Hooks: Write Once, Run on Windows, Linux, and macOS, accessed May 29, 2026, [https://claudefa.st/blog/tools/hooks/cross-platform-hooks](https://claudefa.st/blog/tools/hooks/cross-platform-hooks)  
24. Fixing Claude Code's PowerShell Problem with Hooks | netnerds.net, accessed May 29, 2026, [https://blog.netnerds.net/2026/02/claude-code-powershell-hooks/](https://blog.netnerds.net/2026/02/claude-code-powershell-hooks/)  
25. What are skills? | Claude Help Center, accessed May 29, 2026, [https://support.claude.com/en/articles/12512176-what-are-skills](https://support.claude.com/en/articles/12512176-what-are-skills)