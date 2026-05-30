/**
 * Solo-pro workflow contract for upstream or repository-wide audit issue creation.
 */

const { emitWorkflowResult, finalizeWorkflowContract } = require("./assets/runtime");

async function run(context = {}) {
  return finalizeWorkflowContract({
    status: "active-contract",
    workflow: "upstream-audit",
    version: 1,
    intent: "Audit the repository or diff, confirm evidence-backed findings, and produce issue-ready downstream work items.",
    requiredInput: "scopeOrPr",
    relatedCommands: [
      "/audit:upstream",
      "/audit-upstream"
    ],
    phaseOrder: [
      "read repository instructions and audit scope",
      "inspect repository evidence",
      "confirm and deduplicate findings",
      "draft one issue-ready body per confirmed finding",
      "verify issue state or downstream handoff requirements"
    ],
    riskSurfaces: [
      "dependency or upstream library drift",
      "wallet, chain, ABI, or deployment inconsistencies",
      "release workflow or admin-path issues",
      "duplicate or weak findings that should not become issues"
    ],
    composedSkills: [
      "repo-audit",
      "dependency-audit",
      "auditing-wallet-flows",
      "auditing-contract-surfaces",
      "verifying-deployment-safety"
    ],
    subagents: [
      "upstream-auditor"
    ],
    handoffMemory: [
      ".claude/agent-memory/upstream-auditor/MEMORY.md"
    ],
    findingBuckets: [
      "dependency and upstream drift",
      "wallet or chain regressions",
      "ABI, artifact, or address inconsistencies",
      "deployment, release, or admin-path issues",
      "verification gaps"
    ],
    gatingChecks: [
      "only confirmed findings become issues",
      "duplicate findings are collapsed",
      "each issue body includes evidence, impact, fix scope, and verification steps"
    ],
    outputSections: [
      "audit-target",
      "confirmed-findings-count",
      "issue-ready-bodies",
      "evidence-and-impact-summary",
      "downstream-verification-steps"
    ],
    outputTemplate: ".claude/workflows/assets/issue-template.md",
    schema: ".claude/workflows/assets/workflow.schema.json"
  }, context);
}

if (require.main === module) {
  emitWorkflowResult(run, "scopeOrPr");
}

module.exports = {
  run,
};
