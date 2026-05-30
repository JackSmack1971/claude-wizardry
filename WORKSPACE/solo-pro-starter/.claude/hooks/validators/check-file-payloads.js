/**
 * File-payload validator.
 * Identifies sensitive file classes that should receive extra scrutiny.
 */

const { emitValidatorResult, printResult } = require("../helpers/emit");
const { sensitiveFilePatterns } = require("../helpers/risk-catalog");

function looksPathLike(value) {
  return /[\\/]/.test(value) || value.startsWith(".") || /\.[a-z0-9]+$/i.test(value);
}

function extractPathCandidates(payloadText = "") {
  return payloadText
    .split(/\s+/)
    .map((part) => part.trim())
    .filter(Boolean)
    .filter(looksPathLike);
}

function analyzeFilePayload(payloadText = "") {
  const inspectedPayload = payloadText || "UNSET";
  const pathCandidates = extractPathCandidates(payloadText.toLowerCase());
  const matchedPatterns = sensitiveFilePatterns.filter((pattern) => {
    const normalizedPattern = pattern.replace("/**", "").toLowerCase();
    return pathCandidates.some((candidate) => candidate.includes(normalizedPattern));
  });

  return emitValidatorResult("check-file-payloads", {
    status: matchedPatterns.length > 0 ? "needs-review" : "clear",
    inspectedPayload,
    pathCandidates,
    matchedPatterns,
    sensitivePatterns: sensitiveFilePatterns,
    summary:
      matchedPatterns.length > 0
        ? "Payload intersects project-defined sensitive file classes."
        : "No configured sensitive file classes matched."
  });
}

if (require.main === module) {
  const payloadText = process.argv.slice(2).join(" ") || process.env.CLAUDE_FILE_PAYLOAD || "";
  printResult(analyzeFilePayload(payloadText));
}

module.exports = {
  analyzeFilePayload,
};
