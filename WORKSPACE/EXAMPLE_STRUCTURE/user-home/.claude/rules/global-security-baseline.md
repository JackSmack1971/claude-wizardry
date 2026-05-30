---
name: global-security-baseline
description: Default security hygiene for all projects.
---

# Global Security Baseline

- Treat all input as untrusted.
- Never print secrets.
- Never commit credential files.
- Prefer allowlists over denylists for risky operations.
- Use least-privilege permissions.
- Add tests for authorization, validation, and failure behavior when changing security-sensitive code.
