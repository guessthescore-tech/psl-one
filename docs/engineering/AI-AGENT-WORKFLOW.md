# PSL One — AI Agent Workflow

**Purpose:** How AI coding agents are configured and used in this repository  
**Audience:** Engineers, code reviewers, agents  
**Status:** Current as of S3-INFRA-00  

---

## Agent Adapters

PSL One supports two AI coding agent adapters in parallel:

| Adapter | Instructions file | Config directory | Version |
|---------|------------------|-----------------|---------|
| Claude Code | `CLAUDE.md` | `.claude/` | Claude Sonnet 4.x |
| Codex | `AGENTS.md` | `.codex/` | codex-cli 0.139.x |

Both adapters share the same non-negotiable rules, safety constraints, and acceptance gate. They are not alternatives — they can run independently or together. `AGENTS.md` and `CLAUDE.md` are kept in sync whenever project rules change.

---

## Codex Configuration

### Entry point: AGENTS.md

`AGENTS.md` at the repository root is the Codex adapter's primary instructions file. It is automatically loaded by Codex when starting a session. It covers:

- Project identity and repository layout
- Non-negotiable rules (8 rules from CLAUDE.md)
- Safety constraints (PSL activation, financial, external systems)
- Architecture patterns (RBAC, audit log, pagination, service tests)
- Development workflow
- Environment variables
- Testing conventions
- Migration rules
- Domain quick reference
- Source of truth hierarchy

### Runtime configuration: .codex/config.toml.example

> **Loading note:** As of codex-cli 0.139.0, the global user config is at `~/.codex/config.toml`.
> Project-local `.codex/config.toml` loading is **not confirmed** for this version.
> `config.toml.example` documents recommended settings that can be copied to `~/.codex/config.toml`.
> `AGENTS.md` and `.agents/skills/` are auto-discovered at the repository root — no config entry required.

Confirmed valid per-session overrides (via `-c`):

```bash
codex -c approval_policy="on-request" exec "..."
codex exec -s read-only "..."
codex -c 'sandbox_permissions=["disk-full-read-access"]' exec "..."
```

### Agent roles: .codex/agents/

> **CLI limitation:** codex-cli 0.139.0 does not support the `--agent` flag. The files in
> `.codex/agents/` are Markdown **role prompt templates** — pass their content as a prompt.

| Agent prompt | Role | When to use |
|-------------|------|------------|
| `independent-code-reviewer.md` | Unbiased post-implementation review | After story completion, before commit |
| `implementation-engineer.md` | Story delivery | During story implementation |
| `test-and-quality-reviewer.md` | Test coverage audit | After story completion |
| `security-reviewer.md` | Security and compliance review | Before staging deployment |
| `architecture-reviewer.md` | ADR and domain boundary review | When new modules or ADRs are added |

Usage:
```bash
# Pass role prompt as positional argument:
codex exec "$(cat .codex/agents/independent-code-reviewer.md)"

# With sandbox mode:
codex exec -s read-only "$(cat .codex/agents/security-reviewer.md)"

# Pipe via stdin:
cat .codex/agents/implementation-engineer.md | codex exec -
```

### Review prompts: .codex/review-agents/

`codex review` takes a positional PROMPT argument — there is no `--prompt` flag:

```bash
# Correct usage:
codex review "$(cat .codex/review-agents/security-review.md)"
codex review "$(cat .codex/review-agents/performance-review.md)"
codex review --uncommitted "$(cat .codex/review-agents/technical-review-board.md)"
codex review --base main "$(cat .codex/review-agents/technical-review-board.md)"
```

---

## Skill System

Skills are structured knowledge sets that agents load to operate in specific contexts. They live in `.agents/skills/`.

| Skill | Purpose | Agents that use it |
|-------|---------|------------------|
| `psl-one-project-context` | Core project context | All agents |
| `psl-one-independent-review` | Review checklist, severity model, report template | Reviewer agents |
| `psl-one-story-implementation` | 14-step delivery workflow, acceptance gate | Implementation engineer |
| `psl-one-database-change` | Prisma migration checklist | Implementation engineer |
| `psl-one-security-review` | Security controls, OWASP checklist | Security reviewer |
| `psl-one-release-readiness` | Release gate, staging prerequisites | Release readiness |

Each skill directory contains:
- `SKILL.md` — the skill definition loaded by the agent
- `references/` — detailed reference documents the skill links to

---

## Claude Code Configuration

### Entry point: CLAUDE.md

`CLAUDE.md` at the repository root governs Claude Code behaviour. It contains the same non-negotiable rules and safety constraints as `AGENTS.md`.

### Claude-specific tooling: .claude/

| Directory | Purpose |
|-----------|---------|
| `.claude/agents/` | Claude Code agent role definitions |
| `.claude/skills/` | Claude Code skill definitions |
| `.claude/tasks/` | Task templates |
| `.claude/operations/` | Autonomous operation definitions |
| `.claude/review-agents/` | PR review agent definition |
| `.claude/settings.json` | Project-level Claude Code settings |

Session memory (`.claude/projects/`) is gitignored — it contains local absolute paths and should not be committed.

---

## Independent Review Workflow

The independent review is a post-implementation quality gate run after every story:

1. Implementation engineer delivers the story and reports gate results
2. Product/tech lead triggers an independent review agent
3. Independent reviewer reads the changed files with no prior context
4. Reviewer applies the checklist from `.agents/skills/psl-one-independent-review/references/review-checklist.md`
5. Reviewer classifies findings using the severity model
6. Reviewer outputs a report using the report template
7. Verdict: PASS / PASS WITH COMMENTS / FAIL
8. FAIL requires the implementation engineer to address CRITICAL and HIGH findings before re-review

Independent review is not optional. It is part of the story acceptance gate.

---

## Validation

Validate the Codex project configuration at any time:

```bash
pnpm codex:validate
# or:
node scripts/validate-codex-project.mjs
```

This checks:
- `AGENTS.md` exists at root with required safety content
- `AGENTS.md` does not contain forbidden patterns (auto-commit, AWS CLI, Terraform)
- `.codex/config.toml.example` exists (project-local config reference template)
- `.codex/config.toml.example` does not contain credentials or dangerous defaults
- All 5 agent role prompt `.md` files exist (not `.toml` — unsupported in 0.139.0)
- Agent `.md` files do not document unsupported CLI flags (`--agent`, `--prompt`)
- `.codex/README.md` exists
- All 3 legacy review-agent prompt files exist
- `.codex/review-agents/README.md` exists
- All 6 skill directories have `SKILL.md` with valid YAML frontmatter
- All skill names are unique
- All expected reference files exist in each skill
- Acceptance-gate commands use `pnpm`, not `npx prisma`
- `docs/engineering/AI-AGENT-WORKFLOW.md` exists (this file)
- `scripts/validate-codex-project.mjs` uses `node:fs` and `node:path` imports
- `package.json` has exactly one `codex:validate` entry

---

## Keeping AGENTS.md and CLAUDE.md in Sync

When project rules change (new non-negotiable rule, new safety constraint, new ADR):

1. Update `CLAUDE.md`
2. Update `AGENTS.md` with the same change
3. Update `.agents/skills/psl-one-project-context/SKILL.md` if the change affects core context
4. Update the relevant skill reference document if a checklist item changes

Both files must always agree on non-negotiable rules and safety constraints.

---

## Agent Safety Constraints Summary

Every agent operating in this repository is bound by these constraints regardless of which adapter is used:

- No PSL season activation
- No real money movement
- Fantasy, predictions, social prediction: points-only
- Wallet: sandbox adapter only
- No production API calls
- No provider secrets in source
- No migration rewrites
- No commit without "commit this" instruction
- No push without "push it" instruction
- No AWS commands or Terraform without explicit instruction
- STORY-40 reserved — do not implement
