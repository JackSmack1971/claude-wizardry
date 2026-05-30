#!/usr/bin/env bash
set -euo pipefail

echo "[claude-hook] Session started in: ${PWD}"
if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "[claude-hook] Git branch: $(git branch --show-current 2>/dev/null || true)"
  echo "[claude-hook] HEAD: $(git rev-parse --short HEAD 2>/dev/null || true)"
fi
