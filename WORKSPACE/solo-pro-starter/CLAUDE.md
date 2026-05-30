# Project Claude Instructions

## Operating Model

This framework assumes a solo developer maintaining a TypeScript Ethereum dapp with disciplined issue, branch, and PR boundaries.

Default workflow:
1. Read the issue, repository instructions, and relevant manifests before editing.
2. Infer whether the repository is `viem`-first, `ethers` v6-first, or mixed from its real files.
3. Prefer the repository's existing commands over generic commands.
4. Keep chain configuration, ABI sources, and wallet flows explicit.
5. Keep changes small, reviewable, and reversible.
6. Verify state after every write or external mutation.

## Source-of-Truth Command Discovery

Choose commands from the repository in this order:

1. `package.json`
2. `pyproject.toml`
3. `Makefile`
4. language-specific project files
5. structural verification if no runnable project commands exist

Do not invent commands that the repository does not define.

For Ethereum TypeScript repositories, prefer commands that separate:

- app lint and typecheck
- unit and integration tests
- contract tests
- local chain or fork workflows
- frontend wallet-flow verification

## Stack Defaults

- Prefer `viem` for new TypeScript client code. Current doc primitives to encode are `createPublicClient`, `createWalletClient`, `http`, explicit `chain`, and typed contract clients.
- When a repo uses `ethers`, assume `ethers` v6 naming. Prefer `BrowserProvider` for injected browser wallets and `JsonRpcProvider` for RPC access.
- Treat RPC URLs, chain IDs, contract addresses, ABIs, and env-gated private keys as explicit source-of-truth configuration.
- If a repository mixes `viem` and `ethers`, keep boundaries deliberate and avoid duplicate abstractions over the same wallet or provider flow.

## Engineering Rules

- Prefer repository conventions over generic patterns.
- Do not mutate production code during audit-only tasks.
- Update tests and documentation with behavior changes.
- Treat chain config changes, contract ABI changes, deployment edits, signer logic, and dependency additions as high-risk.
- Stop and surface contradictions instead of guessing.

## Protected Areas

- Secrets, tokens, and `.env` files
- Private keys, seed phrases, keystore files, and wallet exports
- Production infrastructure and deployment configuration
- Database migrations and destructive data operations
- Contract deployment scripts, upgrade scripts, and treasury or signer configuration
- Authentication, authorization, and payment logic
- CI/CD workflows and release automation

## PR Expectations

Every PR should include:

- Problem statement
- Change summary
- Verification commands and results
- Chain or network assumptions
- Risk notes
- Rollback path
