# solo-pro-starter

`solo-pro-starter` is a Claude Code-native framework for a serious solo developer building full-stack Ethereum dapps in TypeScript with `viem` first and `ethers` v6 compatibility where a repository already uses it.

Included:
- Compact root instructions in `CLAUDE.md`
- Shared project guardrails in `.claude/settings.json`
- Issue-and-PR commands in `.claude/commands/`
- Focused rules for architecture, testing, frontend wallet UX, smart contracts, and security
- Reusable skills for repo audit, dependency audit, and full-state verification
- Two agents for implementation and PR review

Framework bias:
- Prefer `viem` primitives such as `createPublicClient`, `createWalletClient`, `http`, explicit `chain` config, and typed contract interactions
- If a repo uses `ethers`, assume modern `ethers` v6 terminology such as `BrowserProvider` and `JsonRpcProvider`
- Treat contract writes, ABI drift, chain misconfiguration, and wallet flow regressions as high-risk changes

Verification for this scaffold is structural:
- Expected `.claude/` paths exist
- Referenced files exist
- No private SSOT content is exposed
