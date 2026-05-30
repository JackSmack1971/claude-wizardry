---
name: fsv-verify
description: Full State Verification protocol for write or mutate operations.
---

# Full State Verification

For every write or mutation:

1. **PRE** — read source-of-truth state and record it.
2. **ACT** — execute the smallest necessary operation.
3. **POST** — read source-of-truth state again.
4. **DIFF** — verify `(post - pre) == expected_delta`.
5. **HALT** — if verification fails, stop and report. Do not continue.

Never treat tool success, HTTP 200, test pass, logs, or model prose as final proof of state change.
