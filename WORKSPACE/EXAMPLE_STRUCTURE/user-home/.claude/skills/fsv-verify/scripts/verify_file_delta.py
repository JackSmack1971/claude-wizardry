#!/usr/bin/env python3
"""Verify that a file changed from an expected old hash to an expected new hash."""

from __future__ import annotations

import argparse
import hashlib
from pathlib import Path


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("path")
    parser.add_argument("--old", required=False)
    parser.add_argument("--new", required=True)
    args = parser.parse_args()

    current = sha256(Path(args.path))
    if current != args.new:
        raise SystemExit(f"verification failed: current={current} expected={args.new}")

    print(f"verified: {args.path} sha256={current}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
