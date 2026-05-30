from pathlib import Path
import hashlib
import sys


def digest(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


for raw in sys.argv[1:]:
    path = Path(raw)
    if not path.exists():
        print(f"MISSING {path.as_posix()}")
        continue
    if path.is_dir():
        print(f"DIR {path.as_posix()}")
        continue
    print(f"{digest(path)}  {path.as_posix()}")
