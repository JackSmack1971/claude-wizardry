from pathlib import Path


MANIFEST_NAMES = {
    "package.json",
    "package-lock.json",
    "pnpm-lock.yaml",
    "yarn.lock",
    "pyproject.toml",
    "poetry.lock",
    "requirements.txt",
    "Pipfile",
    "Cargo.toml",
    "Cargo.lock",
    "go.mod",
    "go.sum",
}


for path in Path(".").rglob("*"):
    if path.is_file() and path.name in MANIFEST_NAMES:
        print(path.as_posix())
