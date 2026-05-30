function emitHookResult(hook, payload) {
  return {
    type: "hook",
    hook,
    ...payload,
  };
}

function emitValidatorResult(validator, payload) {
  return {
    type: "validator",
    validator,
    ...payload,
  };
}

function printResult(result) {
  console.log(JSON.stringify(result, null, 2));
}

module.exports = {
  emitHookResult,
  emitValidatorResult,
  printResult,
};
