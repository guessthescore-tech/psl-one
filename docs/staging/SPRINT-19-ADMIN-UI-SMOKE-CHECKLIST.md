# Sprint 19 — Admin UI Smoke Checklist

## Purpose

Manual checklist for testing the Sprint 18/19 admin pages on Vercel preview or beta EC2 deployment.

**Do not activate PSL. Do not enable scheduled ingestion. Points-only.**

---

## Routes to Test

| Route | File | Description |
|-------|------|-------------|
| `/admin/data-provider/parse-psl` | `apps/experience/src/app/admin/data-provider/parse-psl/page.tsx` | Parse PSL ingestion (dry-run-first) |
| `/admin/fixtures/imported` | `apps/experience/src/app/admin/fixtures/imported/page.tsx` | Fixture manager (review + publish) |
| `/admin/psl/preflight` | `apps/experience/src/app/admin/psl/preflight/page.tsx` | PSL activation pre-flight (read-only) |

---

## Checklist: /admin/data-provider/parse-psl

- [ ] Page loads without 5xx error
- [ ] Auth guard shows login prompt or 401 if unauthenticated
- [ ] Dry-run button is visible and labelled "dry-run"
- [ ] Write/confirm button requires a separate confirmation action
- [ ] No provider key (PARSE_API_KEY) is displayed anywhere on the page
- [ ] Source-empty message is clear: "No fixtures returned from Parse PSL — expected until ~July/August 2026"
- [ ] Admin warning: "No PSL activation" or similar is visible

---

## Checklist: /admin/fixtures/imported

- [ ] Page loads without 5xx error
- [ ] Filter controls are visible (provider source, published status)
- [ ] "Load Fixtures" button works — returns empty table with source-empty message OR list if data exists
- [ ] Empty state message is clear: "Source may be empty until psl.co.za publishes 2026/27 fixtures (~July/August 2026)"
- [ ] Yellow warning banner visible: "Publishing is SEPARATE from PSL activation"
- [ ] Checkbox selection works (individual + select-all)
- [ ] Publish/Unpublish radio buttons are visible
- [ ] confirmPublication checkbox is required before submit button is enabled
- [ ] Submit button is disabled without confirmPublication
- [ ] No provider key displayed anywhere
- [ ] Points-only messaging visible: "Points only — no real money"

---

## Checklist: /admin/psl/preflight

- [ ] Page loads without 5xx error
- [ ] "Run Pre-Flight Check" button visible
- [ ] Optional season ID input is visible
- [ ] Clicking "Run Pre-Flight Check" calls the API
- [ ] Status banner shows GO / CONDITIONAL_GO / NO_GO
- [ ] Blockers list renders (red) if blockers present
- [ ] Warnings list renders (yellow) if warnings present
- [ ] Individual checks table renders with check name, status, detail
- [ ] wallet_sandbox_only check visible in results
- [ ] no_real_money_flags check visible in results
- [ ] Footer reminder: "PSL activation must be performed via Season Switching admin action"
- [ ] Blue info banner: "This page is read-only. Running a pre-flight check makes no database changes"
- [ ] No provider key displayed
- [ ] "Does NOT activate PSL" messaging visible

---

## Common Failure Modes

| Symptom | Likely Cause | Action |
|---------|-------------|--------|
| 500 on admin routes | API container on Sprint 17 (Sprint 18 routes don't exist) | Deploy Sprint 18 image |
| Empty fixture table | Parse PSL source empty (~July/August 2026) | Expected — not a bug |
| Pre-flight shows NO_GO with "No fixtures" | No fixtures ingested yet | Expected — not a bug |
| Publish button always disabled | confirmPublication not checked | User must check confirmation |
| "Auth required" / 401 | Admin JWT not present in browser | Log in with admin account |

---

## Notes

- Admin pages require an ADMIN-role JWT in the API
- These pages are `'use client'` components — no SSR API calls
- Parse PSL source data expected ~July/August 2026 (2026/27 PSL season fixtures)
- The Vercel preview URL for Sprint 18/19: `psl-one-experience-preview-ix0ke73wn-guess-the-score.vercel.app`
