# **Architectural Engineering of Claude Code Rules: Establishing Consistent Workstation Workflows and Context-Optimized Rule Sets**

## **Executive Summary**

The transition toward agentic software engineering has shifted the developer's primary optimization vector from manual code construction to context window engineering.1 Tools like Claude Code interpret localized repository patterns, settings, and declarative guidelines to make complex edits across directories.1 Within this ecosystem, the global configuration directory located at \~/.claude/ serves as the centralized control center for a developer's workstation.3  
A primary issue in long-term assistant usage is the expansion of CLAUDE.md files into monolithic, multi-hundred-line instruction sheets that consume excessive context, dilute model compliance, and inflate token consumption.5 This report analyzes the technical mechanics of the Claude Code memory hierarchy, detailing how to utilize the global \~/.claude/rules/ directory to modularize personal coding style conventions, security baselines, and version control workflows.3  
This analysis details how global and local rules interact, evaluates a critical platform bug where path-scoping is non-functional at the user level, and provides practical workarounds using programmatic tool-use hooks and custom output styles to enforce safety-critical operations without relying on soft prompting.7

## **Core Best Practices**

Establishing a reliable, token-efficient rule ecosystem requires structuring instructions around the cognitive boundaries of large language models. Rather than relying on long system prompts, developers must adopt modular, measurable, and positive rules.5

### **1\. Granular Topic Segregation**

Monolithic configuration files must be decomposed into single-purpose rule documents.6 Standard practices dictate creating separate Markdown files within the rules directory for distinct domains, such as git branch workflows, UI conventions, testing structures, and database interactions.4 This prevents unrelated rules from consuming the context window during focused tasks.6

### **2\. Assertive, Positive Rule Formulation**

When processing instructions, language models often experience attention bias when presented with negative phrasing.7 Negative prohibitions can focus the model's self-attention mechanisms on the forbidden patterns, leading to unintended rule violations.7 Rules should be refactored into affirmative, positive requirements.7

* *Ineffective Prohibited Pattern:* "Do not use default exports for modules." 7  
* *Effective Affirmative Pattern:* "Use named exports exclusively for all module declarations." 7

### **3\. Strict Context Budgets**

Instruction sheets must be kept compact, with a standard target of fewer than 100 lines for the root CLAUDE.md and 10 to 50 lines for individual rule files.2 Detailed workflows, API references, or external specifications should be moved to on-demand skills rather than being loaded globally at session start.1

### **4\. Measurable and Verifiable Criteria**

Vague directives produce highly inconsistent, non-reproducible outcomes across sessions.5 Instructions should be written with action verbs, explicit scopes, and quantifiable metrics.5

### **5\. Linter and Formatter Delegation**

Developers should not use rule files to document basic style preferences like trailing commas, brackets, or standard spacing.4 These rules waste context tokens and should instead be offloaded to local tools like ESLint, Prettier, or Ruff.4 Claude Code can automatically run these tools via post-edit formatting hooks.10

## **File Organization and Workspace Examples**

Managing global workstation preferences alongside project-specific rules requires a clear, hierarchical directory structure.3

### **Directory Tree Configuration**

The diagram below illustrates how global configuration files in the user's home directory interact with project-level files in a Git repository 3:  
\~/.claude/ \# Global User Directory (Machine-Wide)  
├── CLAUDE.md \# Global developer background (loaded first)  
├── output-styles/ \# Global custom style overrides  
│ └── review-only.md \# Specialized communication instructions  
└── rules/ \# Unconditional user-level rules  
├── preferences.md \# Workstation coding style habits  
└── workflows.md \# Personal git commit and branch rules  
/workspaces/project-repo/ \# Git Repository Root (Project-Wide)  
├── CLAUDE.md \# Team-wide stack overview and commands  
├── CLAUDE.local.md \# User's local override file (gitignored)  
└──.claude/  
├── settings.json \# Team-wide tool settings & permissions  
├── settings.local.json \# User's local settings override (gitignored)  
└── rules/ \# Project-specific modular rules  
├── api-standards.md \# Path-scoped API design conventions  
└── testing-guidelines.md \# Path-scoped testing structures

### **Hierarchy Comparison Matrix**

The table below compares how these configuration layers interact, detailing who they affect, where they live, how they load, and their git status 3:

| Level | File Path / Location | Git Status | Active Scope | Load Behavior | Precedence Level |
| :---- | :---- | :---- | :---- | :---- | :---- |
| **User (Global)** | \~/.claude/CLAUDE.md \~/.claude/rules/\*.md 3 | Never committed 3 | All projects on the machine 3 | Evaluated at session start 3 | Lowest (Overridden by project rules) 3 |
| **Project** | \<root\>/CLAUDE.md .claude/rules/\*.md 2 | Committed to repository 3 | All team members in project 3 | Evaluated at session start 1 | Medium (Overrides global user rules) 3 |
| **Local Override** | \<root\>/CLAUDE.local.md .claude/settings.local.json 4 | Gitignored 4 | Single developer on local clone 4 | Evaluated at session start 3 | High (Overrides project-level files) 4 |
| **Subdirectory** | \<root\>/\<path\>/CLAUDE.md 3 | Committed to repository 3 | Nested packages/subsystems 3 | Loaded on demand when reading nested files 3 | Highest local context 3 |

### **Global User Rule Examples**

The following files establish consistent, machine-wide behaviors for every session initiated by the developer.3

#### **Rule 1: Coding Style Preferences**

*File Path:* \~/.claude/rules/preferences.md 3

# **General Coding Preferences**

## **Language Defaults**

* Format all TypeScript and JavaScript files with 2-space indentation.  
* Write explicit type signatures for all public functions, classes, and components.  
* Use arrow functions for React components and standard function declarations for utility logic.

## **Error Handling Standards**

* Handle potential errors explicitly using pattern matching, explicit guards, or typed error objects.  
* Do not write empty catch blocks; always log exceptions to standard error streams using a structured logger.  
* Verify that every asynchronous execution contains an outer try-catch block to prevent unhandled rejections.

#### **Rule 2: Git and Branching Workflows**

*File Path:* \~/.claude/rules/workflows.md 3

# **Git and Repository Workflows**

## **Branch Management**

* Check the current branch with git branch \--show-current before making any modifications.  
* Perform all work on local feature branches named with the prefix feature/ or bugfix/.  
* Never attempt to commit or push changes directly to the default main or master branches.

## **Commit Message Formatting**

* Format all commit messages to follow the Conventional Commits specification.  
* Use an imperative, present-tense verb in the subject line (e.g., feat(auth): integrate OAuth2 flow).  
* Run a local test suite run using npm test or equivalent before executing the commit tool.

### **Project-Specific Rule Examples**

These files reside inside the repository and are shared with the engineering team to enforce project-specific standards.6

#### **Rule 3: API Design Standards**

*File Path:* .claude/rules/api-standards.md 6

YAML  
\---  
paths:  
  \- "src/api/\*\*/\*.ts"  
  \- "src/routes/\*\*/\*.ts"  
\---  
\# API Design Guidelines

\#\# Protocol and Serialization  
\- Implement REST API endpoints following strict JSON API standards.  
\- Use kebab-case for URL routing paths and camelCase for all JSON property names.  
\- prefix all active routes with an explicit major version identifier (e.g., \`/v1/users\`).

\#\# Request and Response Contracts  
\- Validate incoming requests using Zod schemas located in a co-located \`.schema.ts\` file.  
\- Format all API responses to return standard error or success envelopes:  
  \`\`\`json  
  {  
    "status": "success",  
    "data": {},  
    "error": null  
  }

\#\#\#\# Rule 4: Testing Guidelines  
\*File Path:\* \`.claude/rules/testing-guidelines.md\` 

\`\`\`yaml  
\---  
paths:  
  \- "\*\*/\*.test.ts"  
  \- "\*\*/\*.test.tsx"  
  \- "\*\*/\*.spec.ts"  
  \- "src/\_\_tests\_\_/\*\*/\*"  
\---  
\# Testing Guidelines

\#\# Testing Framework  
\- Write all component and unit tests using Vitest and React Testing Library.  
\- Group logical test paths using nested \`describe\` blocks named after the module under test.

\#\# Mocking and Verification  
\- Mock dependencies exclusively at external network and database boundaries.  
\- Do not mock the primary unit under test; use in-memory test databases or fakes instead of mocks where possible.  
\- Ensure every test file achieves a target code coverage of 80% or greater.

## **Path Scoping and Technical Mechanics**

Path-scoping allows the developer to tie specific rule files to target directories or extensions.13 This keeps domain-specific instructions dormant until Claude actively works in those areas, preserving context tokens.6

### **Glob Pattern Reference**

The table below maps common glob configurations used in path-scoping to their corresponding directory and file targets 2:

| Glob Pattern | Target Scope | Practical Application |
| :---- | :---- | :---- |
| \*\*/\*.ts 2 | All TypeScript files across all nested directories.2 | General TypeScript typing standards. |
| src/api/\*\*/\*.ts 2 | TypeScript files nested within the API directory.2 | REST endpoint response contracts. |
| \*.md 2 | Markdown files located in the project's root folder.2 | Documentation style guidelines. |
| src/\*\*/\*.{ts,tsx} 4 | All TypeScript and React TSX files under the src folder.6 | React UI styling or component guidelines. |
| \*\*/Script/Lua/\*\*/\*.lua 15 | All Lua scripts nested within any path containing a Script/Lua folder.15 | Embedded scripting styles or APIs. |

### **Technical Analysis of the User-Level Path-Scoping Bug**

A critical bug exists in the Claude Code rule engine regarding path-scoped rules in the global user directory (\~/.claude/rules/).7  
\~/.claude/rules/preferences.md  
├── YAML Frontmatter Paths: "src/api//\*.ts"  
└── Operational Result: BUG \-\> Path-scoping is silently ignored or fails to evaluate.  
At the project level, Claude Code tracks file reads and matches them against local .claude/rules/ path parameters.6 However, at the user level, path-scoping is currently broken.7 Glob patterns defined in the frontmatter of \~/.claude/rules/ files either fail to resolve or prevent the rule from loading entirely.7  
**Solution:** Developers must write all global rules inside \~/.claude/rules/ as **unconditional rules** without YAML path-scoping frontmatter.7 Because user rules are always active, they should focus only on general coding habits and workflows to avoid bloating the starting context.3

### **YAML Syntax Requirements for Paths**

When configuring path patterns in project-level rule frontmatter, developers must format the YAML block carefully to prevent parsing failures 5:

* **Wildcard Quoting:** Glob patterns beginning with wildcards (e.g., \* or ) must be enclosed in double quotes (e.g., "- '/\*.ts'"), as unquoted wildcards violate YAML syntax rules.7  
* **Brace Expansion:** To match multiple extensions or paths, developers can use YAML lists or quoted, comma-separated brace strings 6:  
  YAML  
  \---  
  paths:  
    \- "src/\*\*/\*.{ts,tsx}"  
    \- "lib/\*\*/\*.ts"  
  \---

* **Space Separation:** YAML requires a space after dashes in list definitions.5 Omitting this space will cause Claude Code to fail to parse the file, silently ignoring the rules.5

## **Common Pitfalls and Solutions**

Even with organized configuration files, developer teams often face challenges where rules are ignored, bypassed, or parsed incorrectly.7

### **1\. The Read-Only Triggering Gap**

Claude Code's path-scoping engine is triggered exclusively by file **Read** operations.7 It does not load rules when executing file **Write** or creation tools.7  
If a developer starts a new session and immediately instructs Claude to create a new file (without first reading any existing files), the path-scoped rules will remain dormant.7 As a result, Claude will generate the new file without applying the project's styling or architectural standards.7  
──\> "Create src/api/users.ts" ──\> (No Read Event) ──\> Rules NOT Loaded ──\> Non-compliant Code

#### **Structural Solutions**

* **Unconditional Coding Baselines:** Place essential coding style and structural patterns in unconditional rules (files without path frontmatter) or keep them in a clean, root CLAUDE.md.7  
* **Sequential Nudging:** Instruct Claude to study existing files before generating new ones.7 For example, prompt: *"Examine the structure of existing endpoints under src/api/ and then build a new payments.ts endpoint."* 7 Once Claude reads a matching file, the path-scoped rules will load and persist for the rest of the session.7

### **2\. The Execution Momentum Override**

As Claude executes multi-step workflows (e.g., running shell scripts, modifying directories, and configuring server dependencies), the active task's momentum can override the soft constraints specified in CLAUDE.md or rule files.8  
Because rules are treated as system prompt suggestions rather than hard block settings, Claude may bypass safety checks (such as seeking user confirmation before running destructive database commands) during long execution chains.2  
──\> Run Migration ──\> (Soft Rule: "Ask before drop") ──\> Model Confidence Overrides Rule ──\> Table Dropped Unconditionally 8

#### **Structural Solutions**

* **Bypass Prohibitions:** Programmatically block access to destructive commands or sensitive paths.18 Developers can configure explicit deny rules in .claude/settings.json under permissions.deny.18 For example:  
  JSON  
  {  
    "permissions": {  
      "deny":  
    }  
  }

* **Pre-Tool-Use Interception:** Use a programmatic PreToolUse hook to intercept and evaluate commands before they run, completely bypassing the model's decision-making loop.8

### **3\. Vague Instructions and Lack of Metrics**

Generic instructions like "Write clean code" or "Handle errors gracefully" produce inconsistent results and fail to guide the model effectively.5  
The table below illustrates the relationship between instruction clarity and rule compliance rates based on developmental evaluations 5:

| Quality Level | Example Directive | Compliance Rate | Practical Impact |
| :---- | :---- | :---- | :---- |
| **Vague** | "Write good tests and handle errors." 5 | **\~35%** 5 | Highly variable results; tests are frequently omitted.5 |
| **Specific** | "Use Vitest strict assertions and include try-catch blocks." 5 | **\~62%** 5 | Correct testing tools are selected, but edge-case coverage remains poor.5 |
| **Metric-Driven** | "All public functions must have a unit test. Target test coverage \> 80%." 5 | **\~89%** 5 | High compliance; Claude actively runs the test suite to verify coverage. |

## **Advanced Workstation Configuration Techniques**

For advanced developer environments, combining markdown rules with programmatic constraints and custom output styles provides a more robust and resilient configuration.7

### **Programmatic Safety Valves: PreToolUse Hooks**

To prevent the execution momentum issue, developers can implement a PreToolUse hook that acts as a hard gate for critical commands.8 Unlike markdown rules, which are soft constraints, hooks run as programmatic code blocks and cannot be bypassed by the model.8

#### **Step 1: Create the Gate Script**

This Bash script intercepts shell tool calls and blocks database or deployment actions unless a temporary local approval file exists.8  
*File Path:* \~/.claude/hooks/approval-gate.sh 8

Bash  
\#\!/bin/bash  
\# PreToolUse Hook \- Evaluates shell tool payloads before execution   
\# Exits with status 2 to block command execution 

TOOL\_COMMAND=$(echo "$CLAUDE\_TOOL\_INPUT" | jq \-r '.command // ""')

\# Only evaluate active bash commands  
if; then  
  exit 0  
fi

\# Detect destructive database or platform commands  
if\]; then  
  if \[\! \-f /tmp/cc-approved \]; then  
    echo "BLOCKED: Execution of database, network, or deployment commands requires manual validation." \>&2  
    echo "Create the temporary approval file at '/tmp/cc-approved' to authorize this pipeline." \>&2  
    exit 2 \# Hard programmatic block; Claude Code terminates execution loop   
  fi  
fi

exit 0

#### **Step 2: Register the Hook**

Wire the script into the workstation's global settings file.8  
*File Path:* \~/.claude/settings.json 4

JSON  
{  
  "hooks": {  
    "PreToolUse":  
      }  
    \]  
  }  
}

### **Custom Output Styles**

While rule files append guidelines to the context, Custom Output Styles offer a way to directly modify Claude Code's system prompt.19 This is useful for shaping how Claude communicates or for restricting its default behaviors across sessions.19  
The table below contrasts the operational behavior of Rule Files against Custom Output Styles 19:

| Operational Metric | Rule Files (.md rules) | Custom Output Styles (output-styles/\*.md) |
| :---- | :---- | :---- |
| **System Prompt Impact** | Appended to context as background memory.3 | Modifies the core system prompt directly.19 |
| **Default Instruction Control** | Preserves built-in software engineering instructions.19 | Can selectively drop built-in instructions using keep-coding-instructions: false.19 |
| **Invocation Flow** | Evaluated automatically by context matching.4 | Activated manually via /config or set globally in settings.19 |
| **Primary Use Case** | Coding guidelines, APIs, and directory standards.1 | Global persona adjustments (e.g., explaining logic via diagrams, limiting output length).19 |

#### **Example Custom Output Style**

Developers can save this configuration to enforce structured, diagrammatic explanations across all projects.19  
*File Path:* \~/.claude/output-styles/diagram-first.md 19

## **name: Diagrammatic Explanation description: Enforces visual architecture flows for complex changes keep-coding-instructions: true**

Before proposing architectural modifications or complex logic changes, construct a clean text-based Mermaid.js diagram illustrating the current state versus the proposed state.

### **Monorepo Workstation Management**

In large monorepos, loading nested configuration files from unrelated services can cause "context bleed" and clutter the session.12 To prevent this, developers can use the claudeMdExcludes key in local settings to filter out irrelevant paths.2  
*File Path:* .claude/settings.json 3

JSON  
{  
  "claudeMdExcludes":  
}

This prevents Claude Code from scanning or loading memory profiles from excluded subtrees, preserving the token footprint of the workstation session.2

### **Automated Memory Maintenance**

Claude Code automatically captures corrections, learnings, and workstation adjustments in its project-specific auto-memory logs (located at \~/.claude/projects/\<project-hash\>/memory/).5 If left unmonitored, auto-memory can accumulate obsolete preferences, duplicate statements, and conflicting rules, leading to degraded model performance over time.5  
To maintain performance, developers should perform a biweekly audit of the auto-memory files.5 Obsolete preferences and duplicate statements should be removed.5 If a rule has stabilized into a reliable, permanent preference, it should be extracted from auto-memory and documented directly in \~/.claude/rules/preferences.md.5

## **Checklist for Workstation Implementation**

This step-by-step checklist helps developers set up a clean, high-performance global rule system on their workstation 3:

1. **Global Preparation and Cleanup** 3  
   * \[ \] Clean up any existing monolithic CLAUDE.md files, keeping them under 100 lines.5  
   * \[ \] Remove redundant style rules that are already handled by local formatters or linters.4  
   * \[ \] Initialize the global rule directories: mkdir \-p \~/.claude/rules/ \~/.claude/output-styles/.3  
2. **Establish Unconditional Workstation Rules** 3  
   * \[ \] Create \~/.claude/rules/preferences.md to define global coding standards, typing requirements, and error-handling preferences.3  
   * \[ \] Create \~/.claude/rules/workflows.md to define standard git branch names and conventional commit structures.3  
   * \[ \] Ensure global rules do *not* contain path-scoping headers, as global path-scoping is currently broken.7  
3. **Configure Project-Level Path-Scoped Rules** 6  
   * \[ \] Create .claude/rules/ inside project repositories.3  
   * \[ \] Extract testing practices into .claude/rules/testing-guidelines.md and define the appropriate path filters.6  
   * \[ \] Extract API design guidelines into .claude/rules/api-standards.md.6  
   * \[ \] Wrap glob patterns starting with wildcards in double quotes to prevent YAML parsing errors.7  
4. **Deploy Programmatic Safety Gaskets** 8  
   * \[ \] Create \~/.claude/hooks/approval-gate.sh to intercept and gate potentially destructive commands.8  
   * \[ \] Register the gateway script in the global settings file located at \~/.claude/settings.json.4  
5. **Verify and Audit Active Context** 3  
   * \[ \] Launch a new session by running the claude command in the terminal.5  
   * \[ \] Run the /memory command to confirm that the global workstation files and project-level rules are loaded correctly.3  
   * \[ \] Access a file targeted by a path-scoped rule and verify that the rule is successfully loaded into active memory.3

#### **Works cited**

1. Extend Claude Code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)  
2. How Claude remembers your project \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/memory](https://code.claude.com/docs/en/memory)  
3. The CLAUDE.md Configuration Hierarchy | The AI Agent Factory, accessed May 29, 2026, [https://agentfactory.panaversity.org/docs/General-Agents-Foundations/claude-code-teams-cicd/claude-md-configuration-hierarchy](https://agentfactory.panaversity.org/docs/General-Agents-Foundations/claude-code-teams-cicd/claude-md-configuration-hierarchy)  
4. Anatomy of the .claude Folder \- Every File Explained (2026) \- codewithmukesh, accessed May 29, 2026, [https://codewithmukesh.com/blog/anatomy-of-the-claude-folder/](https://codewithmukesh.com/blog/anatomy-of-the-claude-folder/)  
5. The CLAUDE.md Memory System \- Common Mistakes | SFEIR ..., accessed May 29, 2026, [https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/errors/](https://institute.sfeir.com/en/claude-code/claude-code-memory-system-claude-md/errors/)  
6. Claude Code Rules Directory: Modular Instructions That Scale, accessed May 29, 2026, [https://claudefa.st/blog/guide/mechanics/rules-directory](https://claudefa.st/blog/guide/mechanics/rules-directory)  
7. Your CLAUDE.md Is Doing Too Much — Here's How to Fix It | by Frontend Master \- Medium, accessed May 29, 2026, [https://rahuulmiishra.medium.com/your-claude-md-is-doing-too-much-heres-how-to-fix-it-2cc495ed3599](https://rahuulmiishra.medium.com/your-claude-md-is-doing-too-much-heres-how-to-fix-it-2cc495ed3599)  
8. Claude Code violates user-defined critical safety rules despite ..., accessed May 29, 2026, [https://github.com/anthropics/claude-code/issues/34828](https://github.com/anthropics/claude-code/issues/34828)  
9. Something has changed — Claude Code now ignores every rule in CLAUDE.md \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1se66cf/something\_has\_changed\_claude\_code\_now\_ignores/](https://www.reddit.com/r/ClaudeCode/comments/1se66cf/something_has_changed_claude_code_now_ignores/)  
10. Automate workflows with hooks \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/hooks-guide](https://code.claude.com/docs/en/hooks-guide)  
11. Use Claude Code features in the SDK, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/claude-code-features](https://code.claude.com/docs/en/agent-sdk/claude-code-features)  
12. Set up Claude Code in a monorepo or large codebase, accessed May 29, 2026, [https://code.claude.com/docs/en/large-codebases](https://code.claude.com/docs/en/large-codebases)  
13. Path-Scoped Skills: Workflows That Load Where They Apply \- Claude Fast, accessed May 29, 2026, [https://claudefa.st/blog/guide/mechanics/path-scoped-skills](https://claudefa.st/blog/guide/mechanics/path-scoped-skills)  
14. Tools reference \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/tools-reference](https://code.claude.com/docs/en/tools-reference)  
15. \[BUG\] Path-scoped rules in \`.claude/rules/\` not automatically loaded ..., accessed May 29, 2026, [https://github.com/anthropics/claude-code/issues/16853](https://github.com/anthropics/claude-code/issues/16853)  
16. Split Your CLAUDE.md Before It Hits 400 Lines. Here's how : r ..., accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1td5yr3/split\_your\_claudemd\_before\_it\_hits\_400\_lines/](https://www.reddit.com/r/ClaudeCode/comments/1td5yr3/split_your_claudemd_before_it_hits_400_lines/)  
17. CLAUDE.md 'Rules' are treated as suggestions, not enforced \#19252 \- GitHub, accessed May 29, 2026, [https://github.com/anthropics/claude-code/issues/19252](https://github.com/anthropics/claude-code/issues/19252)  
18. Configure permissions \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/permissions](https://code.claude.com/docs/en/permissions)  
19. Output styles \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/output-styles](https://code.claude.com/docs/en/output-styles)  
20. Explore the context window \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/context-window](https://code.claude.com/docs/en/context-window)  
21. Modifying system prompts \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts](https://code.claude.com/docs/en/agent-sdk/modifying-system-prompts)