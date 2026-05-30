function readWorkflowInvocation(requiredInput) {
  const rawArguments = process.argv.slice(2).join(" ").trim();
  const sessionArgs = process.env.CLAUDE_WORKFLOW_ARGS || "";

  return {
    rawArguments,
    sessionArgs,
    requiredInput: requiredInput || null,
    hasInput: Boolean(rawArguments || sessionArgs),
    cwd: process.cwd(),
    sessionId: process.env.CLAUDE_SESSION_ID || null,
    effort: process.env.CLAUDE_EFFORT || null,
  };
}

function finalizeWorkflowContract(baseContract, context = {}) {
  const invocation = context.invocation || readWorkflowInvocation(baseContract.requiredInput);
  const readiness = baseContract.requiredInput && !invocation.hasInput ? "needs-input" : "ready";

  return {
    ...baseContract,
    runtime: {
      mode: "cli-contract",
      executable: true,
      helper: ".claude/workflows/assets/runtime.js",
    },
    invocation,
    readiness,
  };
}

async function emitWorkflowResult(run, requiredInput) {
  const invocation = readWorkflowInvocation(requiredInput);
  const result = await run({ invocation });
  console.log(JSON.stringify(result, null, 2));
}

module.exports = {
  emitWorkflowResult,
  finalizeWorkflowContract,
  readWorkflowInvocation,
};
