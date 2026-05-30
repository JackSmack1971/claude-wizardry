/**
 * Reusable workflow helper.
 * Intended to run lightweight test or verification follow-ups after writes.
 */

const { emitHookResult, printResult } = require("../helpers/emit");

function buildVerificationPlan(scopeText = "") {
  return emitHookResult("WorkflowHelper", {
    status: "ready",
    helper: "run-test-verify",
    scope: scopeText || "UNSET",
    suggestions: [
      "run the narrowest repository verification command available",
      "capture exact command output",
      "compare post-mutation state against expected delta"
    ]
  });
}

if (require.main === module) {
  const scopeText = process.argv.slice(2).join(" ") || process.env.CLAUDE_VERIFICATION_SCOPE || "";
  printResult(buildVerificationPlan(scopeText));
}

module.exports = {
  buildVerificationPlan,
};
