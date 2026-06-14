# PSL One — Codex Adapter

This directory contains the repository-scoped Codex CLI configuration for PSL One.

## Files

| File | Purpose |
|------|---------|
| `config.toml.example` | Reference config template — copy to `~/.codex/config.toml` if desired |
| `agents/` | Agent role prompt files (Markdown) — pass via `codex exec "$(cat ...)"` |
| `review-agents/` | Inline review prompt files for `codex review` and independent review sessions |

## Quick Start

```bash
# Check Codex version (requires 0.139.x+)
codex --version

# Run an interactive session — AGENTS.md and .agents/skills/ are loaded automatically
codex

# Run a non-interactive exec task
codex exec "Review the AuthModule for RBAC violations"

# Run a code review (prompt as positional argument)
codex review "$(cat .codex/review-agents/security-review.md)"

# Validate this Codex project configuration
pnpm codex:validate
```

## Agent Role Prompts

The `.codex/agents/` directory contains Markdown role prompts. These are NOT executable
agent configs — codex-cli 0.139.0 does not support `--agent <file>`. Use them by passing
the content as a prompt:

```bash
# Pass role prompt as argument:
codex exec "$(cat .codex/agents/independent-code-reviewer.md)"
codex exec "$(cat .codex/agents/security-reviewer.md)"
codex exec "$(cat .codex/agents/architecture-reviewer.md)"

# Or pipe via stdin:
cat .codex/agents/implementation-engineer.md | codex exec -

# With explicit sandbox mode:
codex exec -s read-only "$(cat .codex/agents/independent-code-reviewer.md)"
```

## Skills

Skill definitions live in `.agents/skills/`. Load them into any agent session to provide structured domain knowledge:

| Skill | Path |
|-------|------|
| Project context | `.agents/skills/psl-one-project-context/` |
| Independent review | `.agents/skills/psl-one-independent-review/` |
| Story implementation | `.agents/skills/psl-one-story-implementation/` |
| Database change | `.agents/skills/psl-one-database-change/` |
| Security review | `.agents/skills/psl-one-security-review/` |
| Release readiness | `.agents/skills/psl-one-release-readiness/` |

## Configuration

> **Note — project-local config loading:** As of codex-cli 0.139.0, global user
> configuration is loaded from `~/.codex/config.toml`. Project-local `.codex/config.toml`
> loading is **not confirmed** for this version. See `config.toml.example` for a reference
> template that can be copied to `~/.codex/config.toml`.

`config.toml.example` documents the recommended settings:
- `approval_policy = "on-request"` — prompt before executing commands (confirmed valid)
- `shell_environment_policy` — inherit nothing; set `NODE_ENV=test`
- `sandbox_permissions = ["disk-full-read-access"]` — read-only filesystem (commented out as reference)

`AGENTS.md` and `.agents/skills/` are auto-discovered by Codex at the repository root.

Override settings per session with `-c`:

```bash
codex -c approval_policy="on-request" exec "Audit the AuthModule"
codex exec -s read-only "Review security headers"
```

## Review Agents

`review-agents/` contains prompt files for specialised review passes. Pass the content
as a positional argument to `codex review` (the `--prompt` flag does not exist):

```bash
# Correct usage (positional argument):
codex review "$(cat .codex/review-agents/security-review.md)"
codex review "$(cat .codex/review-agents/performance-review.md)"
codex review "$(cat .codex/review-agents/technical-review-board.md)"

# Review uncommitted changes:
codex review --uncommitted "$(cat .codex/review-agents/security-review.md)"

# Review a specific branch:
codex review --base main "$(cat .codex/review-agents/technical-review-board.md)"
```

| File | Purpose |
|------|---------|
| `security-review.md` | OWASP, RBAC, auth, secrets scan |
| `performance-review.md` | N+1, slow queries, bundle size, Redis misuse |
| `technical-review-board.md` | Full TRB-style architectural review |
| `README.md` | This directory's guide |

## Safety

All Codex agents in this repository are subject to the constraints in `AGENTS.md`:
- No PSL season activation
- No real money movement
- No production API calls
- No migration rewrites
- No commits without explicit instruction
