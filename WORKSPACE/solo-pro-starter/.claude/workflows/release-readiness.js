/**
 * Solo-pro workflow contract for release, deployment, or upgrade gate review.
 */

const { emitWorkflowResult, finalizeWorkflowContract } = require("./assets/runtime");

async function run(context = {}) {
  return finalizeWorkflowContract({
    status: "active-contract",
    workflow: "release-readiness",
    version: 2,
    intent: "Gate release, deployment, or upgrade work on explicit operator, signer, and rollback assumptions.",
    requiredInput: "releaseScopeOrTarget",
    relatedCommands: [
      "/release:readiness"
    ],
    phaseOrder: [
      "read deployment and release instructions",
      "inspect deployment scripts, workflows, and signer assumptions",
      "verify environment gating and address publication paths",
      "identify explicit human approval points",
      "return go or no-go style risk summary"
    ],
    riskSurfaces: [
      "mainnet-targeted writes",
      "upgrade and admin mutation paths",
      "signer and executor ambiguity",
      "generated-artifact and address publication drift",
      "release workflow trigger drift"
    ],
    composedSkills: [
      "verifying-deployment-safety",
      "fsv-verify"
    ],
    subagents: [
      "release-gatekeeper"
    ],
    handoffMemory: [
      ".claude/agent-memory/release-gatekeeper/MEMORY.md"
    ],
    gatingChecks: [
      "network and signer assumptions are explicit",
      "approval points are visible to a human operator",
      "rollback or pause posture is stated for privileged writes or upgrades"
    ],
    outputSections: [
      "release-target",
      "verdict",
      "release-blockers",
      "verification-evidence",
      "operator-signer-network-assumptions",
      "required-next-step"
    ],
    outputTemplate: ".claude/workflows/assets/release-template.md",
    schema: ".claude/workflows/assets/workflow.schema.json"
  }, context);
}

if (require.main === module) {
  emitWorkflowResult(run, "releaseScopeOrTarget");
}

module.exports = {
  run,
};
