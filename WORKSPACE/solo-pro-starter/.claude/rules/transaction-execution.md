---
name: transaction-execution
description: Rules for transaction preparation, submission, receipt handling, and user-facing write-path behavior.
paths:
  - "src/**"
  - "app/**"
  - "components/**"
  - "hooks/**"
  - "lib/**"
  - "services/**"
  - "wagmi/**"
  - "**/*transaction*"
  - "**/*write*"
  - "**/*permit*"
  - "**/*allowance*"
---

# Transaction Execution Rules

- Simulate or otherwise preflight high-value writes before submission when the repository supports it.
- Keep approval and primary action flows explicit; do not hide extra token approvals inside unrelated UI actions.
- Surface wallet rejection, revert, timeout, replacement, and final receipt outcomes as distinct states when the repository supports them.
- Keep slippage, deadline, nonce, gas, and value assumptions explicit at the boundary that constructs the write request.
- Do not retry privileged or value-moving writes silently.
- Defer signature-payload construction, permit-domain checks, and replay-protection details to `signatures-and-permits` when those files are in scope.
- If a transaction path depends on chain-specific config, signer selection, or admin roles, defer those constraints to `chain-config` and `upgrade-admin-surfaces`.
