/**
 * Solo-pro workflow contract for a focused Ethereum TypeScript repository audit.
 */

const { emitWorkflowResult, finalizeWorkflowContract } = require("./assets/runtime");

async function run(context = {}) {
  return finalizeWorkflowContract({
    status: "active-contract",
    workflow: "web3-audit",
    version: 2,
    intent: "Audit the exact in-scope web3 surfaces and return evidence-backed risk findings.",
    requiredInput: "targetPathOrPr",
    relatedCommands: [
      "/audit:web3"
    ],
    phaseOrder: [
      "read project instructions and active manifests",
      "classify repository as viem-first, ethers-v6-first, or mixed",
      "inspect chain config, wallet flow, ABI surfaces, and deployment paths",
      "deduplicate findings",
      "return compact evidence-backed results"
    ],
    riskSurfaces: [
      "wallet-flow regressions",
      "chain or RPC misconfiguration",
      "ABI or generated-artifact drift",
      "privileged deployment or signer risk",
      "verification gaps"
    ],
    composedSkills: [
      "stack-detection",
      "auditing-wallet-flows",
      "auditing-contract-surfaces",
      "verifying-deployment-safety",
      "dependency-audit",
      "repo-audit"
    ],
    subagents: [
      "web3-auditor"
    ],
    handoffMemory: [
      ".claude/agent-memory/web3-auditor/MEMORY.md"
    ],
    findingBuckets: [
      "wallet-flow regressions",
      "chain or RPC misconfiguration",
      "ABI or contract-address drift",
      "deployment or signer risk",
      "verification gaps"
    ],
    gatingChecks: [
      "audit stays limited to in-scope surfaces",
      "each finding has a direct evidence trail",
      "missing verification is separated from confirmed defects"
    ],
    outputSections: [
      "audit-target",
      "in-scope-surfaces",
      "findings-by-severity",
      "verification-gaps",
      "release-or-deployment-blockers",
      "recommended-next-action"
    ],
    outputTemplate: ".claude/workflows/assets/audit-template.md",
    schema: ".claude/workflows/assets/workflow.schema.json"
  }, context);
}

if (require.main === module) {
  emitWorkflowResult(run, "targetPathOrPr");
}

module.exports = {
  run,
};
