function readHookInvocation(defaultEventName) {
  const rawArguments = process.argv.slice(2).join(" ").trim();
  const eventName =
    process.env.CLAUDE_HOOK_EVENT ||
    process.env.CLAUDE_EVENT_NAME ||
    defaultEventName ||
    "UNSET";
  const commandText = process.env.CLAUDE_COMMAND || rawArguments || "";
  const filePayload = process.env.CLAUDE_FILE_PAYLOAD || rawArguments || "";

  return {
    eventName,
    rawArguments,
    commandText,
    filePayload,
    cwd: process.cwd(),
    sessionId: process.env.CLAUDE_SESSION_ID || null,
    effort: process.env.CLAUDE_EFFORT || null,
  };
}

async function emitHookExecution(run, defaultEventName) {
  const invocation = readHookInvocation(defaultEventName);
  const result = await run({ invocation });
  console.log(JSON.stringify(result, null, 2));
}

module.exports = {
  emitHookExecution,
  readHookInvocation,
};
