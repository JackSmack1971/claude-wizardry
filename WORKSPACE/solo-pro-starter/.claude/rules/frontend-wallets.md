---
name: frontend-wallets
description: Wallet UX and injected-provider rules for dapp frontends.
paths:
  - "src/**"
  - "app/**"
  - "components/**"
  - "hooks/**"
  - "wagmi/**"
---

# Frontend Wallet Rules

- Keep wallet connection, network state, and transaction state explicit in the UI.
- Handle disconnected, unsupported-network, rejected-signature, and pending-transaction states deliberately.
- Do not construct ad hoc providers in random components when a shared client layer already exists.
- If the repository uses `ethers`, assume `BrowserProvider` for injected EIP-1193 wallets in browser code.
- If the repository uses `viem`, prefer shared public and wallet clients over component-local RPC setup.
- Push signature-domain, permit-payload, and delegated-approval constraints into `signatures-and-permits` instead of duplicating them in wallet UI rules.
- Push simulation, allowance, slippage, and receipt-handling constraints into `transaction-execution` instead of duplicating them in wallet UI rules.
