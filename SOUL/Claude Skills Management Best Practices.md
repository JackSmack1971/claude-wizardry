# **Architectural Guide for Managing the Global \~/.claude/skills Workspace Ecosystem**

The transition of local developer environments from basic terminal automation to model-guided, autonomous engineering workspaces has elevated the importance of structured context management.1 In Anthropic’s Claude Code environment, this capability is mediated through Agent Skills—modular, file-based directives that Claude automatically discovers, loads, and executes based on active working contexts.1 Proper management of the global personal skills folder (\~/.claude/skills) is essential to prevent token bloat, maintain rigorous workspace security, and ensure predictable behavioral alignment across scaling development teams.5

## **Executive Summary**

Establishing a structured global skills directory (\~/.claude/skills) provides developers and engineering teams with a unified automation baseline that applies universally across all projects.3 Historically, developers loaded instructions, patterns, and code style preferences into CLAUDE.md files.2 However, as policy documents expand to accommodate complex workflows and references, they are loaded into the prompt context on every conversation turn, leading to high token accumulation and diminished instruction adherence.3  
Agent Skills solve this context bottleneck through an on-demand, progressive disclosure architecture.4 By keeping the base system prompt lightweight and pulling in detailed step-by-step instructions only when matching a developer's request, skills maximize execution accuracy while minimizing token overhead.3

┌─────────────────────────────────────────────────────────────────┐  
│                    Developer Prompt Submitted                    │  
└─────────────────────────────────┬───────────────────────────────┘  
                                  │  
                                  ▼  
┌─────────────────────────────────────────────────────────────────┐  
│          Level 1: Metadata Checked (\~100 tokens/skill)           │  
│        (Evaluates YAML frontmatter name and description)        │  
└─────────────────────────────────┬───────────────────────────────┘  
                                  │ Matches Task Context?  
                                  ├───────────────────────────────┐  
                                  │ No                            │ Yes  
                                  ▼                               ▼  
┌──────────────────────────────────────────┐    ┌───────────────────────────────────┐  
│     Ignore Skill (0 Context Impact)      │    │    Level 2: SKILL.md Loaded       │  
└──────────────────────────────────────────┘    │  (Primary procedural environment)  │  
                                                └─────────────────┬─────────────────┘  
                                                                  │  
                                                                  ▼  
                                                ┌───────────────────────────────────┐  
                                                │    Level 3: Resources Fetched     │  
                                                │ (Scripts, references on demand)   │  
                                                └───────────────────────────────────┘

The return on investment (ROI) of a managed global skills directory is measured across three primary dimensions:

* **Context Efficiency**: Moving multi-step procedures out of CLAUDE.md and into skills reduces recurring prompt overhead, keeping conversational memory focused on immediate changes.3  
* **Workflow Portability**: Defining skills according to the open Agent Skills standard ensures they run consistently across multiple compatible coding environments.3  
* **Operational Control**: Configuring granular invocation boundaries prevents autonomous models from executing risky tasks—such as code pushes, deployments, or schema alterations—without explicit human consent.2

## **Fundamentals & Setup**

A custom skill is defined as a directory containing a mandatory SKILL.md entry file with structured YAML frontmatter.3 Global skills must be initialized within the personal configuration tree to ensure their availability across all local projects on a developer's machine.3

### **Scope and Priority Resolution Hierarchy**

Claude Code resolves instructions and configuration files based on their filesystem path, walking up the directory tree to determine priority.3

| Scope | Filesystem Location | Application Boundary | Override Precedence |
| :---- | :---- | :---- | :---- |
| **Enterprise** | Organization-wide managed settings paths.3 | Automatically applied to all enterprise users.3 | **Priority 1**: Overrides all lower levels.3 |
| **Personal** | \~/.claude/skills/\<skill-name\>/SKILL.md.3 | Applied across all local workspaces.3 | **Priority 2**: Overrides project and plugin scopes.3 |
| **Project** | .claude/skills/\<skill-name\>/SKILL.md.3 | Restriced to the active repository.3 | **Priority 3**: Overrides plugin-delivered definitions.3 |
| **Plugin** | \<plugin-path\>/skills/\<skill-name\>/SKILL.md.3 | Active where the plugin is enabled.3 | **Priority 4**: Lowest precedence; uses namespaces to prevent clashes.8 |

### **Canary Skill Setup Workflow**

To verify that the runtime engine discovers the global structure correctly, the system behavior must be verified against the following loading criteria:

* **Directory Initialization**: Execute the terminal commands to initialize the global workspace path:  
  Bash  
  mkdir \-p \~/.claude/skills/canary-verifier

* **Drafting the SKILL.md**: Place a skeletal instructions file at \~/.claude/skills/canary-verifier/SKILL.md with valid frontmatter to confirm the engine can parse the configuration:  
  YAML  
  \---  
  name: canary-verifier  
  description: Verifies that Claude Code can dynamically discover and execute global agent skills. Trigger when requested to test environment readiness.  
  disable-model-invocation: false  
  user-invocable: true  
  \---  
  \# Canary Verifier  
  Confirm that the global directory is properly mounted and active by returning a success message.

* **Live Discovery Validation**: Open an active Claude Code session by running claude from any local repository.3 Edits to existing SKILL.md files are watched and reloaded in real-time.3 If establishing the top-level \~/.claude/skills/ folder for the first time, restart the terminal session to ensure the startup discovery pass runs correctly.3

## **Core Best Practices**

Structuring a highly functional global skills directory requires strict adherence to naming, folder scoping, frontmatter configuration, and formatting rules.5

### **Folder Scoping and Subdirectories**

To support complex workflows while keeping the primary SKILL.md file concise, distribute supplementary files across dedicated subdirectories.3  
\~/.claude/skills/auditing-interface-compliance/ ├── SKILL.md \# Mandatory: Frontmatter, primary instructions, and triggers.3 ├── template.md \# Optional: Output templates or boilerplates for Claude to fill.3 ├── schemas/ \# Optional: Strict schema definitions (e.g., JSON Schema).3 │ └── theme-config.json  
├── tests/ \# Optional: Integration verifications for the skill's scripts.3 │ └── test-accessibility-linter.sh ├── examples/ \# Optional: Exemplars of target outputs showing the expected format.3 │ └── correct-contrast-sample.md ├── resources/ \# Optional: Reference documents loaded on-demand.3 │ └── accessibility-guidelines.md ├── assets/ \# Optional: Non-markdown files, design assets, or media styles.5 │ └── bootstrap-v5-theme.css ├── references/ \# Optional: Deep architectural document guides.3 │ └── vercel-ux-rules.md └── scripts/ \# Optional: Executable helpers written in Python, Bash, or Node.3 └── run-contrast-checker.py  
Using these subdirectories keeps the primary instruction file lean, preventing unnecessary token usage when the skill is loaded.5

| Folder Name | Primary Purpose | Loading Behavior | Performance Footprint |
| :---- | :---- | :---- | :---- |
| **SKILL.md** | Orchestrates workflows and maps tool permissions.3 | Loaded immediately upon skill activation.3 | Medium (Keep under 500 lines to avoid token build-up).5 |
| **references/** | Stores supplementary documentation, design rules, or API guides.3 | Loaded only when Claude explicitly uses a file tool to read them.4 | Zero token footprint until explicitly requested.3 |
| **scripts/** | Contains executable helper scripts (Python, Bash, etc.).3 | Executed by the model via shell commands.3 | Low (Claude triggers them without reading their full code).10 |
| **assets/** | Holds static resources, CSS files, or visual templates.5 | Copied or referenced during execution.5 | Very Low (Used on-demand to generate final outputs).5 |

### **Naming Conventions**

Using a consistent naming taxonomy ensures that skills are easy to reference and search, and prevents namespace collisions.9

* **Syntactic Structure**: Skill directory names must be written in kebab-case, using only lowercase letters, numbers, and hyphens up to a maximum of 64 characters.9 They must avoid XML tags or reserved keywords like "anthropic" or "claude".9  
* **Gerund Form**: Use the gerund form (verb \+ \-ing) for active skill names, which clearly describes the operational activity or capability the skill provides.9  
* **Avoid Ambiguity**: Avoid vague or generic names like helper, utils, documents, or data, which can lead to trigger collisions.9

| Context Domain | Poor Naming (Vague/Static) | Recommended Naming (Action-Gerund) | Folder Name |
| :---- | :---- | :---- | :---- |
| **Database** | db-queries, postgres-sql | optimizing-database-queries 12 | optimizing-database-queries |
| **Code Review** | review-helper, code-audit | conducting-adversarial-review 13 | conducting-adversarial-review |
| **Deployment** | deployer, release-script | verifying-deployment-safety 3 | verifying-deployment-safety |
| **UX Quality** | styleguide, css-rules | auditing-interface-compliance 14 | auditing-interface-compliance |

### **YAML Frontmatter Reference Specification**

The top of the SKILL.md file must contain YAML frontmatter enclosed between \--- markers to configure the skill's runtime options.3

YAML  
\---  
name: auditing-interface-compliance  
description: Audits local markup, CSS, and React component code against accessibility and style standards. Trigger when analyzing UI designs, testing contrast, or auditing WCAG compliance.  
when\_to\_use: |  
  Use when the user requests a visual review of a frontend view,  
  asks to verify contrast ratios, or wants to check accessibility.  
argument-hint: "\<target-component-path\>"  
arguments:  
  \- target\_path  
disable-model-invocation: false  
user-invocable: true  
allowed-tools:  
disallowed-tools: \[glob\]  
model: claude-sonnet-4-20250514  
effort: high  
context: fork  
agent: Plan  
paths: \['\*\*/src/components/\*\*', '\*\*/src/pages/\*\*', '\*\*/\*.css'\]  
shell: bash  
\---

Each frontmatter field alters the execution properties of the skill:

* **name**: The unique identifier for manual execution (e.g., /auditing-interface-compliance).3  
* **description**: Explains the skill's functionality and use cases.3 This is critical for auto-invocation, as Claude scans descriptions to match tasks at startup.3 Keep it under 1,024 characters to prevent budget truncation.1  
* **when\_to\_use**: Appends specific user prompt triggers or context examples to the description.3  
* **argument-hint**: Autocomplete placeholder text shown in the CLI command suggestions.3  
* **arguments**: Positional variables passed from manual execution and mapped within instructions.3  
* **disable-model-invocation**: Set to true to disable automatic model loading.3 This is useful for manual-only commands (e.g., deployments) and helps save context tokens.3  
* **user-invocable**: Set to false to hide the skill from the / menu, reserving it for background knowledge-only triggers.3  
* **allowed-tools / disallowed-tools**: Grants automatic permission to specific tools while the skill is active, bypassing user prompts.3  
* **model / effort**: Overrides the session model or reasoning intensity (e.g., low, medium, high, xhigh, max) for the active turn.3  
* **context**: Set to fork to execute the skill within an isolated subagent context, keeping the main conversation clean.3  
* **agent**: Specifies which subagent type (e.g., Explore, Plan, or a custom agent) to launch when context: fork is active.3  
* **paths**: Limits auto-triggering to changes within specified glob patterns.3  
* **shell**: Defines the target shell (bash or powershell) for executing in-file command blocks.3

### **Design Decisions: Dos and Don'ts**

To balance performance, security, and developer productivity, follow these design principles:

| Best Practice (DO) | Antipattern (DON'T) | Architectural Justification |
| :---- | :---- | :---- |
| **Keep SKILL.md under 500 lines**.5 | Pack complete schemas or long styling guides into the main instructions file.5 | Long files consume significant context, as active instructions are re-injected on every turn.3 |
| **Set disable-model-invocation: true on side-effect workflows**.2 | Let the model decide when to execute deployments, migrations, or PR merges.3 | Prevents the model from autonomously running high-risk actions without human verification.2 |
| **List trusted scripts in allowed-tools**.3 | Force developers to manually confirm every file-read or directory-linter operation.11 | Minimizes warning fatigue and allows multi-step routines to execute smoothly.3 |
| **Write instructions in the third-person, imperative voice**.5 | Use narrative paragraphs or conversational suggestions in your guidelines.5 | Direct, action-oriented instructions improve model compliance and execution accuracy.5 |

### **Comprehensive SKILL.md Implementation Example**

The following code block is a complete, production-grade implementation of a local accessibility auditor skill.

## **name: auditing-interface-compliance description: Audits frontend layout and component code against WCAG 2.1 accessibility rules and design token rules. Trigger when examining user interfaces, styling templates, or testing color contrast ratios. disable-model-invocation: false user-invocable: true allowed-tools: \[bash\] model: claude-sonnet-4-20250514 effort: high context: fork agent: Plan paths: \['/src/components/', '/src/pages/', '/\*.css'\] shell: bash**

# **Auditing Interface Compliance**

This skill enforces strict accessibility standards on frontend code. When active, Claude must analyze design files and verify styling guidelines without altering unrelated codebase patterns.

## **Contextual Inputs**

Before analyzing compliance, use terminal tools to query the active layout files:  
\!git diff HEAD

## **Inspection Protocols**

1. Extract and analyze all modified components in the active branch.  
2. Evaluate all HTML tags and React components for semantic correctness (e.g., verifying aria-\* tags, image alt attributes, and button labels).  
3. Check color contrast properties against the standards in ./references/vercel-ux-rules.md.  
4. Run the validation script ./scripts/run-contrast-checker.py to calculate the contrast values.

## **Output Contracts**

Produce a clean verification summary table detailing contrast values, and list any accessibility failures alongside their suggested structural refactors.

## **Examples**

### **Correct Semantic Button Layouthtml**

### **Incorrect Semantic Button Layout**

HTML  
\<div onclick\="submitForm()" class\="blue-box"\>Register\</div\>

\---

\#\# Advanced Patterns

As a team's skill library grows, maintaining consistency requires transitioning from simple workflows to advanced architecture patterns.\[5, 8, 17\]

\#\#\# Dynamic Context Injection

Claude Code supports executing shell command strings directly inside \`SKILL.md\` using the syntax:

\!\`command\`

When the skill is triggered, Claude Code runs the command locally and inlines its output directly into the instructions before sending the prompt to the model. 

This allows you to dynamically inject system state into the prompt. For example, \`\!\`git diff HEAD\`\` pulls the live diff directly into the skill context, grounding Claude's response in your active workspace modifications.

\#\#\# Context Forking and Multi-Subagent Coordination

When running tasks that produce substantial logs, temporary research files, or test outputs, execute the skill within an isolated subagent context \[16, 17\]:

                              Main Session Context  
                                       │  
                Calls Forked Skill (e.g., /adversarial-review)   
                                       │  
                                       ▼  
                               \[context: fork\]  
                                       │  
                 Spawns Isolated Subagent (Explore, Plan, etc.)   
                                       │  
              ┌────────────────────────┴────────────────────────┐  
              ▼                                                 ▼  
    Analyzes Dependencies                             Runs Static Linter  
              │                                                 │  
              └────────────────────────┬────────────────────────┘  
                                       │  
                                       ▼  
                            Consolidates Findings  
                                       │  
                     Returns Lean Summary Markdown \[17\]  
                                       │  
                                       ▼  
                              Main Session Context  
                         (Context Clean and Unpolluted)

Setting \`context: fork\` and configuring the \`agent\` parameter in the frontmatter launches an isolated worker context. This subagent runs tests or reviews dependencies in a separate thread, returning only a consolidated summary to the main conversation and keeping the primary history clean and readable.\[17\]

While skills do not support classical object-oriented class inheritance, developers can implement chaining patterns by using the \`skills\` array in custom subagent definitions.\[16, 18, 19\]

\`\`\`yaml  
\# Inside.claude/agents/ux-orchestrator.md  
\---  
name: ux-orchestrator  
description: High-fidelity user interface review subagent.  
skills: \["auditing-interface-compliance", "vercel-react-best-practices"\]  
\---

When the ux-orchestrator agent is spawned, it pre-loads both specified skills.19 Note that custom subagents load the full content of their listed skills upfront at startup, rather than dynamically discovering them on-demand.19  
To prevent context bloat inside subagents, group complementary skills into small, highly focused suites rather than maintaining a single, large master agent.19

### **Token-Oriented Object Notation (TOON) Serialization**

For operations handling extensive data objects—such as processing multi-row database outputs, parsing server log arrays, or examining API payloads—standard JSON formatting introduces significant token overhead due to dense syntax markers.20 In these scenarios, use Token-Oriented Object Notation (TOON) to streamline structured data representations.21

JSON Representation:  
\[  
  {"id": 101, "status": "active", "zone": "us-east-1"},  
  {"id": 102, "status": "active", "zone": "us-west-2"}  
\]

Equivalent TOON Representation:

{id} {status} {zone}  
101  active   us-east-1  
102  active   us-west-2

TOON organizes uniform object arrays by defining length markers ![][image1] and field header strings ![][image2], combining the structural validation of schema declarations with the compactness of tab-delimited formatting.21  
To quantify efficiency gains, token density optimization is calculated using the efficiency score (![][image3]):  
![][image4]  
where ![][image5] represents the accuracy percentage of model parsing, and ![][image6] represents the token count of the structured payload.22 Under benchmarking with uniform tabular data, TOON consistently reduces token usage by 30% to 70% while maintaining or slightly improving parsing accuracy over raw JSON.21

### **Collaborative Distribution & Packaging**

To share skills across developer groups, wrap directories into standard Claude Code Plugins.8

1. **Plugin Directory Structure**:  
   my-team-plugin/  
   ├──.claude-plugin/  
   │   └── plugin.json       \# Defines manifest and namespace properties.  
   └── skills/  
       └── team-linter/  
           └── SKILL.md       \# Target skill deployed inside namespace.

2. **Namespace Resolution**: Plugin-delivered skills are automatically prefixed to avoid execution conflicts (e.g., /my-team-plugin:team-linter).8  
3. **The Meta-Skill Strategy**: Distribute the built-in skill-creator utility across your team.5 Running skill-creator starts an interactive interview where Claude Code automatically queries the developer about their workflow, validates dependencies, and packages the results into standardized, error-free local skill structures.23

### **Multi-Platform Skills Management**

Custom skills can be deployed across distinct environments, but each runtime enforces specific security permissions and loading mechanisms.1

| Environment | Loading Mechanism | Workspace Sharing Model | Execution Permissions |
| :---- | :---- | :---- | :---- |
| **Claude Code CLI** | Filesystem-based discovery from local folders (\~/.claude/skills/ or project paths).1 | Shared via Git repositories, local symlinks, or custom plugin manifests.1 | Full local terminal and shell utility execution permissions.1 |
| **Claude Desktop & Web App** | Uploaded manually as a structured .zip archive containing the SKILL.md entry file.1 | Individual user scope; each team member must manually upload custom zip bundles.1 | Sandboxed execution container with restricted filesystem access.1 |
| **Claude API** | Uploaded programmatically via /v1/skills endpoints using secure API headers.1 | Workspace-wide scope; accessible to all members using the workspace API keys.1 | Isolated container; zero external network access and restricted package dependencies.1 |

When migrating skills from the CLI to Desktop or API environments, clean your shell command references.1 Local execution scripts and absolute terminal paths must be stripped or rewritten to use standard programming environments, while network operations must use pre-configured API keys.1

## **Common Pitfalls & Mitigation Strategies**

Even optimized skill directories can experience performance degradation, triggering collisions, or security risks if not systematically audited.3

### **The Context Compaction Hazard**

When conversations exceed the model's operational window, Claude Code runs an auto-compaction pass.3 This process summarizes older chat history to free up system memory, then re-attaches the most recent invocation of each active skill.3  
The compaction process enforces strict size limits on skill retention:  
![][image7]  
![][image8]  
If your active skills exceed these thresholds, older skill definitions are dropped from the active context after compaction.3 If Claude stops following a skill's rules, run the manual /context command to inspect active memory, or re-invoke the skill (e.g., /auditing-interface-compliance) to reload its instructions.3

### **Security Violations and Credential Leaks**

Because global skills (\~/.claude/skills) run across all local projects, they present risks if they handle sensitive data or use external tools.1

* **Credential Leakage**: Never hardcode API keys, personal access tokens, or local absolute paths (e.g., /Users/username/) within your instruction files.5 Configure skills to pull credentials from environment variables or secure local vaults.6  
* **Adversarial Instructions**: Before running third-party skills, check them for malicious directives that tell the model to hide system actions, run unapproved network requests, or exfiltrate codebase structures.1  
* **PII Guard Integration**: Use pre-commit hooks to automatically scan modified skill files for sensitive identifiers, emails, or credentials before pushing changes.5

### **Trigger Collisions and Over-Triggering**

If multiple skills share vague or overlapping descriptions, Claude may trigger the wrong skill or load unnecessary instructions during unrelated tasks.6

* **Path Filtering**: Use the paths frontmatter parameter to restrict automatic loading to specific directories or file extensions.3  
* **Trigger Keywords**: Refine description blocks to specify exact use cases.5 Use precise phrasing (e.g., "Trigger only when formatting .css or .scss assets inside theme folders") to clarify when the skill should run.5  
* **Preventing Workspace Pollution**: For tasks with critical side effects (such as updating schemas or running builds), set disable-model-invocation: true in the frontmatter.2 This prevents autonomous triggering, ensuring the workflow only runs when explicitly requested by a developer via a slash command.2

### **The Plugin Command Palette bug**

Developers using IDE plugins may encounter a known bug where setting disable-model-invocation: true in a plugin-delivered skill completely hides it from the / suggestion list.27  
While this flag is designed only to prevent autonomous execution, the registry engine can incorrectly treat the skill as completely invisible.27  
To bypass this bug, copy the skill folder directly into the local project directory under .claude/skills/.27 Project-level definitions bypass this plugin bug and remain fully discoverable within the / suggestion list.27

## **Recommended Tools & Resources**

Using verified community tooling and official templates helps streamline skills management, validation, and testing.7

### **Developer CLI Tooling**

* **init\_skill.py**: An automated script that generates a compliant local directory structure with a pre-configured, valid SKILL.md frontmatter layout and resource subfolders.5  
* **package\_skill.py**: An automated utility that runs validation checks on YAML frontmatter syntax, verifies file links, and compiles the skill folder into a distributable archive.5  
* **check\_marketplace.sh**: A validation script that checks the local workspace for unregistered skills and verifies semantic versioning alignments.5

### **Reference Repositories**

* **anthropics/skills**: The official Anthropic Agent Skills repository, containing verified patterns for document processing (docx, pdf, pptx, xlsx) and template builders.1  
* **daymade/claude-code-skills**: An open-source marketplace that features comprehensive version control configurations, automated packaging scripts, and the skill-creator tool.5  
* **vercel-labs/react-best-practices**: Optimized, Vercel-vetted coding guidelines that improve React performance, prevent waterfall renders, and enforce design token structures.7  
* **getsentry/commit & getsentry/create-pr**: Specialized workflow skills that automate git conventions, generate semantic changelogs, and prepare review-ready pull requests.7

## **Checklist for New Skills & Maintenance Routine**

Maintaining a healthy skills directory requires structured evaluation and routine pruning.6

### **Evaluation-Driven Development (Red-Green-Refactor)**

To ensure new skills are highly reliable and do not introduce regression errors, implement an evaluation-driven design loop 9:

* **Identify Gaps (Red Phase)**: Run representative tasks without active skills, and record where the model fails or behaves inconsistently.9 Create 3 to 5 test queries representing these edge cases.6  
* **Draft Instructions (Green Phase)**: Write the minimal set of instructions inside SKILL.md needed to resolve those failures.9 Confirm the model passes your test queries.9  
* **Refine Behavior (Refactor Phase)**: Streamline instructions, move large reference blocks to auxiliary files, and adjust description triggers to prevent over-triggering in adjacent tasks.5

### **Prioritized Skills Optimization Roadmap**

To scale your skills collection efficiently, implement optimizations based on their impact and ease of execution:

| Optimization Strategy | Implementation Difficulty | Impact | Priority | Architectural Benefit |
| :---- | :---- | :---- | :---- | :---- |
| **Separate Reference Guides** 5 | Low | Very High | **Priority 1** | Instantly reduces the base token footprint, protecting conversation memory.3 |
| **Apply disable-model-invocation** 3 | Low | High | **Priority 2** | Stops autonomous models from running operations with side effects.2 |
| **Consolidate Overlapping Skills** 6 | Medium | High | **Priority 3** | Resolves triggering conflicts, improving execution reliability.6 |
| **Serialize Tabular Data to TOON** 21 | Medium | High | **Priority 4** | Cuts token costs for data payloads by 30% to 70%.20 |
| **Configure Isolated Subagents** 3 | High | High | **Priority 5** | Prevents large logs and test outputs from polluting active memory.17 |

### **Operational Maintenance Routine**

To maintain performance, accuracy, and security across all active skills, execute these lifecycle checks regularly:  
Pre-Commit Verification └── Stage modified skill directories individually; avoid blanket staging commands like "git add.".5  
Weekly Context Footprint Audit └── Run "/context" to monitor loaded skill sizes and ensure SKILL.md files stay under 500 lines.5  
Monthly Security Audits └── Verify that no skills contain hardcoded credentials, local absolute paths, or unapproved network commands.5  
Monthly Version Control Alignment └── When editing any skill file, bump its corresponding version tag inside the plugin marketplace registry.5

#### **Works cited**

1. Agent Skills \- Claude API Docs, accessed May 29, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview)  
2. Claude Code Advanced Patterns: How to Connect Skills, Fork, and ..., accessed May 29, 2026, [https://www.ranketai.com/en/blog/explainer-claude-code-skills-fork-subagents-2026-03-31](https://www.ranketai.com/en/blog/explainer-claude-code-skills-fork-subagents-2026-03-31)  
3. Extend Claude with skills \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/skills](https://code.claude.com/docs/en/skills)  
4. ComposioHQ/awesome-claude-skills \- GitHub, accessed May 29, 2026, [https://github.com/ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills)  
5. claude-code-skills/CLAUDE.md at main \- GitHub, accessed May 29, 2026, [https://github.com/daymade/claude-code-skills/blob/main/CLAUDE.md](https://github.com/daymade/claude-code-skills/blob/main/CLAUDE.md)  
6. Skills for enterprise \- Claude API Docs, accessed May 29, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/enterprise)  
7. The awesome collection of Claude Skills and resources. \- GitHub, accessed May 29, 2026, [https://github.com/lichihho/awesome-claude-skills](https://github.com/lichihho/awesome-claude-skills)  
8. Create plugins \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/plugins](https://code.claude.com/docs/en/plugins)  
9. Skill authoring best practices \- Claude API Docs \- Claude Console, accessed May 29, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/best-practices)  
10. claude-skills/CLAUDE.md at main · jezweb/claude-skills · GitHub, accessed May 29, 2026, [https://github.com/jezweb/claude-skills/blob/main/CLAUDE.md](https://github.com/jezweb/claude-skills/blob/main/CLAUDE.md)  
11. Agent Skills \- Zed, accessed May 29, 2026, [https://zed.dev/docs/ai/skills](https://zed.dev/docs/ai/skills)  
12. ratacat/claude-skills \- GitHub, accessed May 29, 2026, [https://github.com/ratacat/claude-skills](https://github.com/ratacat/claude-skills)  
13. posit-dev/skills: A collection of Claude Skills from Posit \- GitHub, accessed May 29, 2026, [https://github.com/posit-dev/skills](https://github.com/posit-dev/skills)  
14. BehiSecc/awesome-claude-skills \- GitHub, accessed May 29, 2026, [https://github.com/BehiSecc/awesome-claude-skills](https://github.com/BehiSecc/awesome-claude-skills)  
15. For skills that are only executed manually (slash commands), I want to add the disable-model-invocation setting \[Claude Code\] | DevelopersIO, accessed May 29, 2026, [https://dev.classmethod.jp/en/articles/disable-model-invocation-claude-code/](https://dev.classmethod.jp/en/articles/disable-model-invocation-claude-code/)  
16. Extend Claude Code \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/features-overview](https://code.claude.com/docs/en/features-overview)  
17. Create custom subagents \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/sub-agents](https://code.claude.com/docs/en/sub-agents)  
18. Forkable Skills vs Subagents? : r/ClaudeAI \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeAI/comments/1qua2lz/forkable\_skills\_vs\_subagents/](https://www.reddit.com/r/ClaudeAI/comments/1qua2lz/forkable_skills_vs_subagents/)  
19. Claude Code: skills & subagents feel misaligned. what patterns are working for you?, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeAI/comments/1qbc30u/claude\_code\_skills\_subagents\_feel\_misaligned\_what/](https://www.reddit.com/r/ClaudeAI/comments/1qbc30u/claude_code_skills_subagents_feel_misaligned_what/)  
20. I built a Claude Code plugin that saves 30-60% tokens on structured data with TOON (with benchmarks) \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/node/comments/1rrkfoe/i\_built\_a\_claude\_code\_plugin\_that\_saves\_3060/](https://www.reddit.com/r/node/comments/1rrkfoe/i_built_a_claude_code_plugin_that_saves_3060/)  
21. mattjoyce/toon-format-skill \- GitHub, accessed May 29, 2026, [https://github.com/mattjoyce/toon-format-skill](https://github.com/mattjoyce/toon-format-skill)  
22. GitHub \- toon-format/toon: Token-Oriented Object Notation (TOON) – Compact, human-readable, schema-aware JSON for LLM prompts. Spec, benchmarks, TypeScript SDK., accessed May 29, 2026, [https://github.com/toon-format/toon](https://github.com/toon-format/toon)  
23. How to Use Claude Code Skills | Chris Lema, accessed May 29, 2026, [https://chrislema.com/how-to-use-claude-code-skills/](https://chrislema.com/how-to-use-claude-code-skills/)  
24. awesome-claude-skills/skill-creator/SKILL.md at master \- GitHub, accessed May 29, 2026, [https://github.com/ComposioHQ/awesome-claude-skills/blob/master/skill-creator/SKILL.md](https://github.com/ComposioHQ/awesome-claude-skills/blob/master/skill-creator/SKILL.md)  
25. GitHub \- travisvn/awesome-claude-skills: A curated list of awesome Claude Skills, resources, and tools for customizing Claude AI workflows — particularly Claude Code, accessed May 29, 2026, [https://github.com/travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills)  
26. Get started with Agent Skills in the API \- Claude Console, accessed May 29, 2026, [https://platform.claude.com/docs/en/agents-and-tools/agent-skills/quickstart](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/quickstart)  
27. Disable-model-invocation: true completely hides plugin-delivered skills from / command palette \- Bug Reports \- Cursor \- Community Forum, accessed May 29, 2026, [https://forum.cursor.com/t/disable-model-invocation-true-completely-hides-plugin-delivered-skills-from-command-palette/155748](https://forum.cursor.com/t/disable-model-invocation-true-completely-hides-plugin-delivered-skills-from-command-palette/155748)  
28. anthropics/skills: Public repository for Agent Skills \- GitHub, accessed May 29, 2026, [https://github.com/anthropics/skills](https://github.com/anthropics/skills)  
29. Best Claude Code Skills to Try in 2026 \- Firecrawl, accessed May 29, 2026, [https://www.firecrawl.dev/blog/best-claude-code-skills](https://www.firecrawl.dev/blog/best-claude-code-skills)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAaCAYAAACgoey0AAABiUlEQVR4Xu2WzStFQRyGX7EgFuQrsSELysfCSlna2FgrfwALG4qyO0vWlAUbC0WJlWKtLPwD9pKykqUV72tmbjNz71F3RinuU0/nnpnTec+c38ycC/xXmmg3HbBHnefSTPtg7tkR9VVQxxU9oZu0NexOopPu0Eu6HvVVUPAxzNPF9NBb+mF9pRPBFcCW7XM+0UnbN0NX7e8qvgt2LNI3mBsXYdcXQ/SOjkXt2cEFXYEZzQPtD3qBaXpIW6L2rOB2egQzqn2YUS8FVwDLdCNqE1nBIzCj0aSbpe/0mrZ51+zSOe/ckRW8ADPbhcIUqnA9hOiiZ6h+/SIruKDz3rles163XrvW/Dg9QHV9RXKwq++g16aRaYJpog2jvL4iOdivr08BM+o1lNdXJAdr/W7HjWSUPtMXegOz0dQiObhAWF+HauuW1jlq11ckBffCjGYqane4paWNpYy6gvVVuUe4/+7BfHF8tLQuUF5fUVfwT9IIDvi1YO1Op/TRHnWeiyao/kDonqXBDf4un9osUyl3l7mmAAAAAElFTkSuQmCC>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEwAAAAaCAYAAAAdQLrBAAAEUUlEQVR4Xu2YW6hVVRSGf+lCqV28FwVlmSAaFmKgSJ2HinoIInoIurwE5oMaKmhKyXkJpQhBlDCKLhD10JUudKPsglSGiahFKSiIgZCBYFDR5f/OWKu91jxr7b12x2Ocw/7h52zXmHPNNccc4x9jKvXQw/+FC81p5lmpYRTgDHNqRn4PCdeY35kHzNXm5LJ5EMaYM82bzXGJbajgsDi0c1JDBboZe655l/m6ecK8V7GPrnGB+aXiRU0ii0VWKca/Yr6l+JgiLlKM4W9TjDVfNv82/zJvLJtL4EC/Voxl83PL5o64x/zVXJAamuBi87C5JjXUYLp5xFymmIezcXoRT6vzpuvwqOL9l6aGBBzci+ZOc0Ji64R55knzttTQBN067G7FqV6rWHhS2TyAy8yF6j7kSa13MnZKM5yEs55V9+ucVodtNg8qtONU4wrzJ0WUdUK+6QdSQwMMu8M4QSLpSvNz8xNFaqYVBw28XqEpdadO5PQpPjaNTlL49+xvFTgk5lFw0CE2zeaLYN3LzdsV31Kly8PuMCrhwwrN+M38xnzKfEgtwUfHsPPskHl/9jwH7yA6d2e2+8wvzNmFMUQWEUakFcFcUo8CgyS8ah4396lc0XHOVvMl805zvWJsWpSG5DAqBRUj3WAV8oX46BSkBs8vUTisv2Abb75rfqZygdhi3pr9rtMvnMDhFOdeZR7TYP26xdyh0LczFY5LnQrywtWfPG8LmtQ+c79i4Sb91B3mH+ai5Dkf94giWul10pK9RFE1sQEcQoS9ppYT6vSLOcW5oE6/yBIyYLEi3a/OWAX28rO5VCEtdRIyADa43PzWfFOhTU2wTu1Lfn6qxVaDg/hI0TMdNb83n1GkTDFVqvQrj7o0TYnkKv26yfxTsRb80JxSGtHC+ebjCqdtUzitIxDstQo9oE1oB5xBo7pdkWJVmKXWqeUgHUiL7aqfB6r0K9fXYpoSCWREVaqBGYrbyl6F01aWzQPgOz4wPzYnJraOyFOhneiDfOM0pXXAUTgMx/UpUuM8RWV9vjXsX6BPZ6usX0jFRsV6ucOKa+b9FwWG35sU1RNx/0GtSMnHpWkL8pQmLbtGkyoJ8uip+gDA1eZ9RRTy+zG1KmC/BnfknCyRgh6yYXo7omyOotIR0aTse9k4IgsSPUQO34tObsjm/5iNy9Oc+zEVmYhLMaQq2dRhVDMENRX8IlYpLvBvqHx66Bna9qmi4mGnl6OfAjjiCcXct83rsueAje8xX1A470FFxNHa8B5uFcxfoTgU3k80f2XeoGqcFoch+HW6UQQpVadV2Fiv6trDpqlsVXNJXaKoqGOMTd/Dv3k/67TDsDmM00N/6NFINfomPnak45Q4LO1/wDKFXmCjBelUSUcK5it6xf/kMMT1SfMXhU4V74b0W1Quumz+s3A0YLpiP7vUsPeqAk6iYXxOIbBpQzgaQFWmaNBEc3FvcrPpoYceehjx+AcNaOOeHWLllQAAAABJRU5ErkJggg==>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAbCAYAAAB1NA+iAAABA0lEQVR4XmNgGAXowBOI/xOJi6B6sIKFQPwbiG3QxBmB2AiIHwJxEJocHAgC8WkgfgDE0qhScDAHiF3QBWFAH4g/AfEaIGaBioFoAyBmhfInQtVhBdEMED+WI4mBXAKylRvKBzlfACGNCkAK/wBxABBLArE8EM8E4lZkRbgAzP9/gfgJED8C4ldQPk4/IwNjIP7KgOp/XiBeBcRKUD4zVAwrgPkfOY7FgXgyEHNA+RFAnIWQRgUUGQBKJPMZsCcgGOAB4sVArIguAQKwALzLALEVG4hhgLgGZBkGwBaAMACK/wogfg3Elmhy4Oh5xoDIJMhRCMK/kOR2ADEnRNsoGAVUBAB1QjwbjaJGWAAAAABJRU5ErkJggg==>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAmwAAAA9CAYAAAAQ2DVeAAADHElEQVR4Xu3dv8vVVRwH8BMoGAYhghUmoYQiCAlZYkhTtilNUraI4CJOLkqLQ7QIDuIWgoi4RNBgf8Az2yLS1pSIQWPgVKGfD9/vV889z/V5HlI695HXC97c8wsud/twzv2ebykAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwEvzZTsAAMDieD/ysB0EAGBx/Br5O7KhnQAAoL83Ikciv49tAAAWzK0yFGpLkXdmpwAA6O1gZGMZjkJ/jHw4Ow0AQE+vR25HHlf5bGYFAABd/RDZVvXPR85VfQAAOtocudiMHS9D0QYAwArq48k269W8C3kvRb4vw7HsJNsnxrk91Xiatx4AoIstkV8i25vxa01/Pdgb+SRyoxn/rWrnbz1btfP3p68jb0V2lOXrAQC6+iDyV3l2ge3+8fPK+NlbPlHa2toOVPKakLZge1S180qRpTIUavW6jyLHylC4tevdFQcAdJU7af+UodB5L/Ld7HR3uRt2dWy/HfmpmptntYIt57Kf14nU66b+ND/JvqtHAICu8sjv38j9yJ9l5Ws2virDuucl3w/6sr1WhqItd9qyWPt4dnqZtmDL3bG2AMv+0bE9mQq2pXF+omADALrLhwumqzXyP1ybyvCn/TNPV7y49mGGeVnN3TL/eLTVFmypLcDssAEA60buXuUL2A834zcjO5uxlMVcFkTPy1oKqv/i3TK8ISGPRlf7jrUUbA8iu8b2JIuyb8pwJNyuz+8HAOgii5R8PdT0wEG6EDlU9Xv7OXJgbGeBebKsXLRlwZYPCuTayZ2qncXadO1HHuNmYZprv428WYYHGtr1AAD8Dz6PfNGMZaG2O/JpWV4EzlsPAPBKO1WWP6Qw5V61DgCADvZFrlf9P8qzu82mI0wAADo6XYZLaSf1U6H55//LVR8AgM7yJfC5wwYAwILKnbZFe5sCAACVLNbq41EAABZI/l+tfuAAAIAFkztra3kNFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAALxingC/RoCh3eWE7gAAAABJRU5ErkJggg==>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAbCAYAAACjkdXHAAAA7UlEQVR4Xu2SvQtBURiHXwNRiokUJhOjldFosbLblcgqkzJZDTKYjHab1T9gIGU0WUj8Xue659xzv2TUfeqpc9+Pc+55O0R/TQYOYFJP+BGCQ3iCWS3nSxleDXn9NTG4gEd4hxVr2psGHMM+fMK6Ne1OCq5gDvZINDctFR50YctY84nczJv4UiJx17jx/WkemRUuhOEUVpUYD4oHNldijtTgg8RJumsYlaV2fm5OwCUsaHF+nge4ITkHGx3Y1oMkm/cwreXe75eHsoN5LcfwH21JbMAbmfBULyTvdYZFJT+BNyXP6xmMKDUBAc68ALggNDDdcTA1AAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA8AAAAaCAYAAABozQZiAAAAvklEQVR4XmNgGLnACYjvAvEjIrELRBsDAyMQTwHilUCsAOWDwBwg/gfEHlA+MxDbA/EDIDaFijGIA/EqIBaDCQCBIBCfZoAolEYS5wHixUAsAxMAOaEQLg0B+kD8CYjXADELkjjI0ElAzAsTCAViNbg0BEQD8X8gLkcTFwbiNAaE17ACkH9/A7ENugQhgMu/RAFjIP7KgOlfogAu/xIEoICYzzAk/AuK43NA/I4B4lcY/gLE1xkgBo6CUUAeAAAc6iv7Yi1TmwAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,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>

[image8]: <data:image/png;base64,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>