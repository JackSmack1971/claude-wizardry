/**
 * Session-start hook.
 * Emits a compact reminder of the repository's highest-risk surfaces.
 */

const { emitHookResult } = require("./helpers/emit");
const { emitHookExecution } = require("./helpers/runtime");
const { highRiskSurfaces } = require("./helpers/risk-catalog");

async function run(context = {}) {
  return emitHookResult("SessionStart", {
    status: "ready",
    invocation: context.invocation || null,
    reminders: [
      "detect viem-first or ethers-v6-first stack boundaries before architectural edits",
      "treat deployments, signer changes, ABI drift, and workflow edits as high risk",
      "use full-state verification around mutations"
    ],
    highRiskSurfaces
  });
}

if (require.main === module) {
  emitHookExecution(run, "SessionStart");
}

module.exports = {
  run,
};
