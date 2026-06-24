# Sprint 37 — Provider Environment Variable Validation

## Purpose

Documents how provider env vars are validated server-side and what the sprint-37 env check tool does.

## Security Rules

| Rule | Enforcement |
|------|-------------|
| Provider keys are server-side only | Keys must never appear in `NEXT_PUBLIC_*` variables |
| Keys are never logged | No `console.log(key)` or `logger.log(key)` in adapters |
| Keys are never returned in API responses | Readiness endpoint returns presence flag only |
| No env files committed | `.gitignore` excludes `.env*` except `.env.example` |
| Dual activation (DATA_PROVIDER + key) | Key alone never activates a provider |

## Environment Variables

| Variable | Used by | Required with |
|----------|---------|---------------|
| `DATA_PROVIDER` | `DataProviderService` | One of the keys below |
| `PARSE_API_KEY` | `ParsePslAdapter` | `DATA_PROVIDER=parse-psl` |
| `API_FOOTBALL_KEY` | `ApiFootballAdapter` | `DATA_PROVIDER=api-football` |
| `FOOTBALL_DATA_API_KEY` | `FootballDataOrgAdapter` | `DATA_PROVIDER=football-data-org` OR via ProviderRouterService WC route |

## What the Tool Checks

Tool: `tools/staging/sprint-37-provider-env-check.mjs`

| Check | Output |
|-------|--------|
| `DATA_PROVIDER` set or not | INFO/WARN |
| Key present for configured provider | PASS/FAIL |
| Unused key present (provider mismatch) | WARN |
| `NEXT_PUBLIC_*` provider key detected | FAIL (exits 1) |
| Provider pairing valid | PASS/WARN |

## Usage

```bash
DATA_PROVIDER=parse-psl node tools/staging/sprint-37-provider-env-check.mjs
```

Key values are never printed. The tool only reports presence (`true`/`false`) and pairing validity.

## Expected Safe Output (beta without provider)

```json
{
  "dataProvider": "not_set",
  "parsePslConfigured": false,
  "apiFootballConfigured": false,
  "footballDataConfigured": false,
  "anyProviderConfigured": false,
  "frontendKeyExposure": "not_detected",
  "safe": true
}
```

## Forbidden States

| State | Reason |
|-------|--------|
| `frontendKeyExposure: "DETECTED_UNSAFE"` | Key in NEXT_PUBLIC_* — immediately remove |
| `DATA_PROVIDER=api-football` + no AF key | NoOpAdapter fallback — not an error but check intent |
| Key present + DATA_PROVIDER mismatch | Key is unused — warning only |

## Safety Boundaries

- Tool never makes API calls
- Tool never writes env files
- Tool never prints key values
- Tool exits 0 unless NEXT_PUBLIC_ exposure detected
