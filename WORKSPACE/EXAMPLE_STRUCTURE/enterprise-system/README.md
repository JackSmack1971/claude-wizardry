# Enterprise System Directory

This directory models an administrator-controlled Claude Code policy layer.

- `managed-settings.json` is the immutable baseline.
- `managed-settings.d/*.json` are modular policy fragments.
- Keep real enterprise policies in version-controlled infrastructure-management repos.
- Do not store user OAuth tokens or project secrets here.
