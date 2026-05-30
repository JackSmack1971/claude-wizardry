/**
 * Stop hook.
 * Reminds the session to summarize verification gaps before exit.
 */

const { emitHookResult } = require("./helpers/emit");
const { emitHookExecution } = require("./helpers/runtime");

async function run(context = {}) {
  return emitHookResult("Stop", {
    status: "ready",
    invocation: context.invocation || null,
    checks: [
      "verification performed or explicitly missing",
      "remaining risk called out",
      "mutation state reconciled with source of truth"
    ]
  });
}

if (require.main === module) {
  emitHookExecution(run, "Stop");
}

module.exports = {
  run,
};
