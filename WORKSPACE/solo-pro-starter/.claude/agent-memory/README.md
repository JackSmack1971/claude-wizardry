# Agent Memory

This directory stores project-scoped persistent notes for named agents.

Keep entries short, operational, and evidence-led. Do not store secrets, credentials, or machine-local values here.

Preferred sections:
- `Persistent Priorities`: stable decision rules that should survive compaction
- `Known Risk Surfaces`: repo-specific areas that deserve repeated scrutiny
- `Handoff Checklist`: the minimum facts an agent should return before control passes back

Keep one directory per named agent so workflow handoff paths remain stable.

If an audit or release workflow delegates to a specialized agent, add its memory directory here in the same change.
