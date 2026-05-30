/**
 * Post-tool hook.
 * Triggers lightweight verification planning and follow-up reminders after mutations.
 */

const { emitHookResult } = require("./helpers/emit");
const { emitHookExecution } = require("./helpers/runtime");
const { buildVerificationPlan } = require("./workflow/run-test-verify");

async function run(context = {}) {
  const invocation = context.invocation || {};
  const verificationPlan = buildVerificationPlan(invocation.rawArguments || invocation.commandText || "");

  return emitHookResult("PostToolUse", {
    status: "ready",
    invocation,
    followUps: [
      "re-read authoritative state after mutation",
      "record verification evidence before completion"
    ],
    verificationPlan,
    reusableHelpers: [
      ".claude/hooks/workflow/run-test-verify.js"
    ]
  });
}

if (require.main === module) {
  emitHookExecution(run, "PostToolUse");
}

module.exports = {
  run,
};
