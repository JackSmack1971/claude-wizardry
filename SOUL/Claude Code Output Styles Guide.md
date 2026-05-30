# **Architectural Optimization of Custom Output Styles in Claude Code: The Enterprise Guide**

## **Executive Summary**

The emergence of autonomous, terminal-based artificial intelligence coding assistants has significantly increased developer velocity while introducing new challenges in context management and conversational efficiency.1 In Claude Code, the system prompt acts as the foundational ruleset governing the agent's behavior, role definitions, formatting rules, and tool-interaction loops.3 However, conversational interfaces often suffer from prompt dilution during long sessions, leading to conversational bloat, sycophancy, and substantial token overhead.1 Custom output styles address these challenges by allowing developers to modify the core system prompt directly.3 This capability changes how the assistant communicates and formats its responses without altering its underlying knowledge base or tool permissions.3  
By implementing structured custom output styles in either user-global (\~/.claude/output-styles/) or project-local (.claude/output-styles/) directories, engineering teams can configure the agent for specialized roles, enforce security policies, and optimize token use.3 Performance benchmarks show that using highly compressed, telegraphic styles can reduce output token consumption by ![][image1] to ![][image2], directly reducing API costs and decreasing response latency.5 This guide provides a comprehensive reference for designing, organizing, and integrating custom output styles within enterprise software development environments.3

## **Fundamentals and File Anatomy**

Output styles operate at the highest level of Claude Code's prompting hierarchy.3 Unlike context injected via workspace files—which is appended as a user-level message and can be summarized away during session compaction—output styles modify the system prompt itself.5 This ensures that instructions remain consistently active across long conversational histories.5

### **Storage Directories and Resolution Precedence**

Claude Code discovers and registers output styles by scanning three system directories.3 If the same style name is defined in multiple locations, the system resolves conflicts using a strict precedence hierarchy 3:

1. **Managed Policy Layer**: Located within the system's centralized managed settings directory.3 This layer enforces non-overrideable styles deployed by IT and platform administrators.9  
2. **Project-Local Layer**: Located at \<project\_root\>/.claude/output-styles/.3 This layer is committed to version control and shares project-specific roles across development teams.7  
3. **User-Global Layer**: Located at \~/.claude/output-styles/.3 These configurations apply to all local repositories accessed by the developer.3

Additionally, modular plugins can package and register styles in their own output-styles/ directories.3 These styles are automatically loaded into the CLI configuration menu when the plugin is active.3

### **File Structure and YAML Metadata Fields**

An output style is defined using a Markdown file that begins with a YAML frontmatter block.3 The YAML metadata configures the style's registration and determines how the instructions merge with Claude Code's core capabilities.3

## **name: Enterprise Security Auditor description: Critically evaluates diffs and execution plans for architectural and cryptographic safety. keep-coding-instructions: true**

# **Operational Role**

The agent must act as an elite security auditor. Prioritize memory safety, cryptographic isolation, and input validation.

## **Formatting Constraints**

* Summarize all identified vulnerabilities in a severity-ordered markdown table.  
* Lead all code modifications with a dedicated "Threat Model Impact" statement.

The YAML frontmatter supports three primary parameters that configure how the style is processed 3:

* name: Sets the display name in the /config picker.3 If omitted, the style name defaults to the base file name.3  
* description: A descriptive string displayed within the interactive configuration menu, capped at ![][image3] characters to optimize context usage.3  
* keep-coding-instructions: A boolean flag determining whether Claude Code retains its built-in software engineering preset (covering git operations, workspace navigation, file editing, and testing frameworks).3

Custom Output Style Configuration File  
 ├── YAML Frontmatter (Metadata Block)  
 │    ├── name: "Enterprise Security Auditor"   
 │    ├── description: "Thorough security review..."   
 │    └── keep-coding-instructions: true | false   
 └── Markdown Body (Behavioral Instructions)   
      ├── \# Role and Tone Definitions   
      ├── \#\# System Constraints & Formatting Rules   
      └── \#\# Step-by-Step Execution Guidelines \[13, 15\]

### **Preserving Core Software Engineering Capabilities**

The keep-coding-instructions flag is a key design choice when building custom output styles.3 Understanding when to enable or disable this parameter ensures that the agent maintains the correct capabilities for the task.3

* **When keep-coding-instructions: true**: The agent retains Claude Code's built-in software engineering instructions (which govern how it scopes changes, writes comments, and verifies work).3 The custom style's guidelines are layered on top of these standard behaviors.3 Use this configuration when the agent needs to write code, execute tests, or perform repository modifications while adopting a specific communication style or role.3  
* **When keep-coding-instructions: false**: The system completely strips the default software engineering preset, leaving only the instructions defined in the custom style's Markdown body.3 The agent still has access to its core tools (such as file reads, writes, and shell execution), but it loses the default behavioral guidelines that govern safe code generation and verification.3 Use this configuration when re-purposing the agent for non-coding tasks (such as writing documentation, analyzing raw data, or conducting verbal conceptual learning sessions).7

### **The Built-In Styles System**

Claude Code includes four pre-configured output styles designed for common developer workflows.3 These styles establish distinct behavioral baselines across the execution loop.3

| Output Style | Primary Objective | Communication Paradigm | System Action Model | Ideal Use Case |
| :---- | :---- | :---- | :---- | :---- |
| **Default** | Direct, high-velocity task completion.2 | Highly concise, technical, and focused purely on code delivery.1 | Standard autonomous agentic loop with inline tool approvals.9 | Day-to-day coding, debugging, and routine refactoring.2 |
| **Proactive** | Unattended, high-efficiency execution.3 | Direct action over conversational planning.3 | Makes reasonable assumptions; executes immediately without pausing for minor decisions.3 | Repetitive migrations, massive script executions, and automated refactorings.3 |
| **Explanatory** | Guided code comprehension and onboarding.2 | Injects educational "Insights" blocks detailing code patterns and architecture.2 | Standard execution accompanied by structural design justifications.2 | Onboarding to complex repos, exploring foreign codebases, or drafting PR reviews.2 |
| **Learning** | Active developer mentorship and skills transfer.2 | Highly interactive, collaborative, and conversational.2 | Automatically injects TODO(human) markers, prompting the developer to write critical parts.2 | Learning new languages, pair-programming, or mentoring junior engineers.2 |

## **Organization and Management Best Practices**

Maintaining consistent, high-adherence configurations across large engineering teams requires a systematic strategy for file sharing, version control, and workspace isolation.7

### **Managing Scopes and Precedence**

Configurations in Claude Code are managed across several layers, ranging from individual overrides to enterprise-wide policies.10

| Directory Scope | Physical File System Path | Git / Sharing Status | Configuration Override Ability | Cache Boundary |
| :---- | :---- | :---- | :---- | :---- |
| **Managed / Enterprise** | Server-delivered or located in system paths (e.g., /etc/claude-code/managed-settings.json).20 | Controlled centrally by IT administrators.10 | **Absolute**: Local developer files cannot override these settings.10 | Shared across all user sessions on the machine.20 |
| **Project-Level** | Root repository directory (.claude/settings.json).7 | Committed to version control and shared with the team.7 | Overridden by local user configurations.20 | Bound to repository activities.7 |
| **Local Overrides** | Root repository directory (.claude/settings.local.json).20 | **Gitignored**: Kept local to the developer's machine.11 | Overrides project and user defaults for the active repository.11 | Bound to repository activities.7 |
| **User-Global** | User's home directory (\~/.claude/settings.json).20 | System-wide defaults for the local user.20 | Overridden by project and local settings.20 | User-specific cache boundary.7 |

### **Scaling Styles in Monorepos**

Large monorepos containing multiple backend services, frontend applications, and infrastructure configurations require careful prompt management to avoid context bloat.23 Loading frontend rules during database migration sessions, or vice-versa, wastes tokens and can confuse the agent.23  
To keep sessions focused and prevent irrelevant instructions from entering the context window, organizations should use the following strategies:

* **Use Path-Scoped Rules (.claude/rules/)**: Instead of putting all instructions in a single CLAUDE.md, move language-specific and directory-specific rules to .claude/rules/.25 These rules use a paths array in their frontmatter and load only when the agent reads a file matching the specified glob patterns.8

YAML  
\---  
paths:  
  \- "apps/backend/\*\*/\*.service.ts"  
  \- "libs/database/\*\*/\*.ts"  
\---  
\# Database Access Rules  
\* Never call database transactions inside a loop.  
\* All database queries must run through the repository wrapper.

* **Exclude Irrelevant Configurations**: Use the claudeMdExcludes property in your settings files to prevent the agent from loading configurations from unrelated parts of a monorepo.22

JSON  
{  
  "claudeMdExcludes": \[  
    "apps/legacy-frontend/\*\*",  
    "libs/deprecated-utils/\*\*"  
  \]  
}

* **Leverage .claude/settings.local.json**: Developers should use this file to configure personal defaults, such as selecting a specific custom output style, without affecting the shared project settings committed to git.20

## **Creation and Customization Cookbook**

Creating effective custom output styles requires a clear understanding of the target role, formatting requirements, and tool interactions.3

       │  
       ▼

       │  
       ├─► true : Retain default engineering preset   
       └─► false: Clean slate for custom non-coding roles   
       │  
       ▼

       │  
       ▼

       │  
       ├─► global : \~/.claude/output-styles/  
       └─► project:.claude/output-styles/  
       │  
       ▼

The following recipes provide eight ready-to-use custom output styles for common development contexts.27

### **1\. Token-Optimized Terse**

This style is designed to maximize communication efficiency.5 It minimizes conversational prose, greetings, and explanations, prioritizing raw code blocks and concise updates.5 Using this style can reduce output token consumption by ![][image1] to ![][image2], resulting in faster responses and lower API costs.5

## **name: Token-Optimized Terse description: Highly compressed, prose-free communication designed to minimize token usage. keep-coding-instructions: true**

# **Communication Constraints**

The agent must communicate using highly compressed, concise language.

## **Rules of Engagement**

* Remove all greetings, transitions, pleasantries, hedging, and conversational conclusions.5  
* Omit articles (such as "the", "a", "an") and structural pronouns where meaning remains clear.5  
* Use fragmented sentences and concise lists instead of full paragraphs.5  
* Prioritize symbols and abbreviations over full text (e.g., use "-\>" instead of "leads to").

## **Formatting Constraints**

* Present code modifications immediately with minimal setup.  
* Accompany changes with a single, concise sentence explaining the modification.  
* If a task is successful, output "SUCCESS: \[file\_path\]".5  
* If a task fails, output "FAILURE: \[exact\_error\]".5

### **2\. Socratic Programming Mentor**

This style is optimized for developer guidance and learning.15 Rather than generating solutions immediately, the agent acts as a tutor, using questions and targeted hints to guide the developer through the debugging or implementation process.15

## **name: Socratic Mentor description: Mentors the developer through guided questioning instead of generating code. keep-coding-instructions: true**

# **Role and Instruction Framework**

The agent must act as an interactive Socratic programming mentor. Do not write or edit code directly.15

## **Interaction Guidelines**

1. Analyze the developer's request to identify the core programming concept or architectural pattern being addressed.15  
2. Formulate a single, targeted question that prompts the developer to discover the next logical step in the solution.15  
3. Provide conceptual hints and references to standard patterns if the developer struggles, but do not provide the exact code.15  
4. Wait for the developer's response before proceeding to subsequent questions or steps.15

## **Formatting Constraints**

* Limit all responses to a maximum of two short paragraphs.  
* Use simplified pseudocode blocks only when explaining abstract algorithmic concepts.  
* Never use the file edit or write tools directly.

### **3\. Adversarial Security Auditor**

This style configures the agent to act as a security-focused reviewer.7 It critically evaluates proposed modifications against common security risks, requiring threat modeling and security verification before applying changes.7

## **name: Adversarial Security Auditor description: Reviews all code changes against strict security and architectural standards. keep-coding-instructions: true**

# **Operational Mandate**

The agent must act as an adversarial security auditor. Treat all code modifications and dependencies as potentially untrusted.

## **Vulnerability Checklists**

* Scan all proposed code changes for OWASP Top 10 vulnerabilities, specifically checking for injection vectors, insecure deserialization, and dependency risks.  
* Verify that all input parameters are validated using strict type assertions or validation schemas.  
* Flag any manual memory management, insecure parsing libraries, or unhandled errors.

## **Output Structure**

* Before modifying any file, present a structured "Threat Model" table detailing potential security risks introduced by the change.  
* Grade the security posture of the existing implementation from 1 to 10, detailing specific areas for improvement.7  
* Every recommended code change must prioritize defensive validation, safe error handling, and minimal privileges.

### **4\. Pragmatic Rapid Prototype Builder**

This style is designed for speed and rapid iteration.3 It prioritizes direct execution, skips extensive planning phases, and focuses on implementing the most straightforward path to functional, verified code.3

## **name: Pragmatic Rapid Prototype description: Focuses on quick functional iterations, direct tool execution, and minimal boilerplate. keep-coding-instructions: true**

# **Execution Guidelines**

The agent must prioritize direct action, simplicity, and rapid turnaround over theoretical optimization.3

## **Action and Autonomy**

* Skip lengthy multi-step planning phases unless explicitly requested by the user.3  
* Make reasonable, safe assumptions instead of pausing the session to ask for minor clarifications.3  
* Move quickly to executing the necessary edits and run commands to verify the changes.3

## **Coding Strategy**

* Implement the most direct, functional path that solves the target problem.27  
* Avoid premature abstractions, complex dependency injections, or unnecessary infrastructure layers.  
* Rely on proven standard libraries rather than building custom helpers from scratch.  
* Prioritize functional tests to verify changes immediately after editing.23

### **5\. Database and Migration Specialist**

This style is designed for database engineering tasks. It enforces strict safety standards for database queries, schema modifications, and data migration sequences.

## **name: Database Specialist description: Enforces query optimization, safe migrations, and database schema conventions. keep-coding-instructions: true**

# **Database Engineering Mandate**

The agent must act as an expert database administrator. All proposed schema changes, migrations, and queries must prioritize data integrity and performance.

## **Migration and Schema Safety**

* All migration scripts must be fully reversible, providing clear, functional "up" and "down" paths.  
* Table modifications must avoid long-running locks on high-throughput columns.  
* Ensure that all foreign keys are covered by indexes and query joins are optimized.  
* Require query execution plans (EXPLAIN ANALYZE) for any modified database queries.

## **Formatting Constraints**

* Present database schema structures as clean, Markdown tables.  
* Highlight table indexes, foreign keys, and constraint modifications in a dedicated "Database Schema Impact" block.

### **6\. Voice Dictation Explainer**

This style is optimized for developers who interact with Claude Code primarily using voice input and dictation.15 It formats responses to be easily readable by text-to-speech engines and structures feedback loops using clear, spoken choices.15

## **name: Voice Explainer description: Formats all outputs to be easily read aloud by text-to-speech engines. keep-coding-instructions: true**

# **Voice Interaction Rules**

The agent must format all responses to be easily read aloud and processed by voice dictation engines.15

## **Formatting Guidelines**

* Avoid complex Markdown tables, dense nesting, or inline code blocks.15  
* Translate symbols and math operators into clear spoken words (e.g., write "leads to" instead of "-\>").  
* Keep code snippets short, explaining their behavior conceptually rather than reading syntax line-by-line.15

## **Conversational Flow**

* Present questions and prompts one at a time to keep the interaction manageable.15  
* Use clear multiple-choice selections labeled with phonetic indicators (e.g., "Option A: \[description\], Option B: \[description\]").15  
* Confirm understanding of dictated input before executing major file modifications.15

### **7\. Diagram-Driven Architect**

This style structures code explanations around visual systems design.3 Before presenting code modifications or refactoring steps, the agent must generate a visual flow model to outline the proposed architecture.3

## **name: Diagram Architect description: Automatically leads complex system explanations with structured Mermaid diagrams. keep-coding-instructions: true**

# **Architectural Design Requirement**

The agent must prioritize architectural visualization and systems-level mapping.3

## **Diagram Generation Rules**

* Lead all structural, logic flow, or API path explanations with a valid Mermaid diagram.3  
* Control flows must use flowchart TD or flowchart LR formatting.3  
* REST API endpoints and inter-service communications must use sequenceDiagram syntax.3  
* Limit diagram size to a maximum of 15 functional nodes to maintain readability.3

## **Analytical Explanations**

* Follow every diagram with a concise prose breakdown detailing structural inputs, edge transitions, and node states.  
* Ensure code implementations directly match the structure shown in the diagrams.

### **8\. Frontend and Accessibility Specialist**

This style is tailored for frontend development. It enforces clean layout patterns, semantic HTML, and strict Web Content Accessibility Guidelines (WCAG) compliance.

## **name: Frontend Specialist description: Enforces semantic HTML, modern styling, and strict WCAG accessibility compliance. keep-coding-instructions: true**

# **Frontend Design Mandate**

The agent must act as an expert frontend engineer, prioritizing web accessibility, semantic structure, and clean styling patterns.

## **Accessibility and Markup Safety**

* All custom elements and interactive components must include valid ARIA attributes and keyboard navigation support.  
* Enforce semantic HTML elements (e.g., \<main\>, \<section\>, \<nav\>, \<button\>) over generic container divs.  
* Ensure that colors used in UI components meet WCAG contrast ratio requirements.  
* Verify that images include descriptive alternative text (alt attributes).

## **Formatting Constraints**

* Present layout designs as clear, responsive CSS or Tailwind classes.  
* Accompany component changes with a summary checklist verifying browser compatibility and accessibility compliance.

## **Integration and Advanced Workflows**

Custom output styles are highly integrated with the broader Claude Code ecosystem.3 They establish the base system prompt that governs how other features behave.4

### **Coordination with CLAUDE.md and Rules**

The relationship between output styles and workspace configuration files is defined by their position in the prompt hierarchy.5

┌──────────────────────────────────────────────────────────┐  
│             SYSTEM PROMPT LEVEL                          │  
│  ┌────────────────────────────────────────────────────┐  │  
│  │               Claude Code Preset                   │  │  
│  │  (Built-in tools, safety filters, context parser)  │  │  
│  └─────────────────────────┬──────────────────────────┘  │  
│                            ▼                             │  
│  ┌────────────────────────────────────────────────────┐  │  
│  │              Custom Output Style                   │  │  
│  │   (Defines target role, tone, and verbosity)       │  │  
│  └────────────────────────────────────────────────────┘  │  
└────────────────────────────┬─────────────────────────────┘  
                             │ (Injects into agent loop)  
                             ▼  
┌──────────────────────────────────────────────────────────┐  
│             CONVERSATION CONTEXT LEVEL                   │  
│  ┌────────────────────────────────────────────────────┐  │  
│  │                    CLAUDE.md                       │  │  
│  │   (Project build targets, test execution commands) │  │  
│  └─────────────────────────┬──────────────────────────┘  │  
│                            ▼                             │  
│  ┌────────────────────────────────────────────────────┐  │  
│  │              Path-Scoped Rules                     │  │  
│  │   (Conditional file-type rules loaded dynamically) │  │  
│  └────────────────────────────────────────────────────┘  │  
└──────────────────────────────────────────────────────────┘

Because output styles sit at the system prompt layer, they define the structural boundaries of the session.5 CLAUDE.md and path-scoped rules then provide the specific project-level details needed to execute tasks within those boundaries.5

### **Integrating Styles with Custom Agents and Skills**

Output styles can also be integrated into custom agents and reusable workflows.6 When defining a custom subagent in .claude/agents/, developers can use the skills and mcpServers frontmatter fields to pre-configure its environment.30  
While subagents do not support direct outputStyle keys in their frontmatter, they inherit the global session style.30 Alternatively, developers can simulate specialized behaviors within subagents by configuring their tools and disallowedTools fields.30 This allows organizations to build multi-agent workflows where each subagent has a restricted toolset that aligns with the active output style.25

YAML  
\---  
name: security-agent  
description: An isolated subagent designed for executing restricted static analysis tools.  
tools:  
  \- Read  
  \- Grep  
  \- Bash  
disallowedTools:  
  \- WebFetch  
  \- Agent  
effort: high  
isolation: worktree  
\---

For modular workflows that require occasional execution rather than persistent behavioral changes, developers should package instructions as a reusable **Skill**.7 Skills are stored as SKILL.md files and load into context on demand, helping save valuable context window space.25

## **name: run-security-audit description: Runs a complete suite of static analyzers and security audits. disable-model-invocation: true user-invocable: true**

# **Workflow**

1. Execute npm run audit-ci to check for dependency vulnerabilities.  
2. Run the Semgrep static analyzer against all modified files.  
3. Generate a Markdown summary of findings under security-report.md.

### **Agent SDK Configurations**

Developers using the TypeScript or Python Agent SDK can load and manage output styles programmatically.7 To load custom styles, the application must explicitly define the settings sources within the initialization options.7

#### **TypeScript Integration Example**

In TypeScript, output styles are configured using the internal settings block passed during query execution.7

TypeScript  
import { ClaudeAgent } from '@anthropic-ai/claude-agent-sdk';

const agent \= new ClaudeAgent({  
  // Load custom configurations from user-global and project-level directories  
  settingSources: \['user', 'project'\]\[7\]  
});

const result \= await agent.query("Review the authentication routes in src/routes/auth.ts", {  
  settings: {  
    // Select the target custom output style  
    outputStyle: "Enterprise Security Auditor" \[7\]  
  }  
});

#### **Python Integration Example**

Because the Python SDK does not support programmatic output style selection, developers must append custom instructions using the system\_prompt preset parameters.7

Python  
from claude\_agent\_sdk import ClaudeAgentClient

client \= ClaudeAgentClient(  
    \# Load settings from the filesystem  
    setting\_sources=\["user", "project"\]\[7\]  
)

\# Use system prompt presets and append custom instructions  
client.initialize\_session(  
    system\_prompt={  
        "type": "preset",  
        "preset": "claude\_code",  
        "append": "The assistant must operate as an elite security auditor. Rate code modifications from 1 to 10." \[7\]  
    }  
)

### **Performance and Prompt Caching Mechanics**

Using detailed custom output styles increases input token usage during the initial conversational turn.3 However, Claude Code uses **Prompt Caching** to minimize the performance impact of these instructions.3 Once loaded, the system prompt is cached by the API, allowing subsequent turns in the same session to reuse the cached context and process queries much faster.3  
When executing programmatic workflows across different environments, dynamic session variables (such as changing working directories, shell types, or environmental paths) can invalidate the cache, leading to frequent cache misses.7 To stabilize prompt caching in automated setups, developers should enable the excludeDynamicSections property.7 This moves dynamic environmental context out of the cached system prompt and into the first user message, keeping the cached system-prompt layer static across different execution nodes.7  
Let ![][image4] represent the total session token usage, ![][image5] represents input tokens, ![][image6] represents output tokens, and ![][image7] represent the prompt caching efficiency ratio (where ![][image8]).  
![][image9]  
For terse output styles, we see a reduction in ![][image6] by ![][image10].5 Let ![][image11] be the utility of the session, measured in developer time saved per token consumed:  
![][image12]  
where ![][image13] represents the cache hit percentage (typically ![][image14] to ![][image15] for long-running sessions).3 Under a terse style, ![][image6] is optimized significantly, raising ![][image11].5

JSON  
{  
  "excludeDynamicSections": true  
}

### **Curated Community Resources and Shared Libraries**

A growing ecosystem of custom output styles and shared configurations exists across community platforms, providing prebuilt roles and optimizations for Claude Code.5

| Resource Name | Source URL | Content Description | Key Practical Benefit |
| :---- | :---- | :---- | :---- |
| **Awesome Claude Code Styles** | ([https://github.com/hesreallyhim/awesome-claude-code-output-styles-that-i-really-like](https://github.com/hesreallyhim/awesome-claude-code-output-styles-that-i-really-like)) 32 | Curated catalog of developer-submitted output styles and role definitions.32 | Quick access to verified, community-tested behavioral roles.32 |
| **Gabriel's Output Styles** | ([https://github.com/nattergabriel/claude-code-output-styles](https://github.com/nattergabriel/claude-code-output-styles)) 27 | Repository containing 13 custom output styles, including Roast, Socratic, Breaker, and Ship It.27 | Diverse prebuilt behavioral presets for review, debugging, and rapid prototyping.27 |
| **Caveman Output Style** | ([https://github.com/carlosduplar/caveman-output-style-claude-code](https://github.com/carlosduplar/caveman-output-style-claude-code)) 5 | Standard and ultra-terse configurations designed to minimize output tokens.5 | Yields a ![][image1] to ![][image2] reduction in output token consumption, lowering API costs.5 |
| **Interactive Doc Learner** | ([https://gist.github.com/johnlindquist/a190887485b2f76ff26dbda08677b98b](https://gist.github.com/johnlindquist/a190887485b2f76ff26dbda08677b98b)) 15 | Voice-first, interactive educational style optimized for document analysis and concept learning.15 | Allows conceptual study of documentation without requiring active code writing.15 |
| **Official Output Styles Guide** | ([https://code.claude.com/docs/en/output-styles](https://code.claude.com/docs/en/output-styles)) 3 | The core technical reference for output style syntax, precedence rules, and settings integration.3 | Definitive reference for syntax validation and system-level folder schemas.3 |

## **Pitfalls, Troubleshooting, and Maintenance**

This checklist helps developers diagnose and resolve configuration anomalies, instruction decay, and operational errors when working with output styles and environment rules.

### **Configuration Validation and Diagnostics**

* \[ \] **Verify CLI Deprecations**: Ensure all start scripts and developer aliases do not contain the deprecated /output-style command.3 If present, replace them with /config configurations or direct edits to settings files.3  
* \[ \] **Confirm Local Workspace Paths**: Confirm that your active settings are stored in .claude/settings.local.json to keep personal preferences from being committed to the shared repository.20  
* \[ \] **Locate Correct Policy Paths on Windows**: If managing enterprise systems, verify file-based configurations reside in C:\\Program Files\\ClaudeCode\\managed-settings.json.20 The legacy fallback path C:\\ProgramData\\ClaudeCode\\managed-settings.json is fully unsupported.20  
* \[ \] **Audit Rules on Windows Filesystems**: Ensure all glob paths declared within custom rules use forward slashes (/), even on Windows environments.14 Backslashes are treated as escape characters and can break path matching.14

### **Session Integrity and Context Compaction**

* \[ \] **Inspect Loaded Context**: Run the /context command during an active session.33 Use the resulting category breakdown to confirm that your custom output styles, memory files, and active skills have loaded correctly.33  
* \[ \] **Prevent Rule Loss on Compaction**: Be aware that path-scoped rules and subdirectory-level CLAUDE.md files are discarded during conversational compaction.8 Ensure that critical, high-adherence guidelines are defined globally or within the root-level CLAUDE.md to keep them active after compaction runs.8  
* \[ \] **Account for Read-Only Rule Triggers**: Remember that path-scoped rules trigger *only* on file reads, not writes.34 If a rule defines conventions for creating new files, place those instructions in your main CLAUDE.md or keep the ruleset unconditional.34

### **Performance Optimization and Error Resolution**

* \[ \] **Prevent Context Thrashing Errors**: If Claude Code stops auto-compacting and returns a thrashing error, check if a tool output or read file is too large.17 Clear the context loop by executing /clear to start a fresh session.3  
* \[ \] **Check active permission rules**: Use the /permissions interface to confirm that your active permission modes do not block tools required by your styles.21 Allow rules will fallback to prompting, but explicit deny rules block execution immediately.35  
* \[ \] **Resolve SDK Loading issues**: If custom styles are not applying in programmatic SDK pipelines, confirm that settingSources is set to include \['user', 'project'\].7 If this configuration is missing, the SDK defaults to loading the base model preset without applying custom local overrides.4

## **Future-Proofing Recommendations**

As terminal-based agents continue to mature, maintaining organized, clean configuration boundaries is essential for ensuring reliable behavior and high instruction adherence.3

### **1\. Structure Project Rules for Prompt Caching**

To optimize context window usage and improve response speeds, organizations should move large formatting rules out of the main CLAUDE.md.7 Keep CLAUDE.md under 200 lines, using it primarily for core build commands and basic directory structures.7  
Specific styling guidelines and file-type conventions should be moved to path-scoped rule files within .claude/rules/.25 This ensures that instructions are only loaded into the active session when matching files are read, saving tokens and preserving prompt-caching efficiency.25

### **2\. Transition to Plugin-Based Style Distribution**

Rather than manually copying files across different machines, engineering teams should package and distribute custom styles using modular plugins.3 Storing styles within a plugin's output-styles/ directory allows organizations to bundle custom roles, skills, and lifecycle hooks into a single, version-controlled package.3  
Setting the force-for-plugin property to true automatically applies the target style when the plugin is active, establishing a consistent development environment for all developers.3

### **3\. Implement Centralized Enterprise Governance**

IT and security administrators should manage tool access, sandboxing controls, and styling defaults centrally using system-level configuration files (managed-settings.json) or server-managed policies.9  
To streamline deployments across different development environments, administrators should use drop-in configuration folders (managed-settings.d/ directories).20 Following standard configuration conventions, these folder structures merge independent policy fragments sequentially based on their numerical prefixes (e.g., 10-telemetry.json, 20-security.json), providing a robust and tamper-resistant framework for enterprise governance.20

#### **Works cited**

1. Pair programming with Claude Code: using output styles \- Shipyard.build, accessed May 29, 2026, [https://shipyard.build/blog/claude-code-output-styles-pair-programming/](https://shipyard.build/blog/claude-code-output-styles-pair-programming/)  
2. A practical guide to output styles in Claude Code | eesel AI, accessed May 29, 2026, [https://www.eesel.ai/blog/output-styles-claude-code](https://www.eesel.ai/blog/output-styles-claude-code)  
3. Output styles \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/output-styles](https://code.claude.com/docs/en/output-styles)  
4. Support Claude Code's \`outputStyle\` setting in system prompt composition · Issue \#544 · YishenTu/claudian \- GitHub, accessed May 29, 2026, [https://github.com/YishenTu/claudian/issues/544](https://github.com/YishenTu/claudian/issues/544)  
5. Caveman output style for Claude Code: 40% fewer output tokens, always-on formatting · GitHub, accessed May 29, 2026, [https://github.com/carlosduplar/caveman-output-style-claude-code](https://github.com/carlosduplar/caveman-output-style-claude-code)  
6. Add output-style feature similar to Claude Code · Issue \#5199 · anomalyco/opencode, accessed May 29, 2026, [https://github.com/anomalyco/opencode/issues/5199](https://github.com/anomalyco/opencode/issues/5199)  
7. Modifying system prompts \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts)  
8. Explore the context window \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/context-window](https://code.claude.com/docs/en/context-window)  
9. Claude Code Security: Top 6 Risks, Controls, and Best Practices \- Checkmarx, accessed May 29, 2026, [https://checkmarx.com/learn/ai-security/claude-code-security-top-6-risks-controls-and-best-practices/](https://checkmarx.com/learn/ai-security/claude-code-security-top-6-risks-controls-and-best-practices/)  
10. Claude Code Admin Settings Guide 2026: Permissions, Auto Mode, and Bypass Controls, accessed May 29, 2026, [https://vantagepoint.io/blog/sf/anthropic/claude-code-admin-settings-business-guide](https://vantagepoint.io/blog/sf/anthropic/claude-code-admin-settings-business-guide)  
11. Explore the .claude directory \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/claude-directory](https://code.claude.com/docs/en/claude-directory)  
12. Plugins reference \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/plugins-reference](https://code.claude.com/docs/en/plugins-reference)  
13. generating-output-styles \- Skill \- Smithery, accessed May 29, 2026, [https://smithery.ai/skills/Emz1998/generating-output-styles](https://smithery.ai/skills/Emz1998/generating-output-styles)  
14. Skill authoring best practices \- Claude API Docs, accessed May 29, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)  
15. Interactive Documentation Learner \- Claude Code Output Style for voice-first technical learning \- GitHub Gist, accessed May 29, 2026, [https://gist.github.com/johnlindquist/a190887485b2f76ff26dbda08677b98b](https://gist.github.com/johnlindquist/a190887485b2f76ff26dbda08677b98b)  
16. Output styles \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/it/output-styles](https://code.claude.com/docs/it/output-styles)  
17. How Claude Code works \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works)  
18. claude-code/plugins/learning-output-style/README.md at main \- GitHub, accessed May 29, 2026, [https://github.com/anthropics/claude-code/blob/main/plugins/learning-output-style/README.md](https://github.com/anthropics/claude-code/blob/main/plugins/learning-output-style/README.md)  
19. The Complete Guide to CLAUDE.md: Memory, Rules, Loading, and Cross-Tool Compression | by Bijit Ghosh \- Medium, accessed May 29, 2026, [https://medium.com/@bijit211987/the-complete-guide-to-claude-md-memory-rules-loading-and-cross-tool-compression-97cc12ed037b](https://medium.com/@bijit211987/the-complete-guide-to-claude-md-memory-rules-loading-and-cross-tool-compression-97cc12ed037b)  
20. Claude Code settings \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/settings](https://code.claude.com/docs/en/settings)  
21. Set up Claude Code for your organization, accessed May 29, 2026, [https://code.claude.com/docs/en/admin-setup](https://code.claude.com/docs/en/admin-setup)  
22. claude-code-best-practice/best-practice/claude-settings.md at main ..., accessed May 29, 2026, [https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md](https://github.com/shanraisshan/claude-code-best-practice/blob/main/best-practice/claude-settings.md)  
23. Best practices for Claude Code, accessed May 29, 2026, [https://code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)  
24. How Claude remembers your project \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)  
25. Extend Claude Code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)  
26. Claude Rules vs CLAUDE.md: Pattern-Scoped Conventions Your Team Is Missing, accessed May 29, 2026, [https://www.groff.dev/blog/claude-rules-vs-claude-md](https://www.groff.dev/blog/claude-rules-vs-claude-md)  
27. I made a collection of custom output styles for Claude Code : r/ClaudeAI \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeAI/comments/1sbkl87/i\_made\_a\_collection\_of\_custom\_output\_styles\_for/](https://www.reddit.com/r/ClaudeAI/comments/1sbkl87/i_made_a_collection_of_custom_output_styles_for/)  
28. duthaho/claudekit: A verification-first engineering toolkit for Claude Code. Built for senior ICs and tech leads who already know how to ship production code — and want a workflow that keeps the discipline tight without getting in the way. · GitHub, accessed May 29, 2026, [https://github.com/duthaho/claudekit](https://github.com/duthaho/claudekit)  
29. Commands \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/commands](https://code.claude.com/docs/en/commands)  
30. Create custom subagents \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)  
31. Tools reference \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/tools-reference](https://code.claude.com/docs/en/tools-reference)  
32. hesreallyhim/awesome-claude-code-output-styles-that-i-really-like \- GitHub, accessed May 29, 2026, [https://github.com/hesreallyhim/awesome-claude-code-output-styles-that-i-really-like](https://github.com/hesreallyhim/awesome-claude-code-output-styles-that-i-really-like)  
33. Debug your configuration \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/debug-your-config](https://code.claude.com/docs/en/debug-your-config)  
34. Your CLAUDE.md Is Doing Too Much — Here's How to Fix It | by Frontend Master \- Medium, accessed May 29, 2026, [https://rahuulmiishra.medium.com/your-claude-md-is-doing-too-much-heres-how-to-fix-it-2cc495ed3599](https://rahuulmiishra.medium.com/your-claude-md-is-doing-too-much-heres-how-to-fix-it-2cc495ed3599)  
35. Configure permissions \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/permissions](https://code.claude.com/docs/en/permissions)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACQklEQVR4Xu2VTaiNURSGX6EISbeUEPlJBkL+MtFVyITkp0QZGygxIK6iZICUjISSgYnISCkGN4owMTIxECkxMMJMvM9d3+6cb519LwNm562n831772+ttdfaax+pr/+r8WammZonkqaYiXnwX2i6uW8umjvmgBnXWhFapFg3J08UYeimWZYnrCXmgrlm9pnJ7WkdN3fNBDNgnpsnZquZZRabk+az2d580yOiPmG+m1Vpbpd5Y1YoUn3WPFIEjUjvY4WTImxtMINmv9lrDpsrikCrWme+qjeIueatwlDRDPPKHGre2el7RTaKeN7W9c5ZoUxjluG6ItU5CJznMbJ22wwrMjPNPFU7iGNmU/PM+vP6QxmOKlKOkeyQ9OUxdMt8Mgua90uKwLDHeblqZjdzm81ljVGGtQoDtEwtCJzlsdr4PEWJhhQO2Rgi/fea36ooAyWY37znIEj1cBorykEgMsCulysyws4JqJSBeTqLLlvIAIuOmD3NApSDKKc+O0O1ILJwXspAptnwabPU3GDBSnXKUJSDQKM5G228KJdhvaLLyhni/tBB8yHxzfwyXxSnnbY6p7ozgvioeq1zGRBnhDamnVHtuxHVMoGhn+q0G5pkHjTwnNVdhiJsdwdRfnvEjffDrOkaGzAvzZmuMe5/ssAtmMUOuZTIYrd2qh1EzuzILikBpQB2/kwdQ6vNO8UFtFvRilw++Z+wlIEOyeLmfW02KpriVHv670SnbDE7FAZrGlQYx0lNZPiFeag4a3311dJvtXx4ur7+UsgAAAAASUVORK5CYII=>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAWCAYAAABOm/V6AAACLklEQVR4Xu2UP0hWURjGn6gGyahIBMlIzIaGkJCKljAo0EEHJRCD1toioSQVnBoqhIgG0UAaGhK1wcXBIRSMCMTFySXbamgIdTN9Ht5z8Nz3u97PIbfvgR/3nvOe+973zzkHqOhwdZTUkmpvcDpBjvvJ/6FT5DN5TSbJA3Iks8LUBFtX7w1RcjRBriRzykpz92Ef1jlOh3X9ZIocI2fJV7JA2sK6S2SA/CKd4ZsSKernZJO0JPNysE529uEtrLzzsJ9Eydct0gpLoIc8hq1XoLm6Qf6gNAi9L5MxxyxZJRewF6iqEaX3jmSsvaI2FbZhHObcByFHD5OxpE01Su6G8UmyiGwQz8id8K4qv0SZNvSRbpgTH8Rlci4ZSwrqKbIbb4R8DHNVsCDjdwr2DQracB3mQNnlBeF1lczAqpdKbflOBmE/VGKSyj8dnrmSI7WgIYzLBaFAP8E2WZ5UAWXdDKuIMldAsQ2y95JX5KImtOgJuRcWSOWCuEl+wFp0EOnnsQ1KQAkPw75/rwUqa2xDVFEQCvodrORnnC1Pvg1KYI00hrHuDzwiPx0bsLP/G7bbdayiamBH8gvKX8u+DZL2iI6xjrO07x4pqoT6/Bd7t2KR0jZEyXcaRHyWSDfeFrnmDbAz/4988AYnZahLKa2i1IVsECWJ6gdqQbyKt8kSso7ag60oiNiGeImlOk9WyG3Y/hrKmg8mbeBWFJQRZpfz9BJLpQp/I3PkhbNVVBF2AdZjbP8T9QNaAAAAAElFTkSuQmCC>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACkAAAAZCAYAAACsGgdbAAACJUlEQVR4Xu2VP0hWYRTGT1RQKIQIgaDwIYI4iIGaKAoN0ihSBqKLtCji4B8wFARFHNQKdAo3iTaHloZQwsnBNgcXh0gCwcFB0k30eTzv63fu9f2uot8gch/4wb3n/XOfe877RyRVqruvDOiMB40qwRxYAl3gabT5XCVgQrTPFKiINl/SAzAI+uINVlWgH/wCJ2A52nyht2AbvACFYBqsgmemz0sXawE14Ac4BSOiZkJqAEfgQ7zBiibbQRP4J2GTZWAHdJtYEfgNBtw7s/odvAcPXawYbIqaqHUxK/4gk8MfSTTpxTL9lbBJmot/iJn5BtZFM+vHH4pm0Wtc1MSwiVEcz9i8XCOTXkkmF+WySYp990A5eAwWwE/Rubz48VCmWOaPoFHyZJKxXCZDca9HYEV0rb8ycZaZGysjOvbWJlnKdQmbucqk3xQ0xExTLPMQeOfe82KyAKxJ2EySSWaL476KzuHFE+CTZE3nxSSVy0yuOA18AZ8lepayKoxnTCxvJmckbIZ9eWyVmpg3OCbZo4jH3GtQDbbArmFfdGP9d++tbkxQSSbbRBe/neCJ6GFN+ExxvY2Irjk+e/WCN+bd6kaZ5NlnP0AVix7KkybG645Z9Ncox/SAYxe32ToAza5fXPWiY3ie5hSzw0mZKabdp55lYXm86sAfMAo6RG+bWcluAP+Tfg6LP0utnoMNiX6XpU8s93XEXcq1xWuUV2WqVKlS3WedAbM+jKoPW563AAAAAElFTkSuQmCC>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACsAAAAaCAYAAAAue6XIAAACDElEQVR4Xu2WTShmURjHHxkiLCZiMTRIU1JjgZo0pZgys5AiNRplaoqtWYmlkr3MRkqS5KOZBWFWyMJCyU6pKdnZWEyslPH/z3Nu93Tcy315u73q/urXe9/nPLfOx3POuSIJCc+TVvgHnkX0g74WP1lwCi7BSvOfzMAb+NH8z4Yt8BQ2mVjslMFlWGrFXsID0Y69suKFcB6WW7FY4ZJ+d2L18C9chS+sOAcxCYusWKz0wDdO7Av8B4edeDEcEL9UMgLW6zV87zZkGmH1mpE0wCu5W682uTDHDYYQNZf75ATuSQp7IqxePTiARdjhNgSQSi4ZFN3AkeDGmZX765VH3T6sdRsCSCWXA+NqcrIi8VC9foO/4LnooN6aOJf5s2n7IXq5hOXmi84gz/Yu0bIjJXBbog3sP1Hq1V0qdpQd7BVdGd5u7IjXKTuXl8q66K3I3AU4btq4kruiExYKz9hDeCFaq56X8Fj8kRNvqTgjHpxRzgg7Qph/BCskOHdDdCB5cA1+Mm3uwJ5M0FLNiT87hDW3A19LcO6oeWaZcedXyyPqNQpcqt+iR0sfrBK9QL6ads7YCuwOyWVnvZOBpbAJ22Cn6MCaRWs9LdSJztqI+F9jjXAL9otuJF7frMeg3HbRD6EhOC363gSsgT/hGHxnctMCa43a8POR3w38tQnK5YYsMM/2hWHHExIS4uYWny9nP5pp8xsAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABsAAAAaCAYAAABGiCfwAAABcElEQVR4Xu3VzStEURjH8UdeylvyEokkxUahpChSUmwoC6VsFCmRYqOUIv+B7CgLC5GdIrFQ7JStlZI/wEKsFL5Pz7nN6U6Tue4oan71aeY8c+fMuee5945INv81A3jAU5oG7WvRk4NtHKLRjTW7+MCwG+eiH4/ocrXIqcERqr1aOW7FJq7z6iXYR71XixTdkqVQrR0vOEaeV9dFbKHUq0XKOFpCtUl8YiVUr8SsJLY6I9F+vaM3/EGmk6pfv5JOvElyv/y0YUIysJ2p+uVnTqx3saIr3ZM/0q9ibGAHZa42InaftmIGZ5iSNLb4u36NoUNswh6xBU1jFeeoQC2u3GtS9B67w7NYrwKvuBdbQJBmdONCbBd08gacYNQdo8ffoMqNY2XdCaJnd40mN14Qe8rEjq5WV61nN49CsQvpVOy5qfR9Hxbd8T+OPq4usSk2oWZZEmeqP3aANQy5Wqzki12VQQpcLYj+FRV542yySS9fTNJD0eHAacAAAAAASUVORK5CYII=>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAaCAYAAAA5WTUBAAABvklEQVR4Xu2UzStEURjGH6HkI/mI5HOlrJAsSCkRFjZiZSdRdhTKSlkqReyUhSzIEoliYakkJSslf4CFWCk8T++5zXXNmMncmSzmqV9zznvOnXPOe57zAhllFF095IE8JUivfRaessgG2SMNri9tkQ8y4PrZpJs8knYXC02VZJ9U+GIl5Aq2YLUvXkh2SI0vFoqU2plArJm8kAOS44trc+ukyBcLRaOkMRAbI59kIRAvI5OIXFlKJT+8k67gQLoUyw9pVRt5w08/hKF82CuLq1h+SFbF5AR2yF8lw20jNX7Qi7sk5cGBoBLxgzaqAqZ6IVpdrJ8ckxY3T7VkHFZb5sgprNqukVo3J6ri+UGLzZNF2N1qIaVYWRtx8SU3dwpWUzyprVhUqUZck2eYFzxeyT2+32EHuUUkS1XkhvSROlgmtCFtdpcMu3nK8DlCKvcyqz9LWvAOtilt9gy2oO79gjS5efpVP64fEtEsWXFtnXYVdj1qD8FOr7ZOrJN3kkHYi9NYLpmGvZQ/q54cwkq3DKZN6Y+9sSMyQTZhL2EZ5htdl7Ikz8jISUsnLUVkcb8U806Z5/BUgOjfZJTR/9QXEhBRfikWWVkAAAAASUVORK5CYII=>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAaCAYAAADbhS54AAACOklEQVR4Xu2WXWhPcRjHH0mRt4mGmrbYDYqLzQVRSGJXwoXahSIvtyib15SUG4qb1WKZcoHWlLdI2maN4saNxJUStcu1XFixz3e/c+x3Hn/HavufC/atT53zPL/zP7//8/Y7ZpP6TzQLNsJuWA5TE/tMqEquC9UKeAmDcBuOwk14CivhMWz5tboATYPT8B2aYUbWbRtgAD5bgRHTplpgCHY5X6rp8DBB14XoMPyEEzDF+WK1w0lvLJdq4Qt8hCXO53XNCqyvcxaidcHZS2muhbSXXRoJXfDDyhMJlcU8Gx01sfTuP9bqYvgEX2Gp841X6upWeAaXnO8AdMArmO98I0o3JnSdJzXIOm/M0Xq4D02wNbIrgpqJBy2MpZKloUWv7e8b079qg0rvyJEG81VvRKvhBSzwDi+FWTW2zTsSqU70Ej/f9EdOwQPYa6NjpgIuwnt4A+dhTuLbb+Hk6IfrsCqxl1Q1fIAeWOR8qpOzcMSy860eui08K7tevjDyq7AfWUinl1I7lgkwohrog29ww0IErlgI+WbLbio9Ae7AHrgM+9waHVkqbN9QWnMLGp09V3qoBnYkLLPSba4UvoNN3hFJkXoCs51dNf0c1jj7hEhF2wt1kU1fHUpfKkWkPbpPpQgqM3mNNi7ttHDoK5Vqnu2WTaW68VB0n0pDvNNyButESD+uMeLrTw10D9ZGdpWE0njMwhFYqLQpRUOb0sSPv+c0Jt7CXQtpL1wNcNx+HzuqrTOWjeKk/n0NA4hCVXgoPE94AAAAAElFTkSuQmCC>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHIAAAAaCAYAAABreghKAAAENUlEQVR4Xu2ZbahVRRSGl6iZqJlmSSB4VejDHyKU9C8kSkhKQ4ukRLQQNemDQIu+/mhEidEPQ5AEFYr8iH5JkaFBoIWgEWUQiBiBaIQIBaKUvg/LDbPnnn3O7Dn3ci66H3i53JnzMXvembXWzDFraGhoaLiBGS7NkJ6Q5knjg75p0qjg/xua0dIz0jbpA+nucnfPYFzrpH+k4+Zje0P6QXpBekr6Qrq5eMN1AM+8XLo1au8Iq/uAtEEaK82WTkiLwxf1gHul38wNnBn1jZR2S/+bGzvUGCY9IB2SXo/6WjFRelraIZ2XTkt3hi9I4TXpqDQhaHvWfBInB23dMs48RKZwv/SX9K2Vw2jIw9Kla3+HCjzfQ9L30ibptnJ3JRi50Py5P7cMIzEPE3dG7XPMw9mCqL0u4crcbB42OnGH9It0Uuord5W4T/pZmhJ39AAixBLz8bwl3VLurgVe1DaS8PW39TeSSfpXejdqT4WVyQojl/FgqSsT4wnxV8wjRTsY42fW2/zIwnxO+kl6XhpT7s4iy8jCsCoj4/ZOFCvzmPSy1X8wKtA/pTPS9Kgvhu+qCruDDTtuvflz8ryMZaDIMvJx89UfG1bXyHBl8jclhLaCUM549tvg7DQ+k4IuhghCmiEidIJcT+5mjGFdMVBkGfmodWckO46dN1Ark3DKeHJDejsoiph8quDweEVO3iv9aB4eU8gtalLIMrLKsKr2mBXS79IiS69I21EY2Sk/8pAbpZvijgpGSHukV6R3rBySqdDJtW9Ks4L2FNjBRTG3xWpOfgVZRpKHyEexYYWRKWe0cFcus/ywCkxqipG8blXc2AaOUUfMi7uYT6zeZ7UCQ1kEX5nPZTcXKllGki++s/45KeeMVuRJLhNyCh1gAs5KX1v1gugzv4EKdxXRYL75gRqFRxLSxz7pgvSp9Mi19j7zXcRC/kZ61dJ3eDumSdvNTcVcTK5DlpGwVPrDfADAF3ME4OiQUxXGR486Zyq+m2rwsvk1VTwJTMyX0tSgjbz8sflVHq/nDLwy6AeKOswkxIYwWYetc4WcA5/NQnk77ugARlK51z4fMxFbzeM8l9KY+Kv5VV035BYEvO8l6aJ5YYKx3KtSKX5k/RcGUeOctFpaYx4q40kgRbQqoDD9oA1O9VkHCi7miUsYUgv6z9xQnisZVvJd0pPSg9Z99RnCZ7OTPjS/ikqFUD/XfEz8bXVsAPIpu7RqzOxCdiMFWQy5lnAb7/yGHkChQjgqIB3cE/zPbuNHAQq4GHZpp8KqFfwyQehMUdUCbIjAOIoLQtBa6X0r73wqVdLGpKAN2PHs5DoFHfA+8jEFV4o4XzckQmgkB4eVN23sxsfMz4lhocMu6TM3uCjyGoYoc6VT5hcBxZEDMJwiapf0njX5cchzu/mPupwjQ7PYmRQ5L1reWbehoaGh4frnKlmbwzH3Ea7kAAAAAElFTkSuQmCC>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAAxCAYAAABnGvUlAAAE5klEQVR4Xu3dSah3YxwH8J8MGTNmyJgMGQqZJUqEBQtTCvVKKLFAxihDFpLMOyULkWEhkSiuIRYKOyUyJBYWSqxkeH6dc+553ue9/ztP3j6f+vU/5zn/7j3vOYv77fc857wRAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAsGjbtgObia3bAQCA/6NjS+3cDq6xo0pdEmOQPKQ6thAZ2C5qBwEAtij1dKmD+u1nS53XHzuz1In99nrweKn7qv2vYuxK/RvdvyO9V+rufnslnVXq9Wp/91KfxNJCV177HdvBRajva1rP9xUAmMPZpW6u9n8vtVW/vWupnapja+3NGLtYe8QYbHYo9Uupg/v9u2LhgWT/diC6ADbJr6U+bAeLC2Lp1+zVGO/BJHe0A436vh4T6/u+AgBzuLTUYdV+dqoGGViyU7MeZFCru2ZHVtsZ1KZiDHDXltpz+uj8XBkbryHbu9RJ1X4tv/dPzNxJy8C2VD+U2q8dbMwV2Or7ekWs3/sKACxQdl6+bwdXwL2lfpyldhu/Ou34Uqe3g72HSl3YDi7CjdGFsdnCWsqw9GQ7OE/tdGe7nzKwzRX85gpstc9ide4rALAKMhTldFxtm5j89OJsx76O5Z12y3PLamXgmYpxOnSQDyYs9OGE7Dq9XOqN9kDj+ei6VguVnb/XYpxqzWnLL0odPv2NTga29ufndd6r1D59PVhtZ83WUfwzNr2v87F9OwAArK0MK8/Fpl2sT0sd0YwNZjs2W0DIkFWHjba2HL86bVJgy85aPd23FDkNeXKpDTE5iKbs6M3UAbun1DntYOWj6NbeDfL6zWQ5O2x5X/+KTe/rXHLdW54vALCOZBjKTky72H2Y+ssA80yMXajtqmPHRTeNmIFnCAYf9J/LJYPO9e1gdN21fOCgdn50693yXG8q9U0/np2xSfLcT6j2N8Tk0Jbjv0XXIUv5e86NsaOXnxf323kugwx6tUmh9tuYHIQH8w1sQ9e0vq95vnl9Mhi/Hd09G9YHDtc47+1M1xsAWAO5MP3z6LpUWX/E2MnKP/LDwvrLS73fb38Z3VOVw7EX+88MGTltlxa7xmuSDBn1z8yHEH6O8bx/KnVrf+yAUm9Fd/6HRtc5zK7eO/3xmeS6ulr+vsuasdojpf4udUN0najbqmMZdK6KLlQNIS5/XjvN2Qa4wVTMvLatNldgm+2+nlpq334772V2BfN65Tm+0I/nq1EW+qQtALAGsvOS69DyCcp8j9eG6Dpr2T2qj03F+N6vq6MLbqfF8vs4xneJzSaDXQaao6N7kCKDSu5nQDqj+t5KqYPlgf1nrrHL6d7BcF6tfOnufF68u5Tre0v/mffs9v4zg1oGtAxq2RXM/ewkLnQdIACwyvIN/vlOswxJOV2Y02fZrco/8PWxXAD/cKmXonv31y6lHojll+vVXmkHZ/BoqaeiO89ci5WhI7tvj8Xkac7llCEtu2kZEjPgppw+rf9LrQy19Xq2wf3RnfdKyvO7rtQTMV6PfMddTnlntzCnh9+N1Xn5MACwGcqAcUo7uM5dExsHze+iWwfYymlKHS0AgDWQ06G5bmxwZ2z8MAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAME//ARoKm4QvqMNlAAAAAElFTkSuQmCC>

[image10]: <data:image/png;base64,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>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAAAaCAYAAAAAPoRaAAACnElEQVR4Xu2Xy6vNURTHv0J55nEVikR5RdctyVunyEARZUBmhOveJN2kJJEMlHcx8MijkEeZeOQxIP4BA5QYmiiZYEDi+7X27vxa7X0kJ7q/+/vWp/M7a6/9O2s/1tr7AJUqVeqJOki+kh8FnpNJoX0e+VRo+046QlspNJK8Ja/Cs1cvcolsJb1dW7fXAvKNXIYN1GswuU4m+IYyaDNsS+szpankBhnkG7q7tNJa8c9kpmuLWkH2e2MZNIK8COg5pWOwCSidZpEv5DzS+a6tfhU9NN81aA3+X+d7K1mD9II0RTHftfLaASn9r3zfQjZ5YzOl1XwMO+Nz5/sRUnP2UmggeUSews5yr9nkDOnrG2A3Px1/ah8TbLoALSMXAtEupfxTdsW0L3wfUvBTMd5DbpMu0p+MJ1fIajKfXIMV52K/hmonH8h0Z1ca6IfGObs0jZwifchhsh42QSfJDtiOUf+NDfxz9lWkjdwjc4OfYrhDJobvu2C3TbGUvEHd9yJZHp5/KwV9iHwku8kGch+2GqMKfkUtgd33deWtwd4h23vYZCpfz6K+win/nF0DnEMekmGwiVHB3WldfknP6iNfFep4UimNH8De+0caS1bCZi2V/0UpyLWwevGOTIYFdCu0eaX8G9n3BqTR5CXsCi5pMm7Cfk8D1sDXhTbt3ifI31f+WjXyGhaU6oRWRbmnFdCWi1LeTUHeP2dX4M9gq98J2/KqSXHLK1U0QNm1M7RD4s1UE3KALCaLgq2p0j3/BKzIHIfNulZAgz0H2/YKWn+Vhzfwz9lbYEVYx+vCYNtOTsOOPhW4+Hd7BrmLeoFTITxKtiG9A5siVXUF6f/exuD7OXvOP2dX4Kr6RemdQ51N/QY4m/opjkqVKlWqJP0EFGd98LaYlA8AAAAASUVORK5CYII=>

[image12]: <data:image/png;base64,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>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAC4AAAAaCAYAAADIUm6MAAACQ0lEQVR4Xu2WTahNURiGX7lE119R3CSlDEQkJmRAGVyDexMTkqmfKDEhXDFQKAaKKBMDrm5i4GekkIlMjBgxUMrIgBGZeJ++tex1tiPHcdNJ+62n01l/+/u+9a61t9SoUaNGjf4HzTCbzIL0f5JZbYbM3Dyo1zTNXDWnzHuz09wzu8wx88ls/DG6hzRodpsV5rN5ZGamvgHzzhxO/3tKexVBbzHfzIaib4n5aA4VbX8rdvim+WLW1fq60kXzVq2eHjZfNU4PKERBnpv59Y4/1XTzzNw2fUV7u2TGQxRkTK3P6krtLMGWPlFrMnPMCXNfcXi5fSaareaO4mCvLcbTv83cNefNvNROQS6bM4q1lqd2NFUxh+cyJ5+3tsr+Li1RT2aheWAWm/XmlWKrL5n9ZoI5qipRgqZvuyLhl4orNxfkuCJprtzrChEkSVIItFkx55c6qQiEB2SV/iaQUVW3yxQzy6wxL1RZiUrmRKnaY0WgBDg7/db9zZrMQ9xubxQ7R/tvK04gPKDUaVX+5lp8rZ8PKYvfUFSb+Q9VjaGKrFFX6W9swTuDKxkx56xiva5U9zfBU6VlxZilZkTVLtDHGHaBal8z+1Ifwt/YjWTKOU/TL3aj8uU7I8/pWIvMB8XWISpw0FxQBMUW4j0OFcntMVcUL69zCjvwyYBfGU8wRxRWpMJ5V1amMQcUnxsEecvsKOawKx2LreNVv6rWnr1dCt9ynSIO5ORaX/Z2Vr9arcB45mUxlgTLto7FwmUAjRo1+sf6DtAXYMMbA3c5AAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACWUlEQVR4Xu2VS0hVURSG/6igqKxQlKKwGvTCQRAqTUSloAZFlFBYZCMbNopMKIJwoERNDMGJGTQIimhQEApJk15SBD0gaBJEI3FiQonl/7POdu+z7z0HI5ydHz7OvWu/1j7rcYBChRZPK0k7GSR9ZEd6OFcV5Dxs7WWyOT2MFeQMqUt+LyWbSCfZ4qeltZaMkGtkNdlDPpHj4aQM1ZKn5CDZQJrJe3IsmLOOvCJ/I66T5cG8lC6SN2R9YDtFPpOawBZrCelH2gFJDj6HXVbSRR+TD+QruU0aYevLSo7IoeHIXk+myJHIHkqHjZGzaTP2knH4C2me9tebXJB2kQmUOqWNf5KeyB5qGblPfpMLsFDo9pfIQDIu/bNT7vAsp2J7rAYyCcuR1+QmeQgfOklO3SM3YCH8Th4hJ8kPwzaMD1+oU1IL+QWfwFdg1ewkp1QMJ2BvUqiovsAKpUSH8H9OqVLfkqOwsM3C9rsD75icWJM8nZSz0+RqYJtX1uFZ9lDVMIfC6ttN3pE/sCrMktt/lKyKxrCN/EDp4W5Rd2QPpbesHKmK7Ko6tRO1GqmXzJAD8zP8/mOw8Kbkylp9RN3WaT+sqvR0UvJuhA+D8jHub5LG75JzyX9dWGENnXLhG0JGvzpNvpGtyX+XiC/hq6gS1qmV0PsSmz4VsimBQ+0kL+D3O0m64A/XU/mnqlX1lpX6i/rKM1jCyqGPsCR20ht9gtKKkYMKvxJbhytUCl1rMEf73yIPSAdsrnqjwp8reb+dtJEm5HyTykhztSZvbbh/M9KpUqhQoUJZmgM9u3fghjy0PgAAAABJRU5ErkJggg==>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACRElEQVR4Xu2VTUhVQRiG37BA6c9wIUnQtUURuCjCwk2E2KJFEiQYFbWrjSAolLoKokWiLoIK3GhBRKALF0Vi0N1ZtAr6gSKKKFypmxQsst6XmblnZm7npIK788DDvWfmmznfmfnOHCAnZ/2oomfpMO2n+8LuTLbRTpixffbap5JeoA32fwXdRS/RQhIWsp1O0et0Cz1A39HTflAK+2Fiu+hOetle7/ViqulL+idygG7y4gKu0ld0h9d2jr6ntV5bjB6gSJ/CrLTYSMfoQ/tfKO4xfUM/0VF6hG6w/WUoESV0L2pvpD9oa9Tu00KXUT5WDzkLs4pCSSlGK7kiNFATxBMfogv0RtTucxJmG+KxSkrt6herTsrdPJ44rd3nf0mpzoSSekSHYLbwO51ARpGnTbySpOrpN/oASX24mtKcSk4oqUnabuOkXqoPdLeNCTiBtSelya/Qj0ieWgU8hzApxW21vw7V7CK95rWVSLt5WnuMzpwO+pV+oXdgVsGvqX/h5n9GN0d92ENnUH5zN0iH4Wq5hfDtu0l/0eOliGT+Isz2BrizRueITluHXvef9tehQ7YOYf0M0nHbJ9x8/jmlB/6NMCm3fSNIOa/Owyy/Cle4QnyB5GY19DVdok22zSWgYndj9RXQyh+01+IM7UFyc/320nl62AXF6Ki/S5/TUzAJvYX53DiUwBOUvzHddBrmC6Bt+0ybvX6h+W/DrOhFeh9me/WSZaLs9b1qo0eR8U2K0LgCzMNkjfPnP4awVHJycnLS+AufLXsGBlg0ZQAAAABJRU5ErkJggg==>