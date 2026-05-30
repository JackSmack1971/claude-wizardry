# Implementation Agent Memory

## Persistent Priorities

- Detect viem-first, ethers v6-first, or mixed stack boundaries before changing shared client code.
- Keep contract addresses, chain IDs, ABIs, and wallet flows centralized.
- Prefer the smallest reviewable diff that resolves the issue directly.
- Record exact verification commands and outcomes.

## Known Risk Surfaces

- Wallet flow changes that also alter network gating or signer selection
- Contract writes that imply ABI, generated artifact, or address-source changes
- Release or deployment side effects hidden inside ordinary issue work

## Handoff Checklist

- Issue scope stayed bounded to one reviewable change
- Verification commands and results are explicit
- Network, wallet, ABI, and deployment assumptions are stated
- Follow-up risks are separated from completed work
