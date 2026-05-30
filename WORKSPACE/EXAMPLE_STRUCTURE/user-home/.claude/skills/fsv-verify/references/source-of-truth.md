# Source-of-Truth Reference

A source of truth is the authoritative state store for the domain being changed.

Examples:

- Git state: `git status`, `git diff`, `git rev-parse HEAD`
- Database state: direct query against the target table
- File state: actual file contents from disk
- API state: read-after-write response from the authoritative API
- Deployment state: platform deployment record, health checks, and logs
