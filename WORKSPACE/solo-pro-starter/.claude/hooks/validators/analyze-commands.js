/**
 * Command-analysis validator.
 * Matches shell-command text against patterns the project considers high risk.
 */

const { emitValidatorResult, printResult } = require("../helpers/emit");
const { blockedCommandPatterns } = require("../helpers/risk-catalog");

function analyzeCommand(commandText = "") {
  const inspectedCommand = commandText || "UNSET";
  const matchedPatterns = blockedCommandPatterns.filter((pattern) =>
    commandText.toLowerCase().includes(pattern.toLowerCase())
  );

  return emitValidatorResult("analyze-commands", {
    status: matchedPatterns.length > 0 ? "needs-review" : "clear",
    inspectedCommand,
    matchedPatterns,
    blockedPatterns: blockedCommandPatterns,
    summary:
      matchedPatterns.length > 0
        ? "Command text intersects project-defined high-risk execution patterns."
        : "No configured high-risk command patterns matched."
  });
}

if (require.main === module) {
  const commandText = process.argv.slice(2).join(" ") || process.env.CLAUDE_COMMAND || "";
  printResult(analyzeCommand(commandText));
}

module.exports = {
  analyzeCommand,
};
