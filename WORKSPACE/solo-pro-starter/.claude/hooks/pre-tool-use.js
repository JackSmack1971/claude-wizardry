/**
 * Pre-tool hook.
 * Routes command and payload checks to validators before high-risk actions.
 */

const { emitHookResult } = require("./helpers/emit");
const { emitHookExecution } = require("./helpers/runtime");
const { analyzeCommand } = require("./validators/analyze-commands");
const { analyzeFilePayload } = require("./validators/check-file-payloads");

async function run(context = {}) {
  const invocation = context.invocation || {};
  const commandCheck = analyzeCommand(invocation.commandText || "");
  const payloadCheck = analyzeFilePayload(invocation.filePayload || "");
  const needsReview =
    commandCheck.status === "needs-review" || payloadCheck.status === "needs-review";

  return emitHookResult("PreToolUse", {
    status: needsReview ? "needs-review" : "clear",
    invocation,
    validators: [
      commandCheck,
      payloadCheck
    ],
    summary: needsReview
      ? "One or more project-defined high-risk command or payload patterns matched."
      : "No project-defined high-risk command or payload patterns matched."
  });
}

if (require.main === module) {
  emitHookExecution(run, "PreToolUse");
}

module.exports = {
  run,
};
