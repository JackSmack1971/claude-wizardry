/**
 * Solo-pro workflow contract for implementing a single issue as a PR-sized change.
 */

const { emitWorkflowResult, finalizeWorkflowContract } = require("./assets/runtime");

async function run(context = {}) {
  return finalizeWorkflowContract({
    status: "active-contract",
    workflow: "issue-to-pr",
    version: 2,
    intent: "Implement one issue with bounded scope, explicit verification, and PR-ready evidence.",
    requiredInput: "issueUrlOrNumber",
    relatedCommands: [
      "/create:pr",
      "/create-pr"
    ],
    phaseOrder: [
      "read issue and repository instructions",
      "detect stack and risk surface",
      "implement the smallest correct change",
      "run repository verification",
      "capture PR evidence"
    ],
    riskSurfaces: [
      "wallet-flow mutations",
      "chain-config changes",
      "ABI or generated-artifact drift",
      "deployment or release workflow edits"
    ],
    subagents: [
      "implementation-agent",
      "pr-reviewer"
    ],
    handoffMemory: [
      ".claude/agent-memory/implementation-agent/MEMORY.md",
      ".claude/agent-memory/pr-reviewer/MEMORY.md"
    ],
    verification: [
      "git diff",
      "repository test or lint commands",
      "post-mutation state checks"
    ],
    gatingChecks: [
      "scope still maps to one issue",
      "verification is executed or explicitly missing",
      "network, wallet, ABI, and deployment assumptions are stated"
    ],
    outputSections: [
      "branch",
      "scope-summary",
      "files-changed",
      "verification-results",
      "network-wallet-assumptions",
      "contract-and-artifact-impact",
      "open-risks",
      "pr-evidence"
    ],
    outputTemplate: ".claude/workflows/assets/pr-template.md",
    schema: ".claude/workflows/assets/workflow.schema.json"
  }, context);
}

if (require.main === module) {
  emitWorkflowResult(run, "issueUrlOrNumber");
}

module.exports = {
  run,
};
