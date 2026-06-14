# PSL One — Review Agents

This directory contains inline review prompt files for `codex review` sessions and independent review passes.

## Files

| File | Purpose | Format |
|------|---------|--------|
| `security-review.md` | OWASP Top 10, RBAC violations, auth failures, secrets exposure | Codex review prompt |
| `performance-review.md` | N+1 queries, slow scans, bundle size, Redis misuse | Codex review prompt |
| `technical-review-board.md` | Full TRB-style review: architecture, security, scalability, testing | Codex review prompt |

## Usage

`codex review` takes a positional PROMPT argument — there is no `--prompt` flag:

```bash
# Security pass
codex review "$(cat .codex/review-agents/security-review.md)"

# Performance pass
codex review "$(cat .codex/review-agents/performance-review.md)"

# Full TRB review
codex review "$(cat .codex/review-agents/technical-review-board.md)"
```

Review uncommitted changes or a specific branch:

```bash
codex review --uncommitted "$(cat .codex/review-agents/security-review.md)"
codex review --base main "$(cat .codex/review-agents/technical-review-board.md)"
```

## Relationship to Agent Role Prompt Files

The prompt files in this directory are **inline prompts** — short instruction sets used as one-shot review triggers.

The agent role prompts in `.codex/agents/` are **full role prompts** — they carry system instructions, skill references, and project context for multi-step agent sessions. Pass them via `codex exec "$(cat .codex/agents/<name>.md)"`.

For a quick review pass, use the prompts here. For a thorough, multi-file review with project context, use the agent role prompts.

## PSL One Review Constraints

All reviews must check:

1. No PSL season activation code has been added
2. No real-money movement paths exist
3. No production API keys or secrets are present in source
4. RBAC is not bypassed on any admin route
5. Admin mutations write `AdminAuditLog`
6. Business logic is not stored in the frontend

These constraints apply regardless of which review prompt is used.
