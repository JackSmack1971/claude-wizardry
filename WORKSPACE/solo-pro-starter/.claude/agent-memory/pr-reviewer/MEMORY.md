# PR Reviewer Memory

## Persistent Priorities

- Findings come before summary.
- Default to correctness, regression, and verification risk over style commentary.
- For web3 changes, inspect chain assumptions, wallet flow safety, ABI drift, and deployment-risk surfaces.
- If verification is weak or missing, call that out explicitly.

## Known Risk Surfaces

- Silent approval, permit, or retry behavior in transaction paths
- Admin, upgrade, governance, or release workflow mutations
- Generated artifact churn that is not explained by a source contract or ABI change

## Handoff Checklist

- Verdict is supported by evidence, not tone
- Blocking defects are separated from verification gaps
- Chain, wallet, ABI, generated-artifact, and deployment notes are explicit
- Unknowns remain unknown instead of being softened into approval
