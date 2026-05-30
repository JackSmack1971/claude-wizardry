---
name: signatures-and-permits
description: Rules for EIP-191, EIP-712, SIWE-style signing flows, permit paths, and delegated approval behavior.
paths:
  - "src/**"
  - "app/**"
  - "components/**"
  - "hooks/**"
  - "lib/**"
  - "services/**"
  - "wagmi/**"
  - "**/*sign*"
  - "**/*signature*"
  - "**/*typed-data*"
  - "**/*permit*"
  - "**/*siwe*"
---

# Signatures And Permits Rules

- Keep message signing, typed-data signing, and permit execution flows explicit; do not collapse them into generic "continue" actions with hidden security implications.
- Always make the domain, chain ID, verifying contract, nonce source, deadline, spender, and value assumptions explicit at the boundary that prepares a signature or permit payload.
- Distinguish authentication signatures, offchain approvals, and onchain permit consumption paths; do not reuse one flow's safety assumptions for another.
- Do not request unlimited approvals or signature scopes by default when a narrower amount, nonce, session, or expiry model is practical.
- If a signature or permit is later consumed by a contract write, keep the handoff auditable so the signed payload can be traced to the eventual write path.
- Surface rejected signature, expired signature, replay-protection mismatch, and wrong-chain or wrong-domain outcomes as distinct states when the repository supports them.
- Defer primary transaction-submission behavior to `transaction-execution` and privileged signer, upgrade, or admin-path concerns to `upgrade-admin-surfaces`.
