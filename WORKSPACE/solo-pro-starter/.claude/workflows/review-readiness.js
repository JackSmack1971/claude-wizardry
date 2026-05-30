/**
 * Solo-pro workflow contract for reviewing a local diff or pull request for merge readiness.
 */

const { emitWorkflowResult, finalizeWorkflowContract } = require("./assets/runtime");

async function run(context = {}) {
  return finalizeWorkflowContract({
    status: "active-contract",
    workflow: "review-readiness",
    version: 2,
    intent: "Review merge readiness with findings-first output and explicit verification gaps.",
    requiredInput: "prUrlNumberOrLocalDiffScope",
    relatedCommands: [
      "/review:pr",
      "/review-pr"
    ],
    phaseOrder: [
      "read issue or change context",
      "inspect diff and verification evidence",
      "check chain, wallet, ABI, and workflow risk surfaces",
      "separate blocking findings from non-blocking suggestions",
      "return merge-readiness verdict"
    ],
    riskSurfaces: [
      "correctness regressions",
      "wallet and signer safety",
      "ABI and generated-artifact drift",
      "admin or upgrade path risk",
      "release-workflow mutation"
    ],
    subagents: [
      "pr-reviewer"
    ],
    handoffMemory: [
      ".claude/agent-memory/pr-reviewer/MEMORY.md"
    ],
    gatingChecks: [
      "blocking defects are separated from informational notes",
      "verification evidence is inspected before a verdict is given",
      "unknowns remain unknown instead of being softened into approval"
    ],
    outputSections: [
      "verdict",
      "blocking-findings",
      "non-blocking-suggestions",
      "verification-gaps",
      "chain-wallet-abi-notes",
      "merge-safety-summary"
    ],
    outputTemplate: ".claude/workflows/assets/review-template.md",
    schema: ".claude/workflows/assets/workflow.schema.json"
  }, context);
}

if (require.main === module) {
  emitWorkflowResult(run, "prUrlNumberOrLocalDiffScope");
}

module.exports = {
  run,
};
