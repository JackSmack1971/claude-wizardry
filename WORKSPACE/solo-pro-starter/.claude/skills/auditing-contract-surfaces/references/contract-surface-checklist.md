# Contract Surface Checklist

- What is the authoritative ABI source?
- Are generated artifacts committed, generated, or manually edited?
- Where do contract addresses come from?
- Are addresses environment-scoped?
- Which codepaths perform reads only?
- Which codepaths perform writes or signing?
- Are revert paths or decoded errors tested or surfaced?
