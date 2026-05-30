# **Standardizing AI Orchestration: Enterprise Best Practices for Claude Code Dynamic Workflows**

## **1\. Executive Summary**

The introduction of dynamic workflows in Claude Code v2.1 represents an architectural evolution in multi-agent software engineering automation.1 Historically, coordinating multiple AI agents required a primary Large Language Model (LLM) to act as a runtime orchestrator, recursively planning, executing, and digesting the outputs of subagents.2 This design imposed a severe context window tax.2 Because every subagent output had to be re-ingested by the parent coordinator, the primary context window expanded rapidly, leading to instruction degradation, model hallucinations, and high token costs.2 Dynamic workflows solve this structural bottleneck by replacing the LLM orchestrator with a deterministic local JavaScript runtime.2 The control flow—including state retention, branching, array iterations, and error handling—is maintained in standard JavaScript, while the LLM is reserved strictly for targeted, localized cognitive tasks.2  
To successfully deploy this orchestration framework, development organizations must establish rigorous standards across configuration directories.5 This report analyzes the technical execution environment of Claude Code's dynamic workflow engine and establishes a production-ready blueprint for both global (\~/.claude/workflows/) and project-level (.claude/workflows/) setups.5 It outlines the precise mechanics of the runtime engine, details directory hierarchies, defines authoring patterns, and provides governance frameworks for permission boundaries and isolation.5 By standardizing these practices, organizations can scale autonomous engineering operations to hundreds of parallel subagents, transforming Claude Code from a reactive assistant into a highly governed, proactive enterprise automation engine.1

| Execution Metric | Traditional Chatbot Session | Custom Hook Configurations | Dynamic Workflow Runtime |
| :---- | :---- | :---- | :---- |
| **Control Flow Authority** | Human-in-the-loop prompt chaining 7 | Deterministic event triggers (PostToolUse, etc.) 8 | Programmatic JavaScript control loops 2 |
| **Context Hygiene** | Single context holds all raw tool outputs 2 | Limited to hook command outputs 8 | Clean parent context; subagents run in isolated windows 3 |
| **Concurrency Ceiling** | Strictly sequential single-thread 9 | Single execution thread per hook 8 | Up to ![][image1] concurrent subagents 5 |
| **Total Scale Potential** | **![][image2]** turns before context bloating 4 | Scoped to lifecycle hooks 8 | Up to ![][image3] subagents per task 5 |
| **State Persistence** | Transient conversation history 10 | System-level environment variables 8 | Replay journal; fully resumable states 3 |

## **2\. Technical Overview of the Workflows Folder and Dynamic Workflow Mechanics**

### **The Architecture of the Local Runtime**

Claude Code's dynamic workflow engine operates as an isolated, sandboxed JavaScript environment executing locally on the host machine.5 Unlike custom skills or markdown instructions that influence model behavior through prompting, a dynamic workflow is an active execution script.4 The runtime acts as a coordinator: the developer defines the overall flow, and the script determines exactly when to spawn subagents, what tools to allocate to them, and how to process their structured outputs.3

┌────────────────────────────────────────────────────────┐  
│               Claude Code Parent Session               │  
└──────────────────────────┬─────────────────────────────┘  
                           │ (Launches Workflow)  
                           ▼  
┌────────────────────────────────────────────────────────┐  
│              Sandboxed JS Workflow Runtime             │  
│  \- Executes deterministic JS loops & logic             │  
│  \- Manages execution variables & intermediate state    │  
│  \- Replays execution logs via Journaling Engine        │  
└────┬─────────────────────┬─────────────────────┬───────┘  
     │                     │                     │  
     │ (Spawn Worker)      │ (Spawn Worker)      │ (Spawn Worker)  
     ▼                     ▼                     ▼  
┌──────────────┐      ┌──────────────┐      ┌──────────────┐  
│  Subagent 1  │      │  Subagent 2  │      │  Subagent N  │  
│  \- Haiku/Sonn│      │  \- Haiku/Sonn│      │  \- Haiku/Sonn│  
│  \- Isolated  │      │  \- Isolated  │      │  \- Isolated  │  
└──────────────┘      └──────────────┘      └──────────────┘

The workflow script itself is prohibited from directly executing host-level commands, reading or writing files via native Node.js filesystem modules, or establishing network connections.5 This design creates a critical security boundary.11 If the script requires filesystem analysis or command execution, it must spawn a subagent via the agent() primitive.5 The spawned subagents operate under the user’s configured tool allowlist and permission modes, ensuring that all destructive changes are subject to localized security gates.5

### **The Journaling Engine and Deterministic Restrictions**

To survive network interruptions, API rate limits, and manual pauses during long-running tasks, the workflow engine relies on a specialized journaling engine.1 Every time an agent() call executes and resolves, the engine serializes its input prompt and its structured response, appending the entry to an active execution journal.3 If a workflow is interrupted and subsequently resumed, the engine re-executes the JavaScript file from the beginning, intercepts every agent() call, and satisfies the call instantly from the journal rather than re-querying the LLM.3  
This journaling architecture introduces a strict constraint: the execution path of the JavaScript code must be completely deterministic.3 If the execution path diverges during a replay, the journal entries will mismatch, corrupting the workflow state.3 To guarantee determinism, the runtime disables non-deterministic JavaScript APIs.3 Calling Math.random(), Date.now(), or constructing an unseeded new Date() will cause the interpreter to throw a runtime error.3 If a workflow requires dynamic values (such as execution IDs, current dates, or unique file paths), these must be calculated outside the script and injected explicitly via the global args object.3

### **Concurrency Controls and System Resource Caps**

The execution engine enforces resource caps to prevent local system crashes and API rate limiting 5:

* **Concurrency Bound**: The runtime caps parallel execution at a maximum of ![][image1] concurrent active subagents.5 If a script schedules more than ![][image1] executions, excess tasks are queued and processed as previous workers complete.3 The runtime automatically throttles concurrency below this ceiling on machines with limited physical CPU cores.5  
* **Total Agent Limit**: To prevent infinite loops or runaway processes from consuming massive token budgets, a single workflow execution is capped at a maximum of ![][image3] total subagents.5  
* **Token Consumption**: In actual enterprise audits, large-scale workflows can consume significant token volumes.1 For example, a comprehensive codebase audit conducted by enterprise users has been logged as running for over ![][image4] minutes, fanning out ![][image5] subagents, and consuming ![][image6] million tokens in a single run.1

### **The Orchestration Primitives API**

The Claude Code dynamic workflow engine exposes a set of core API primitives to manage async execution queues and structure model responses.3

| API Primitive | Options & Parameters | Primary Execution Behavior | Return Data Type |
| :---- | :---- | :---- | :---- |
| **agent(prompt, opts?)** | schema: JSON Schema label: UI String phase: Progress Group model: Model Override isolation: "worktree" 3 | Spawns an independent subagent with its own context window. Inherits tool permissions.5 | Raw text string, or a validated JSON object if a schema is defined.3 |
| **parallel(thunks)** | Array of zero-argument functions returning promises.3 | Executes tasks concurrently with a synchronization barrier.3 Captures failures by returning null.3 | Promise resolving to an array of results, matching the input index order.3 |
| **pipeline(items,...stages)** | Array of data items, followed by sequential stage callbacks.3 | Streams items through execution stages with no synchronization barrier, maximizing throughput.3 | Promise resolving to an array of completed processing outputs.3 |
| **workflow(name, args?)** | name: Saved command string args: Parameters object.3 | Executes an existing workflow as an inline child task.3 Subject to a ![][image7]\-level nesting limit.3 | Promise resolving to the return value of the target child workflow.3 |

## **3\. Recommended Directory Structure & File Organization**

To prevent configuration conflicts, file collisions, and duplicate execution states, organizations must implement a standard directory hierarchy.5 Dynamic workflows can be deployed globally to apply across all local repositories, or committed directly to a project workspace.5

### **Structural Tree Blueprint**

The following directory tree showcases the recommended path placement for both user-level (global) and project-level configurations, illustrating how workflows integrate with rules, skills, and assets.

/  
├── \~/.claude/                         \<-- GLOBAL USER CONFIGURATION \[14, 15\]  
│   ├── settings.json                  \<-- Host-level preferences, global hooks, and rules \[5, 8\]  
│   ├── MEMORY.md                      \<-- Global persistent memory logs \[10, 16\]  
│   └── workflows/                     \<-- GLOBAL DYNAMIC WORKFLOWS   
│       ├── sys-codebase-lint.js       \<-- Namespaced global workflow scripts   
│       └── sys-git-cleanup.js  
│  
└── /path/to/project/                  \<-- PROJECT WORKSPACE ROOT \[4, 17\]  
    ├── CLAUDE.md                      \<-- Project-level codebase briefing & guidelines \[4, 14\]  
    ├──.gitignore                     \<-- Must ignore transient worktree directories \[18\]  
    └──.claude/                       \<-- PROJECT-SPECIFIC CONFIGURATION \[14, 15\]  
        ├── settings.json              \<-- Local tool restrictions and pre-approvals \[5, 8\]  
        ├── MEMORY.md                  \<-- Project-specific learnings \[10, 14\]  
        ├── rules/                     \<-- Modular markdown coding standards \[4, 15\]  
        │   ├── typescript-rules.md  
        │   └── security-standards.md  
        ├── skills/                    \<-- PROJECT CUSTOM SKILLS (Slash commands)   
        │   ├── run-linter/  
        │   │   └── SKILL.md  
        │   └── generate-docs/  
        │       └── SKILL.md  
        └── workflows/                 \<-- PROJECT-SPECIFIC WORKFLOWS   
            ├── db-schema-migration.js \<-- Team-shared dynamic workflows   
            ├── audit-api-auth.js  
            └── assets/                \<-- Supporting workflow assets  
                ├── schemas/           \<-- JSON Schemas for subagent validation   
                │   └── db-schema.json  
                └── templates/         \<-- Standard prompt & reporting layouts \[19\]  
                    └── pr-template.md

### **File-Naming and Namespacing Standards**

Workflows must be named using strict **kebab-case** notation with lower-case alphanumeric characters (e.g., dependency-vulnerability-scan.js).  
To prevent execution conflicts when global and local directories are parsed by the CLI autocomplete engine, teams should enforce namespacing conventions 5:

* **Global Workflows**: Prefix all global script filenames with sys- (e.g., sys-branch-prune.js) to designate them as local system utilities.5  
* **Project Workflows**: Name project-specific scripts directly according to their functional domain (e.g., deploy-sanity-check.js).5

### **Organizing Supporting Assets**

Because the JavaScript workflow runtime runs in an isolated sandbox, direct filesystem imports are blocked.5 Developers must use specific design patterns to load supporting schemas and templates:

* **Inline Compilation**: Small schemas and output templates should be defined directly as inline JavaScript constants within the workflow script, ensuring self-contained execution.3  
* **Agent-Mediated Loading**: When large external template files (e.g., .claude/workflows/assets/templates/pr-template.md) must be processed, the workflow script cannot use fs.readFile.5 Instead, it must spawn a localized agent with instructions to read the file and return its raw contents as a string.5

JavaScript  
// Correct pattern for loading supporting assets in a sandboxed script  
phase('Initialization');  
const prTemplateContent \= await agent(  
  "Read the contents of the file located at '.claude/workflows/assets/templates/pr-template.md' and return its exact text.",  
  { label: 'load-pr-template', phase: 'Initialization' }  
);

### **Autocomplete Precedence and Conflict Resolution**

When a user executes a slash command in the Claude Code command-line interface (e.g., /execute-audit), the engine resolves the command name using a strict directory priority queue 5:

1. **Project-Level Context**: The CLI searches .claude/workflows/ within the active working directory.5 If a match is found, it executes immediately, overriding any broader scopes.5  
2. **Global User Context**: If no project-level match exists, the CLI searches the global \~/.claude/workflows/ directory.5  
3. **Built-In Commands**: Standard system commands (such as the /deep-research research workflow) have the lowest precedence and are overridden if a custom local or global script shares their name.5

## **4\. Creation & Authoring Best Practices**

### **Bootstrapping Dynamic Workflows**

Organizations can initiate dynamic workflow scripts through three distinct development paths:

* **Prompt-Driven Generation**: Incorporating the word workflow into a standard user prompt (e.g., "Run a workflow to migrate all API routes to TypeScript") signals the model to stop, draft a custom JavaScript orchestration script, and present it to the user for execution approval.5  
* **Ultracode Orchestration**: Running the CLI command /effort ultracode configures the session to automatically plan and generate dynamic workflows for any complex, multi-file software engineering task.5  
* **Session Conversion**: After a workflow successfully executes, running /workflows in the CLI allows developers to select the completed run, press s, and save the underlying JS script directly to either the project or global workflows directory.5

### **Schema Configuration and UI Metadata**

Every saved workflow script must export a structured meta block.3 This block is parsed by the runtime to populate command definitions and register progress indicators.3

JavaScript  
export const meta \= {  
  name: 'api-auth-audit',  
  description: 'Concurrently audits route handlers for missing JWT authorization checks and generates a report.',  
  whenToUse: 'Execute this workflow when auditing security configurations before major releases. Pass args { "routesPath": "src/routes" }.',  
  phases:  
};

To prevent subagent hallucinations, developers must pass strict JSON schemas to agent() calls.2 This forces the model to use structured-output tools.3 If the model generates a malformed payload, the local harness automatically intercepts the validation error and prompts the agent to retry before returning data to the parent script.3

### **Complete Reference Implementation: Security Auditing and Auto-Healing Workflow**

The following complete JavaScript script illustrates how metadata blocks, structured schemas, parallel execution queues, and verification loops are combined into a production-ready workflow.

JavaScript  
/\*\*  
 \* api-security-healer.js  
 \* Project-level dynamic workflow for auditing and fixing route authentication  
 \* Path:.claude/workflows/api-security-healer.js  
 \*/

export const meta \= {  
  name: 'api-security-healer',  
  description: 'Concurrently scans Express route files for missing JWT validation and automatically implements security fixes.',  
  whenToUse: 'Run this workflow to audit and auto-heal API routing structures. Pass target path via args: { "targetDir": "src/controllers" }.',  
  phases:  
};

const DISCOVERY\_SCHEMA \= {  
  type: 'object',  
  additionalProperties: false,  
  properties: {  
    controllerFiles: {  
      type: 'array',  
      items: { type: 'string' },  
      description: 'Relative paths of discovered controller files'  
    }  
  },  
  required: \['controllerFiles'\]  
};

const AUDIT\_SCHEMA \= {  
  type: 'object',  
  additionalProperties: false,  
  properties: {  
    filePath: { type: 'string' },  
    isSecure: { type: 'boolean' },  
    vulnerabilitySeverity: { type: 'string', enum: \['critical', 'high', 'medium', 'low', 'none'\] },  
    missingMiddleware: { type: 'string', description: 'Name of the missing authorization helper' }  
  },  
  required:  
};

// Access target directory from injected arguments or fall back to default  
const searchPath \= (args && args.targetDir) || 'src/controllers';  
log(\`Initializing security audit wave inside: ${searchPath}\`);

// Phase 1: Scanning  
phase('Scanning');  
const scanResult \= await agent(  
  \`Find all controller JavaScript or TypeScript files under the directory '${searchPath}'. Return their relative paths.\`,  
  {  
    label: 'directory-scanner',  
    phase: 'Scanning',  
    schema: DISCOVERY\_SCHEMA,  
    agentType: 'general-purpose'  
  }  
);

const files \= scanResult.controllerFiles ||;  
if (files.length \=== 0) {  
  log('No controller files located. Terminating execution wave.');  
  return { filesAudited: 0, status: 'no\_targets' };  
}

// Phase 2: Auditing  
phase('Auditing');  
log(\`Discovered ${files.length} controllers. Initiating concurrent security analysis.\`);

const rawAuditReport \= await parallel(  
  files.map((file) \=\> async () \=\> {  
    return await agent(  
      \`Inspect the controller file at '${file}'. Determine if JWT auth middleware is registered on all export methods.\`,  
      {  
        label: \`audit:${file}\`,  
        phase: 'Auditing',  
        schema: AUDIT\_SCHEMA  
      }  
    );  
  })  
);

// Intercept and clean nulls from parallel execution failures   
const auditReport \= rawAuditReport.filter(Boolean);  
const vulnerableTargets \= auditReport.filter((report) \=\>\!report.isSecure && report.vulnerabilitySeverity\!== 'none');

log(\`Analysis completed. Identified ${vulnerableTargets.length} vulnerable controller paths.\`);

if (vulnerableTargets.length \=== 0) {  
  return { filesAudited: files.length, status: 'all\_secure' };  
}

// Phase 3: Healing (Executing Write Operations via Isolated Worktrees)  
phase('Healing');  
log('Initiating parallel code-healing wave with git isolation guardrails.');

await parallel(  
  vulnerableTargets.map((target) \=\> async () \=\> {  
    return await agent(  
      \`Open the controller file at '${target.filePath}'. Add the '${target.missingMiddleware || 'requireJwt'}' middleware block to secure all exposed route functions. Maintain clean imports and style conventions.\`,  
      {  
        label: \`heal:${target.filePath}\`,  
        phase: 'Healing',  
        isolation: 'worktree' // Force subagent workspace isolation to prevent merge conflicts   
      }  
    );  
  })  
);

// Phase 4: Verification  
phase('Verification');  
log('Healing completed. Launching verification and build verification tests.');

const verificationOutput \= await agent(  
  "Execute the project validation tests using 'npm run test'. If any tests fail, analyze the stack trace, locate the modified controller file that caused the regression, and fix it. Repeat until the test suite passes.",  
  {  
    label: 'regression-verifier',  
    phase: 'Verification'  
  }  
);

log('System verification finalized. Codebase has been secured and validated.');  
return {  
  auditedCount: files.length,  
  healedCount: vulnerableTargets.length,  
  verificationSummary: verificationOutput,  
  status: 'remediated'  
};

## **5\. Maintenance, Versioning & Collaboration Guidelines**

### **Structural Deployment Decisions: Global vs. Project Workflows**

Organizations must establish clean separation policies between user-level and repository-level scripts to ensure security and prevent configuration drift.5

| Policy Directive | Global Storage (\~/.claude/workflows/) | Project Storage (.claude/workflows/) |
| :---- | :---- | :---- |
| **Operational Scope** | User-specific utilities that apply across every project on the workstation.5 | Team-wide scripts committed to git, standardizing operations for a specific repository.5 |
| **Execution Precedence** | Secondary; overridden by matching local repository scripts.5 | Primary; overrides global equivalents.5 |
| **Git Inclusion** | Excluded; ignored by global configuration rules.5 | Included; tracked and committed in active development branches.5 |
| **Dependency Binding** | Scoped to systemic host utilities (git, npm global modules).5 | Scoped strictly to project-specific build tools, package setups, and tests.4 |
| **Security Risks** | Vulnerable to credential leakage if scripts parse personal environmental keys.11 | Subject to pull-request reviews to block malicious dependency injections.11 |

### **Repository Versioning and Collaborative Standards**

Project-specific dynamic workflows are critical operational code and must be subjected to standard development lifecycle policies.5 Workflow files must be checked into the source repository, allowing teams to audit modifications through pull requests.5  
To enable automated operations, organizations should run workflows using Claude Code's headless CLI modes within continuous integration (CI) runners.14 When executing headless workflows, teams must adhere to three core practices:

* **Credential Masking**: Never permit workflows or custom subagents to read environmental secrets directly.11 All third-party tokens (e.g., GitHub, Sentry, PagerDuty) should be isolated within an external API manager or injected as read-only variables into the runner environment.21  
* **Runner Isolation**: Headless workflows must run inside throwaway execution sandboxes, such as Docker containers or ephemeral GitHub Actions runners, to protect production systems.11  
* **Branch Protection Gates**: Headless write tokens should be restricted to pushing modifications only to dedicated, non-protected branches matching specific prefixes (e.g., ai-refactor/\*), preventing direct commits to trunk environments.21

### **Managing Local Project Environments with Worktree Hooks**

A primary challenge when running parallel subagents inside temporary git worktrees is the loss of untracked local configurations.23 Local development files (such as .env keys, dev databases, or local TypeScript overrides) are excluded from git index states.23 When Claude Code creates a native worktree to isolate a subagent, these untracked files are missing, causing immediate build and compilation failures inside the subagent's isolated sandbox.23  
To resolve this bottleneck, organizations can implement custom WorktreeCreate and WorktreeRemove hooks within .claude/settings.json.6

JSON  
{  
  "hooks": {  
    "WorktreeCreate": \[  
      {  
        "hooks": \[  
          {  
            "type": "command",  
            "command": "bash.claude/hooks/worktree-create.sh"  
          }  
        \]  
      }  
    \],  
    "WorktreeRemove": \[  
      {  
        "hooks": \[  
          {  
            "type": "command",  
            "command": "bash.claude/hooks/worktree-remove.sh"  
          }  
        \]  
      }  
    \]  
  }  
}

The corresponding bash script, .claude/hooks/worktree-create.sh, intercept the payload, safely extracts the target directory, and copies over critical dev environment files using a .worktreeinclude mapping file.23

Bash  
\#\!/bin/bash  
\#.claude/hooks/worktree-create.sh  
\# Custom hook to copy untracked local environment settings into sibling worktrees

JSON\_INPUT=$(cat)  
WORKTREE\_NAME=$(echo "$JSON\_INPUT" | jq \-r '.name')  
WORKTREE\_PATH="$HOME/.claude/worktrees/$WORKTREE\_NAME"

\# Create the standard worktree using git  
git worktree add "$WORKTREE\_PATH" \-b "feature/$WORKTREE\_NAME" \>&2

\# Identify untracked development configuration files matching inclusion patterns   
if \[ \-f.worktreeinclude \]; then  
  git ls-files \--exclude-from=.worktreeinclude \--others \--ignored | while read \-r FILE; do  
    if \[ \-f "$FILE" \]; then  
      mkdir \-p "$WORKTREE\_PATH/$(dirname "$FILE")"  
      cp "$FILE" "$WORKTREE\_PATH/$FILE"  
    fi  
  done  
fi

\# Print the resolved absolute path to standard output so Claude Code can bind to it   
echo "$WORKTREE\_PATH"

The companion script, .claude/hooks/worktree-remove.sh, cleans up the workspace once the task completes.6

Bash  
\#\!/bin/bash  
\#.claude/hooks/worktree-remove.sh  
\# Safely clean up isolated worktree directories upon subagent termination

JSON\_INPUT=$(cat)  
WORKTREE\_NAME=$(echo "$JSON\_INPUT" | jq \-r '.name')  
WORKTREE\_PATH="$HOME/.claude/worktrees/$WORKTREE\_NAME"

if; then  
  git worktree remove \--force "$WORKTREE\_PATH" \>&2  
  git branch \-d "feature/$WORKTREE\_NAME" \>&2  
fi

## **6\. Performance, Security & Optimization Techniques**

### **Token Management and Context Architecture**

Because dynamic workflows can span hundreds of agent calls, optimizing context window usage is critical for controlling costs and latency.1 Teams should structure their workflows to follow the 70/20/10 model-routing pattern 24:

* **Haiku Routing (70% of calls)**: Direct simple, high-frequency, read-only operations (such as file lookups, codebase searching, and syntax audits) to fast, cost-efficient models.12  
* **Sonnet Routing (20% of calls)**: Route standard file edits, unit-test generation, and typical implementation tasks to intermediate models.13  
* **Opus Routing (10% of calls)**: Reserve advanced, high-reasoning models strictly for initial system design, final adversarial security checks, and root-cause synthesis.24

To maximize the efficiency of Claude Code's 5-minute prompt cache TTL, developers should use identical system prompts, structural XML directives, and tool definitions across all agents in parallel queues.2 This consistency allows parallel executions to hit the same cached prefix, reducing input token costs by up to ![][image8].2

Parallel Processing Wave:  
Agent 1 Prompt: \+ \[Unique File: route1.js\] \---\> Cache Hit\!  
Agent 2 Prompt: \+ \[Unique File: route2.js\] \---\> Cache Hit\!  
Agent N Prompt: \+ \[Unique File: routeN.js\] \---\> Cache Hit\!  
\*The shared system instructions are cached, slashing input token fees \*

### **Security Guardrails and Custom Connectors**

Running workflows in auto-approve mode introduces security risks.11 Rogue subagents, manipulated by third-party prompt injection or untrusted inputs, could run unauthorized commands or access sensitive local files.11  
To mitigate these vulnerabilities, teams should implement the following security layers:

* **Custom MCP Gateways**: Do not run workflows with shared system-level service accounts.21 Route all external connections through an MCP gateway that enforces per-user, per-action authentication.21  
* **PII Masking**: Implement data sanitization rules at the tool layer.21 Workflows should automatically strip customer identifiers, emails, and financial metrics before sending content to the LLM.21  
* **Prompt Injection Mitigation**: Strip raw user strings, query parameters, and unverified form inputs from error payloads and logs before passing them to debugging subagents.21 These fields represent primary prompt injection surfaces.11

## **7\. Common Pitfalls & Solutions**

When deploying dynamic workflows, developers frequently encounter specific architectural pitfalls.1 The following matrix details these common issues, their symptoms, and the precise code modifications required to resolve them.

| Pitfall Category | Diagnostic Symptoms | Before (Anti-Pattern) | After (Remediation) |
| :---- | :---- | :---- | :---- |
| **Accidental Agent Swarms** 5 | A run-away recursive loop triggers hundreds of parallel subagents, exhausting local system resources and rate limits.1 | javascript\<br\>// Dangerous unbounded loop\<br\>while (true) {\<br\> await agent(\<br\> "Analyze route files"\<br\> );\<br\>}\<br\> | javascript\<br\>// Bounded loop structure 5\<br\>let count \= 0;\<br\>const maxLimit \= 10;\<br\>while (count \< maxLimit) {\<br\> await agent(\<br\> "Analyze route files"\<br\> );\<br\> count++;\<br\>}\<br\> |
| **Silent Parallel Failures** 3 | A single agent within a parallel block fails and returns null, causing subsequent array operations to crash.3 | javascript\<br\>// Crashes if any agent fails\<br\>const results \= await parallel(\<br\> list.map(x \=\> () \=\> agent(\`Check ${x}\`))\<br\>);\<br\>const texts \= results.map(r \=\> r.text);\<br\> | javascript\<br\>// Safely filter failed runs 3\<br\>const raw \= await parallel(\<br\> list.map(x \=\> () \=\> agent(\`Check ${x}\`))\<br\>);\<br\>const results \= raw.filter(Boolean);\<br\>const texts \= results.map(r \=\> r.text);\<br\> |
| **Global Path Namespace Conflicts** 5 | A global workflow script overrides local project configurations, causing compilation and workspace pathing failures.5 | javascript\<br\>// Saved globally as 'audit-api.js'\<br\>export const meta \= {\<br\> name: 'audit-api'\<br\>};\<br\>// Scanned in wrong path\<br\> | javascript\<br\>// Prefix global scripts with 'sys-' 5\<br\>export const meta \= {\<br\> name: 'sys-audit-api'\<br\>};\<br\>// Resolves global vs project precedence 5\<br\> |
| **Missing Dynamic Inputs** 3 | Using prohibited non-deterministic APIs inside the JS script causes the runtime to crash.3 | javascript\<br\>// Prohibited non-deterministic calls\<br\>const timestamp \= Date.now();\<br\>const randomId \= Math.random();\<br\> | javascript\<br\>// Read dynamic values from args 3\<br\>const timestamp \= args.timestamp;\<br\>const randomId \= args.uuid;\<br\> |

## **8\. Real-World Case Studies or Example Workflows**

### **Case Study 1: Large-Scale Codebase Migration (Bun Porting Analysis)**

One of the earliest validations of Claude Code's dynamic workflows was Jarred Sumner’s port of the Bun package from Zig to Rust, spanning approximately ![][image9] lines of code.1 Executed over an ![][image10]\-day period, the workflow autonomously fanned out exploration tasks across hundreds of files, generated Rust modules from Zig structures, verified performance benchmarks, and iterated on compilation errors.1 By fanning out exploration and refactoring tasks to concurrent subagents, the migration achieved a final validation pass rate of ![][image11] on the Bun test suite.1 This execution demonstrated how dynamic workflows turn Claude Code into a scalable orchestration engine, fanning out independent refactoring tasks across hundreds of parallel threads without manual coordination.1

### **Case Study 2: Performance and Cost Analytics**

Analyzing quantitative execution data from early enterprise adopters highlights the scalability and token footprint of dynamic workflows.1

* **Case A: Codebase Audit**: A developer auditing a massive, legacy codebase initiated a dynamic workflow that fanned out over a ![][image4]\-minute period, spawning ![][image5] subagents and consuming ![][image6] million tokens.1  
* **Case B: Split-and-Merge Verification**: An execution sequence for a focused API refactoring task spawned ![][image12] subagents.1 The orchestration executed ![][image1] parallel agents for initial file exploration, followed by ![][image13] parallel verification workers to analyze changes, and ended with specialized debugger agents.1 The average token consumption per agent ranged from ![][image14] to ![][image15] tokens, illustrating high efficiency through context isolation.1

## **9\. Implementation Checklist & Future-Proofing Tips**

### **Production Readiness Checklist**

Before deploying dynamic workflows within enterprise teams, verify that the environment and script designs meet the following requirements:

* \[ \] **Deterministic Cleanliness**: Inspect all JS files and verify that no restricted APIs (Date.now(), Math.random(), or unseeded dates) are called.3  
* \[ \] **Directory Separation**: Confirm global utilities are prefixed with sys- and placed in \~/.claude/workflows/, and project scripts reside in .claude/workflows/.5  
* \[ \] **Git Worktree Isolation**: Ensure scripts executing write operations use the isolation: "worktree" parameter to prevent merge conflicts.3  
* \[ \] **Unified Error Filters**: Validate that every parallel() block uses .filter(Boolean) to clean up null results and prevent execution crashes.3  
* \[ \] **Token Optimization**: Review all subagent prompts to ensure system messages are identical, maximizing prompt caching.2  
* \[ \] **Headless Permissions**: Enforce read-only MCP connectors and restrict write access to transient development branches in CI pipelines.21  
* \[ \] **Worktree Hook Synclinks**: Implement a local .worktreeinclude setup to carry untracked environment settings into sibling worktree workspaces.23

### **Official Anthropic vs. Community Implementation Patterns**

As organizations design dynamic workflows, they should evaluate official Anthropic patterns alongside emerging community approaches:

* **Official Anthropic Patterns (Specialized Subagents)**: Official plugins (such as dev-workflows and dev-workflows-frontend) rely on chains of highly specialized, narrow-scope subagents (e.g., prd-creator, technical-designer, quality-fixer, design-sync).13 Each subagent has access to specific tools and focused context, keeping token footprints low and ensuring high output quality.13  
* **Community Pattern A: Fragmented Commands (GSD)**: The GSD ("Get-Shit-Done") pattern breaks complex workflows into a series of user-driven, modular slash commands (e.g., /gsd:new-project, /gsd:plan-phase, /gsd:execute-phase, /gsd:verify-work).27 This approach maintains a human-in-the-loop gate between development phases, ensuring errors are caught before code is committed.27  
* **Community Pattern B: Context-Compression Waves (Citadel)**: In large codebase tasks, Seth Gammon's Citadel framework implements a "compression wave" strategy.28 Parallel subagents run in isolated worktrees, and their findings are compressed into short, ![][image16]\-token briefs before being passed to the next execution wave.28 This keeps parent context windows clean during massive operations.28  
* **Community Pattern C: Contract-Driven Harnesses**: Chachamaru127's claude-code-harness enforces a strict contract-driven loop.29 Before executing any code, the workflow must generate a spec.md and a Plans.md.29 The user must explicitly approve this plan, preventing the agents from drifting during implementation.29

### **Future-Proofing Dynamic Workflows**

To ensure workflow scripts remain functional across future updates to Claude Code and model architectures, developers should adopt three core strategies:

* **Model-Agnostic Prompt Design**: Avoid structuring subagent prompts around the specific behavioral patterns of legacy models.24 Write structured, semantic markdown prompts with explicit XML blocks (e.g., \<role\>, \<output\_formats\>, \<execution\_flow\>), ensuring compatibility when routing tasks to newer models.24  
* **System Messages Decoupling**: Build workflow scripts to dynamically update permissions, token budgets, and environment contexts using system message entries within the active messages array.25 This prevents the need to route update instructions through user turns, maintaining prompt cache integrity.25  
* **Decouple Planning from Execution**: Keep the slash command's definition (which controls *what* the agent is allowed to do) separate from the underlying workflow script (which defines *how* the execution runs).27 This modular structure simplifies maintenance and makes it easy to update prompts without modifying core JavaScript execution loops.27

#### **Works cited**

1. Introducing dynamic workflows in Claude Code : r/ClaudeCode \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1tq9pge/introducing\_dynamic\_workflows\_in\_claude\_code/](https://www.reddit.com/r/ClaudeCode/comments/1tq9pge/introducing_dynamic_workflows_in_claude_code/)  
2. Claude Code dropped /workflows : r/ClaudeCode \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1tkjy4u/claude\_code\_dropped\_workflows/](https://www.reddit.com/r/ClaudeCode/comments/1tkjy4u/claude_code_dropped_workflows/)  
3. Claude Code Workflows: Deterministic Multi-Agent Orchestration ..., accessed May 29, 2026, [https://alexop.dev/posts/claude-code-workflows-deterministic-orchestration/](https://alexop.dev/posts/claude-code-workflows-deterministic-orchestration/)  
4. Best practices for Claude Code, accessed May 29, 2026, [https://code.claude.com/docs/en/best-practices](https://code.claude.com/docs/en/best-practices)  
5. Orchestrate subagents at scale with dynamic workflows \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/workflows](https://code.claude.com/docs/en/workflows)  
6. Run parallel sessions with worktrees \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/worktrees](https://code.claude.com/docs/en/worktrees)  
7. Claude Code Workflow: How It Works and How to Use It in Production \- Truefoundry, accessed May 29, 2026, [https://www.truefoundry.com/blog/claude-code-workflow-guide](https://www.truefoundry.com/blog/claude-code-workflow-guide)  
8. Automate workflows with hooks \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/hooks-guide](https://code.claude.com/docs/en/hooks-guide)  
9. Run agents in parallel \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/agents](https://code.claude.com/docs/en/agents)  
10. How Claude Code works \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/how-claude-code-works](https://code.claude.com/docs/en/how-claude-code-works)  
11. Claude Code Security: Top 6 Risks, Controls, and Best Practices \- Checkmarx, accessed May 29, 2026, [https://checkmarx.com/learn/ai-security/claude-code-security-top-6-risks-controls-and-best-practices/](https://checkmarx.com/learn/ai-security/claude-code-security-top-6-risks-controls-and-best-practices/)  
12. Claude Code agents: Everything teams need to know before choosing | Dust Blog, accessed May 29, 2026, [https://dust.tt/blog/claude-code-agents](https://dust.tt/blog/claude-code-agents)  
13. Production-ready development workflows for Claude Code, powered by specialized AI agents. \- GitHub, accessed May 29, 2026, [https://github.com/shinpr/claude-code-workflows](https://github.com/shinpr/claude-code-workflows)  
14. Overview \- Claude Code Docs, accessed May 29, 2026, [https://code.claude.com/docs/en/overview](https://code.claude.com/docs/en/overview)  
15. CLAUDE.md Best Practices: Building a Smarter AI-Assisted Workflow with Node.js & Angular | by Satnam Singh | Mar, 2026 | Medium, accessed May 29, 2026, [https://medium.com/@satnammca/claude-md-best-practices-building-a-smarter-ai-assisted-workflow-with-node-js-angular-c0a6a0c4cad7](https://medium.com/@satnammca/claude-md-best-practices-building-a-smarter-ai-assisted-workflow-with-node-js-angular-c0a6a0c4cad7)  
16. Claude Code Routines: 5 Production Workflows \+ MCP Setup \- Arcade.dev, accessed May 29, 2026, [https://www.arcade.dev/blog/claude-code-routines-mcp-setup/](https://www.arcade.dev/blog/claude-code-routines-mcp-setup/)  
17. Claude Code GitHub Actions, accessed May 29, 2026, [https://code.claude.com/docs/en/github-actions](https://code.claude.com/docs/en/github-actions)  
18. Replacing My Custom Git Worktree Skill with Claude Code Hooks \#54 \- GitHub, accessed May 29, 2026, [https://github.com/mattbrailsford/mattbrailsford.dev/discussions/54](https://github.com/mattbrailsford/mattbrailsford.dev/discussions/54)  
19. GitHub \- pedrohcgs/claude-code-my-workflow: A ready-to-fork Claude Code template for academics using LaTeX/Beamer \+ R. Multi-agent review, quality gates, adversarial QA, and replication protocols., accessed May 29, 2026, [https://github.com/pedrohcgs/claude-code-my-workflow](https://github.com/pedrohcgs/claude-code-my-workflow)  
20. Introducing Claude Opus 4.8 \- Anthropic, accessed May 29, 2026, [https://www.anthropic.com/news/claude-opus-4-8](https://www.anthropic.com/news/claude-opus-4-8)  
21. Claude Code Agents: What They Do and Which Plugins Use Them \- ClaudePluginHub, accessed May 29, 2026, [https://www.claudepluginhub.com/blog/claude-code-agents-examples-and-use-cases](https://www.claudepluginhub.com/blog/claude-code-agents-examples-and-use-cases)  
22. GSD for Claude Code: A Deep Dive into the Workflow System \- codecentric AG, accessed May 29, 2026, [https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system](https://www.codecentric.de/en/knowledge-hub/blog/the-anatomy-of-claude-code-workflows-turning-slash-commands-into-an-ai-development-system)  
23. Examples of "extreme" Claude Code workflows : r/ClaudeCode \- Reddit, accessed May 29, 2026, [https://www.reddit.com/r/ClaudeCode/comments/1rzbb3n/examples\_of\_extreme\_claude\_code\_workflows/](https://www.reddit.com/r/ClaudeCode/comments/1rzbb3n/examples_of_extreme_claude_code_workflows/)  
24. Chachamaru127/claude-code-harness: Claude Code Dedicated Development Harness \- Achieving High-Quality Development Through an Autonomous Plan→Work→Review Cycle · GitHub, accessed May 29, 2026, [https://github.com/Chachamaru127/claude-code-harness](https://github.com/Chachamaru127/claude-code-harness)

[image1]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABKklEQVR4Xu2TsStFYRiHf0JRymIxKN1CdzAZxGCyGJRiUEYDuRurzcRoUZKS/AV23d0ixXInpfwDDAbxvN5z+M6553yukuk89Qzn/d7z6/2+8x2p4j8YxdV8MccEHuAxLmN3dtmp4xZe4RueZZe/6MVdvMYprOElboZNKRa6hLP4qPJQe7kl342xgO8q7/9kGB9U3DQiDzwMaoPyyaeDWhuxUDtnm2oN++S9A5mOEmKhNqGF7uE5NvAG9+VnXUos1GoW2tT3hGP4hDvJcyGdhG4ENQtv4h0OBfUMsdBteehiUEtDX+RXrJBY6Ay+yj9Uyq8mvcCu3Fq//KKfYE9Si57pvPzS299kWzSf8RYngz77Se7xFNeT9SP98PU7wQLmcAXH1b6jioq/5gPmwj6JUs/0mwAAAABJRU5ErkJggg==>

[image2]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABwAAAAWCAYAAADTlvzyAAAArUlEQVR4XmNgGAWjgIaAD4hrgPgQECujyVEVCANxNxAfBmInIGZGlaYeUATiuQwQH5kDMSOqNPWAOhCvhmItBhpZBDIU5IvtDBBfgXxHU+APxJ+AOIiBRj7CBuiWONABLPmfYID4nG4WcwNxPhCfA+I4IOZElaYdYAXiCAaIxSAHgBxCFwAKWlAQ7wBiFTS5UYABQPEkDsSSRGAxBiqkXAMgnkUk7mWAWDwKsAIAPnoZc5XfHuwAAAAASUVORK5CYII=>

[image3]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAZCAYAAABzVH1EAAACeElEQVR4Xu2WT0hVQRTGvyihMBRpEZFRhiguoqA/kESrCFoYUi0k3UogQhBUEARBuMilmyBCaBFRtC2Cwly0kFoVVFCLNAJX7mqRYvV9nDl279x730vf42FwP/jxnLlz7j3fzHhmgFKlSq1We8hA3LkKbSHnyR0yTrrTj1ekfj3XOI1XXKwWchE25jrZkX6cVQ8ZIVNkmdxLP/5ntZLn5CbZSg6QD+RsclBoq1/PNU7jFad4127ylgyTzeQU+USOJMZkJCP9pJd8w9qNXCVvSFuib5B8JNtDexf5HPpdGq+40dDeRO6Sx+Fv1xh5hvzVS0lLN4e1GfFk4tjD5Ds5Hdoy8IMcXBkBbCD3yTRshfaSedjEJHUG2dhc1WJEq7qAbKw+qo9rNqWJ0I6TUZySl4kT5BeyRvrIb6RXM1e1GPGE49i4X79FRrzfEy4yEvdnVIsR/0gcmzSibTMd2pWMKNG8hBtiRFWlmpFm8iK0Kxm5hPyEG2Ik3kJF/et+a3mliWPdyLXQ1j99kRGV/nZyjCwhm7AbUfWqqGpGtMe3wcplLN//T2AHmEsVaDH8SirDOnS9LWm84jx2J5mFVbikLsAqoypkRbkR1fQ4WRnQSfuTHI2euYbIV9IR2nqHTu0Z/D219Z7X5EZoS52w1fCrUV5cE3lEHiB9SKak2dGLNFNaOqFD7B3ZF8Zoxp/C6vvl0BdLH7tNXsJuCkrmPewqktQh8oVcIedgB+ktWLxLBvS9h7BCMklewbZeXSTTfpXIk2azC5bgcaSTS0oV7CTMsK4tedoI+1/Su/Srdt2kWSzaWv+N9sMuc1UvbetdKn9126OlSpVqnP4Aq76bxjJjvwQAAAAASUVORK5CYII=>

[image4]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABKElEQVR4Xu3TMUtCURjG8TeqQRIikloKXNsCaw/EoCGIIIc+gH4EjYImh5YgpKWtST+Eg6Po0lA0RUu1RG05Vv+Xc4+9Xm9dIYKG+8Bvec+5j8dzVSTJXyeFfVyghqXh5UEmUUQ2NB/JCq5wIK5sD10sBOv6gds4wyPekAvWIqMPXosrnMAMWjL8oJZuYQPHobXIVPAi7rQ+eVTFlYWj+38snUUHPcwH9OR6b98ltlRPp6fU4nMcoo4brJp9NrGluqAb3rEbzPReT3Ar0b+AsUv1ZBkz1zf9gbKZ+cSWLuIObaTN3JdemplPbOkUGuJe1JyZ/+qkmgKe5WvTOHfax3p4wWYaR7hHSdzbf8Ca2aN/iCZexX0D7wmnZt9IlrGDTXElSZL8h3wCQxY+z/dogacAAAAASUVORK5CYII=>

[image5]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAACCklEQVR4Xu2VyyvmURjHH6EIGZFLyMJslKLcNqxcUpqSS2rY4j9wibKahS2hUMJCTVNWVizeZDFRsiAruaTUCKWsFL7fnnO853f8XjM1ZeP91Kfe3znnd87vPM9zzisS57OTCr/DefgDFgW7JRG2wVljl+g7Lq1wBZbDAs88mBwdGqUMHsBR0UW74S7MNf18aRpOwFLYDx/gISwxY8gwfI7hjeg6AbgAJ+HCCTANbolOXmXGcEdsKzTPpE900kWYZNr4e100etYFeAaHROcPwK/1v6oRjkg0rHZHnNzCCF3CE9GQpsM5mOOMIXVwVd6mSDLhb7gHs42MBPPrUi2algGnjXk8N/I3J+dCNgqEc/2SYGpe4W65a37ADBwTze0RrHTGhVEPH0XDnOL1EX7EFOzxOyzMKXP7BDtMG/MyCY/lbcVbWIBL8A7Wen2WBrgpGt1Q7OLcqZurb6I5HnTaXDrhFWzyOwzc9ZrozmNSAe9hRLRgLHbxZafNwp3uwxq/w4HnnFHp9TtcWKWs1oj82+JceAd+Nc/cIY/cl9cRCiPG9zlPTGx4WO1ZTntY2FmxfuUyVTzLGU4b4ZFkMbIo36UZXkv0QgkruHy4DW/hheMf+FOCx4uVvyHBSyomrNxxeCp6jnnUeHnwbFveuzb5P+ASdkP+lWLYDltEJ/gfmBqG3L+s4sSJ87G8AHoJbbXu5iQBAAAAAElFTkSuQmCC>

[image6]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACUAAAAZCAYAAAC2JufVAAACDklEQVR4Xu2UTyhlURzHf0IRUZRSygsLVhbCxpQFdlOayYaNRmJhgyJKkqYmoViJ2cxoYjHJRtPEQmNnbyMWJMrCQpGU+H7f75z3zr3vvnEjC3W/9al3f+d3zvn9e0ckUqS3UymYAMtgClR5lwPVDmb8xjTKBZ2i5y+CFpDp8fCpAWyDD6AWbIFHMAwyHD9XMXAMfvjsQSoEG6AXVIJJ8AD+mLUUMYNN8EWSkReDfXAD6ozNVTb4Lhp4mKAGwE9QYL6Z6LTo/lHr5IptOwHXolWyGhfdNOTYrDrAHDiTcEHRx39WPbgFOyDPscfFrBfAX9EArZhBUCYx0bmoFk0mTFCcvQPQ6tjYAXZiF+Q79rTKAr9F+97s2JnALGiUZIXDBBWkLtGkWfFQ4qXMghVhIFafRVvAmXhNUBzuf+AQlPvWAsUN7POqeHvNzStmnXppUExoBByBGt9aoFiVJTAv+q+0Yju/iVbQ6qVBsdp7orP5rGxAY5J8GphJGygRPejU4Vx0Ju7Nd7/Z8z8xIL5NReabA87Zykl4OGJJ+VAOmt9WfeCT8+0qXaWYUExSL+ID/Uu8jyWT5j/fvTMuGrpF3wy+O241rkBTwtOrMlF/XuQe2iNawTXRtlO8nDN0KannfzU+HtmMeZCfC1CRdI2Lw78u2jbrx8Nt+z6CO9FhtsGymv6zLWxfpEiRIr0rPQFNOXO83R0aiAAAAABJRU5ErkJggg==>

[image7]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAWCAYAAAASEbZeAAAAU0lEQVR4XmNgGBpAAYgj0AVBQBOIs4B4HxD/BeKFqNIQAFIUAMRWQPyEAYciGJAE4ocMo4oYiFS0FIgZ0eQYXBggIQ2Kkv9Q/AWILwGxLpK6oQUAt74aLpIdjysAAAAASUVORK5CYII=>

[image8]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACYAAAAZCAYAAABdEVzWAAAClUlEQVR4Xu2WS6hOURiGX6EIScolRC7JiHJLSUchAyQMRBkpExIDcikiA7eSkaRkcCYnMlKKwY+B28SIASWlJBkaGLi8T99e/957nb35J8rgf+vp/Hvttfd69/d961tH6uv/0EgzxYzPb2QaZ0bng/9KE81dc9EMmT1mRG1GaL5i3sz8Rq6xZpe5bs6p/YGF5oJiHvN5rqqj5rYZZSabp+ax2WimmwXmuPlsthTPtGqaeWSuKAxtMu/N6uoka7t5bZYo0nTWPFBECZGah4qFk46ZNWbA7DY7zUFzVWG+Vdy8Yd6YqZVxovZM5aKzzFvFy5MmmZdmf3FNRD4oopbE782Va2qPFLdlpKtF5qvpqF6svOynWVdcY+ibWdqdEbUzqPLZCeaJ6saOqHwH88+rhxQiFmLBjoYb+6VyEUKfG0O3zCczt7i+rDCLCervmplR3FuvKJc/pjDpb8ZIM8JAm7Hq+GxFek8oTBwuxkndneJvT6KGqCVSQCqSqDGMsTCGO+rNGCJSRGexInJECJMphakDsLvnFWONYrd9MSuL6zmKzZCMpd2WG0BNxnJhKKWQhkqrOaWobzJClBvFV9Ei3il2FY1vn+o11magbTwpT+Eqxe5ONUl/O1T87kkYq+5KUttkAGMf1Vw7eQoRNcfH01oQz/HuRh1Q1FgKKRG8qXof4+U/VBpFY8y9An7nqqYwiQxUjfH3kuJ8HSa++rsizGiFogVUv5Tj5YU5XRnjvCNadPNcRIJGSkOtapvqxsjAmfJ2XRjgqNlrTioWazp8lymOKprmDkVboGHm/yGkFLIzc3GCvDJrFe9nvaZ5XXEc0bs2KHZhm7jHnK2KRZo0oFgw/7Ck5ea5ua+or/zD+uqrr7561W85XYKYNdhZtgAAAABJRU5ErkJggg==>

[image9]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAZCAYAAABjNDOYAAADaklEQVR4Xu2XXYhPQRjGnw1FvlvZhLaVSLkgIcKVRCL5WqEkWXKjKKJcyQUphWwhQpKPckWKsqIopZSPUvKRErXcUKLwPL1nnPnPzuyOEmrPU7/+5z/nzHveeed9Z+YAlSpVqvT3NZecJuPJsIAG0qt4bhmZTvqROjKUrCYTivtOfchKcpTsI2Nrb2drANkMs7ML5k8o+TGVHCRHyHzSo+YJU46tqLaTHwnayTjSk1yI3L9IBqKUrq+T3bAgKnBPyBLvmRw1kodkPelN5pFnZIr3jAKzjdwiTaSenIUFwE2olGMrqePkMsyo4xh5CXu5nHDPPSKvySXEZ0mBvk8Ge22ryFNYFuZIE6F36R26dtpDrsEyU5pE3pEZv54ARpFXsGqQcm1FpdltJUOCdqXqGdR2PgRzKCUFRIE5FbRPJp/IwqA9JQ3wLSzQvhaTzyh90AAVCL9E+pPb5CRsUnNtRaXBKxB+VLWWKNJKR19dBUflpzIMg6M+ckSDydFs8h0dB7QAVsrKRJXHFXQMjia7DWX25tjKloKkxa05vEEdJgfIA/KG3CUTvfsuCKnghO0pOcdTA1K7C0IqOK49x1a2ZsIWVH+RdVKq7kC5zmin+oByYXMvDIPwu8FxG0TouD8gDVwB6Co4ObaypKw5B8ucmFTP/gI8ApZB6qO+2gX+RHC2IO64P6AG8hxdByfHVpZ0zvmI/Dp0sycn5WwqCKn2lFKO/9Oy2gDroI6h1sIWto1eW5jabmcIg+CCszNoT0lb8zd0dNwNSDuNMlWbRio42rGU6Tm2sqTzgAz55wYnV7t+cFxZtcGcco5pF9Fu4qQd42vx6zSoIKbhsDNWWN6avHbYrijJJ/+/pCPJY5R9c211Krc1pvb+abDdyj95NpMvqD39apHWIbGp+F8HOy3fQ7nI63NChzcF1j3nK9ZH79UJ3a1v0miYjRXFf0kbynuYv1KurU7Vl9xAOjh6yVZyk6yDzYQiv6m456QXtxbPLYI5ppn0v7+UcTrOq0xjJSxpIFfJedhCf4LcgfX1pbJ4QVrIGtinSuhTrq1O1QgrqfCTwNdI2KDnIL7dS3JsDFlKZqE223zpW0fOpiQ/NFGyo9+UX/WwIAtdx5Rr67+Q0nk/4mXV7aUPw72oTf9KsKxZjnRZVqpUqVK3008WjOskiZzVpQAAAABJRU5ErkJggg==>

[image10]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAAAoUlEQVR4XmNgGAX0AApAHIEuiAaYgTiMAaIWJ9AE4iwg3gfEf4F4Iao0GHACsS8QTwTip0D8FYiNUVSgAZChAUBsBcRPGHAb6gnEDkBcz0CEoTAgCcQPGbAbigzKGUYNZRg1FF0CG4AZuhSIGdHkkAHI0G9AbIougQxcGCCJHpSb/kPxFyC+BMS6UDXcQLwCiN8hqQHhZ0DcB1UzCkbBkAEAeL0xRnrSFvYAAAAASUVORK5CYII=>

[image11]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADYAAAAZCAYAAAB6v90+AAADf0lEQVR4Xu2WWahNURjHP6HMChlCLhkSGTJFvEkUEh5MSYZQyJAhefAiGZIUSeIi4YUXM+XgwfCAF0MilOFBPChlyPD/3W/vu9fed59zj7wo51+/ztl7r7X2+sa1zSqq6G/VQrQXDbMPAvGsZfbmv6yp4qbYKE6LjunHNcKoDWJ19kExNRWzxAGxRXRJP65VH7HdfNw0K+3ZUA3ECLFH7BOTROPgeVfxQIyOrueIj2Kz6CU6ifHisrhkHtl6hWeui93mBk0ULyx5CWJj88RTMUZ0E8fFUXOnlBJz14q95vNghzgvWkdjJohXlji0h9gluovpYraYYh7JwdGYkmokDorHokNwn6jdtuTFQ8Rnsax2hL/8rZgR3MtTf3HG0nWBMzAsnrve3DAig/g9YunILLY/SMG+4oMoWHoRUuWnGBtdk0K/ovuxGF8Q50ST4H5WzLkn2mbus/F4o9RXaBiR22/Juv3EMSszBVEciYLVNQxD8CRiE8UMCzeUJ1L6u7grekf3qsQdS9KK2n0ihkXX1NOq6D/RrbYyUzBWfYaRpqiUYZ/EwOB+VjQJmg3zv5nXDt2PKMWiDteIG2K+OGtJvRHVslMwFjVELfGisAaoMTaCQYha4DrcDDX2ztwxOKiUmolT5msANT0gNcLV09x5raJronTSEqfHXXmmpbtqrmjb783bMaoyf3FoGA64Kg6bL4iHOU+ow/oMY/xO8xoZJe6br828sPNmhTEYFafgcEvSd5FYab6PouIhLf6Zeb3QwehAYY2hNuYt/o15219qnjr11dgScc0Sr1MzOOWHuBhd5ylMQbr3CfNMQsyhuXSOrssWhoVdMU/txEMr3RWbm0ea9bLi6CjmlGwKchQ9t7Sjl1vpTKkZQI1xcCIiSMqF5xiFfN3S4WdRGkd4jvElUmWJoXGD4YDNig54y9xBobIpiDAeJ4SG4ZiRwXUdUUdfLRlELtMUJteOSLon6UBaxJ2OT5ywmy4wT+F4HKLbFSxxEsIBW80/mbIi/bIRprHh/NgwnEvdcg4XFQY8EgvFJvFazLV0YbL5C+bG4H0MumJ1P1TpaF/EOkvmx/XwUqwwN570PGSeqqGIUrXl1x1GUf84le7JmnnjUiKH2dQ4q/uyWCw41PzbjYO2ZEfKER+6fO8B/7MiffmeZNN5woht5pHDqYPSjyuqqKKKKvrP9Bv44q+A+l0ypgAAAABJRU5ErkJggg==>

[image12]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAACGElEQVR4Xu2UP0iWURTGH6mgqIgIiqAGI4qmjCgpNBxEiDCkPwTqoDUobdUQBg0hLg6KGRghSDQE1tDiEAW1FQlOpZODIjjZEBoSWD3Pd+75vPd9/TAKXPoe+PHd99z73ufe8533AGX9z9pP7pMn5AE5nE4XdJWcJTtIBdlLWklVvIjaRpphe/WSo+l0qtPkDaklx8kY+UXuwEykzWQ0xGNekF1hjaSx9uqGHVIHmySXozVF6ZSvyHWyKcT2kE9kiZwMMWmYfCaz5CW5gNV3XHfJONkdxVrIFNkXxQpSumfIN9itXfdgN7sdxQaRHiYrGcr4aSZ+iiySi5k4tpAB8hp2EJduIHP9utYzP0YWkDfXO8piTya+pvT/Kq0rpC6KPyL9ZILMkQ/kRDTvJqXMs/E1VQ1brGpVZlwjpAur/7Mq/SusYKVGWLayJn9srmp9S56R7Zm5nUgL7AAsA89h2TqPfzDXLR+TPthXsJ68WKdhlVzKpFS8KDeO06oCagjjdvKTdIZnyc2FxofIPPImbq4vKKcKWEO5FcauDnIpjL36Y3NP+3tYQxEaq0ltLa4C6smP8JtIZm3kO2wjNRBHxVQT1p2BVXtcgNfIMtLupSLUu5XhWfur231E2gkL8tRl26ZQCpVKybPzjtwgD2Hf9M0w59LhhsK6JpjxF+T7/1/pIGxT1ULuJkE6zBFyhZxDmq2yyiprY/Ub6XNy9q22APIAAAAASUVORK5CYII=>

[image13]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABUAAAAYCAYAAAAVibZIAAABgElEQVR4Xu3TPyjtYRzH8a9cRa5/UQgZSJRCZJLOoC4pC4PBJoySwSiDwWChDFJISlImm0GYrsVgw+B2oxSiLG433t/zfJ9zfr9fP6Ms51Ovzu/5Pk/P7zx/fiKZfGUKMYlVzKEBWaERItnox4oZQl5oRCAtOEICJZjAG6YlPXEOljGLOozhFReotTGhLOE/BqytE5/hAU1W68UhqqytGcE71vAjUE9mUVznqLULcIIXcavQzNgYncCnGn9xjfJAPRldWpm4PdM040nclvy0WgfOMW5tTSVujD5/Gj2wbfxBa6Qvmi78wz5yI33J5GNH3GS6nF+S/udx0dWti1tRZ6QvNo24xZa4l8VlEHfoiXZo9I1TRp99/MFsBmoa/VenqLe2nrreguLUCNIu7r4pffbRyXRSvW4+eh/37NdHD1g/GL0xqdTgEhsoslopfovbrzarVeAYj+L23bvHrsTc0z5cYQHDOMCz1X38dsSZD4wLRa9EQtz33C3h/c0kk+/MBxnwSgEWwXyFAAAAAElFTkSuQmCC>

[image14]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD0AAAAZCAYAAACCXybJAAAC+klEQVR4Xu2XW6gOURTH/ycUuaUjEjqOlDxRRIQnRHIJD+LhPAh1Uuo8UEpIHlyenJIkoiRSnkjxcFySywOKk1xySYnyqEgu/78127dnz+wzuxT1Nf/69c3s2bNmrT1rr1kfUKtWrWbUBLKOjCP9yEAylWzKjn1NJgfIMdg9g/KXk5ViZxjZCpuzk4zJX/6tFjKLHCZHyFJYDJWaQ76Snx6fYQZ8rSa9ZBoZQvaSq2S4PylBKXbayCOyEbbwS8gzMtObo4C3keuknbSSM7BFGuDNK9V0mBNPyUOyB8VVHU+ek/Xe2Ahyn2zxxqqUYqc/OU4uZMdO+8gVNLJCfn8gc//MACaSN2SxN1Yq3dwdDgaSk3r7muukldbK9sDeWIpS7Mjx92S7N0dahfy9WgQF6L+goeQmOQmzG1VK0NozobPSKZiDcjRFKXYWkB8oBr0MtvW0cEr5SygGrUXrgWWOMigqOXCRnCYvyFuyC/niIqdizpaNxxSb74+74GJBa9wFFws6HC9ID7pLJmXnreQeGgXBGapytkqpdhRUVdAKSIGFwSUHrcAGB2M7YBV9dnbtGqqdrVKqnS5UBz2avEQxuOSgy+RWWw5IseBi4zHF5v/T9FYqa9M/JqO88TDFVCljzr6DNTYpSrGjT9A3xINWFdenTJ+0MDgXtCq4Knmp3N4Ig1Z66wHLs3P9fodVVidXQYXr3NQNyU7YyTml2BlLXsMqva/N5BOZkp1rUfxzaSR5guK9OWnFjsJaOSd1Rjdg+891Sa647c7OJRU+vZ213tgG2GKdRb6xcEqx0wLr0u6g8XzVnfPI2w3vk+aRj7Ba1KfaYOlwEOb0A3IbxZSdQV7BWr81sG2xH/mWTyn4BVZkYnsqxY6CvUzOwVrQE+QWij4p1WVL/xM6YJ1lJyoaEyc9cD7MCaVLrGlXBV5EVsJayjIpRbthFTamFDvyQXtfPuk35pOyR4stdPxf1E4OoTy9m1J6Gwp4YXihmaV9vAKJe6pWrVq1/la/ANDvziqnYPJgAAAAAElFTkSuQmCC>

[image15]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEcAAAAZCAYAAABjNDOYAAADi0lEQVR4Xu2XW4hOURTH14Qi90YmIY0m8oSECHmQSCT3UG655EUoojxIHkjkEpJIklwevBBRRhRRSrmUkktK1HgQErn8/9Zezj579plvT9SoOf/69Z2zv33WXnudtdfeR6RUqVKlWka9wBZwBGwFdfm/f2s2GA06gSrQEywEQ/xOUAcwX9TWTjAw/3eyuoA1onboG30MRT9Ggn3gIJgC2uR6qFJsRTUCXAVjwWBwEfwE60UHp9qCs67d5xzo6vpQvKatbaJBZOAeg5lenxT1Aw/ActAeTAZPRX010bcN4AaoBdXglGgA2nn9UmxFxbd8ASyVLOIc5C74BIa5NuooeAhegfMSf0sbwT3Q3WtbAJ6AGq+tKfFFcCyOwWvTdnBZ1GeKvr0FY/70EOkPXoJJ7j7VVlRMLxr7IJo1ps2imbHOa9sv+WCFYkAYmBNB+3DwEUwL2ovECb4RDbSvGZJ/YZwgffeXSGdwExwXzaxUW1Ex/faCK5IfhMYYHN9opeAMAg3SODh8ho5wMimaAH5I4wlNFfWJmcjlweUfBodLuV6y7E2x1Swx/ZiG38F4r/0A2APug9fgNhjq/W9BKApO2F4kc7xoQmy3IBQFx9pTbDVLrP6cTFjYmKqbJKsz3KneS1bYbMAwCM0NTixrKX9CVg4qBSfFVrK421wDJ0HH4D+uZ78A9xHNoNOi2cZd4F8Eh3Uu5rg/oRrwTCoHJ8VWkpglh8FuqVDFnezt0Uk6WxSEovYiFTneYsvKAuMvGxbYie56iWhhW+XuqTC1bWcIg2DB4Q6YIm7N36Sx4zYh7jRWF4uCwx2LmZ5iq0lViR741rpr00rJHra16wfHllW9qFPmGHcR7iYm7hhf3a+pmyOm3uCF6KnXF/1pEH1pFH3y76ke4JFkz6baiorBWAw+i06UBzyDxdYOWKNEdyu/QM8FXyR/+mWR5rO17p72eVq+I9lJmp8TPLxxPOvnK/YMx+UJ3eobVSdqY567p3jKfyfqL5VqKypbGsyKEC4RLhXKsus6WCb6Jhj51e4/Ewc+5PpNF3WMb9L//mLG8TjPZcr0jokTuQTOiBb6Y+CW6LO+mNnPwQqwSPRTJfQp1dZfq6/opFmL/G8qX3RsAJgFxkk+23zxW4fOFom1j/WKdvgbfqqYqkWDTHgdU6qt/0JM510SX1atXvww3CH59C8lmjVzpHhZlipVqlSr0y+u2PRLX4QvygAAAABJRU5ErkJggg==>

[image16]: <data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB8AAAAZCAYAAADJ9/UkAAAB9ElEQVR4Xu2VTyhEURTGz4QiSlKkyJ9EVhQSCyspiRQLYaesrCwoGyQL7FiQHWVtZUWZKPmzYOFfUSJlZceCEt83597pvjfzjBQb89Wv9+6559zvvTvn3RFJ6r+qBPSBQpAC0kE1GDL3rirBHFgRrcnwTkfEGOeYw1zWBKoJvIIPhxfQ7iZB3eAC1IAsMA22QLaTw3vGOMcc5rKGtXFVK5pwBU7BFCjwZIgUgWvQ78RywDEYdmJjJsY5K9ZcgnwnFhXNF/1Bn7gAd4O5ViGwDsKib2kfZtXJoerBM+j0xSP6jvmCxJpTNHoEZaAKPJmYK9awdsYXj4iTG2AN3IB7MCHeZuKCQeY2bk2CzP3xiDh5CMrNOBcciXZrmuiWhiWxeYdos/pNvjSnQaYvNi76BTSauW1JbN4mPzCPJ3YtFxox41/Zdm4xO/QM5Dlxa84rxWYJMn8QPaDYdGw+v4k15256xO/5TmLNmUhz+3nw+g5aohl6+m0aeG97w46tWPNmrh6lgmXQ4MR4Su2K/s729LJNOGnGFBuUb93rxAZEv5ZSMw6JnnYH4j0JoyoGe2AeDIITsC+6la7qwC0YBT2iP9esaMNa8X4J7IAuUeNz0WM2UCxqFl2UhwX/YOKJnd8qujCP3Hji21aIrsU13YdLKqmk/lafbnl1ekTfhqYAAAAASUVORK5CYII=>