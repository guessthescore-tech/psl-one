# Review Report Template

Copy this template for every review output.

---

```markdown
# Code Review — [Scope / Story / Module]

**Reviewer:** [Agent name or human]  
**Date:** [YYYY-MM-DD]  
**Scope:** [File list, module name, or git range]  
**Skills used:** psl-one-independent-review, psl-one-project-context  

---

## Verdict: [PASS | PASS WITH COMMENTS | FAIL]

---

## Critical Findings (Severity: CRITICAL)

> Findings that must be fixed before merge. Each one causes a FAIL verdict.

### [C1] [Short title]

**File:** `path/to/file.ts:line`  
**Severity:** CRITICAL  
**Finding:** [What is wrong]  
**Risk:** [What could happen if not fixed]  
**Fix:** [What must change]

---

## High Severity Findings

### [H1] [Short title]

**File:** `path/to/file.ts:line`  
**Severity:** HIGH  
**Finding:** [What is wrong]  
**Risk:** [What could happen if not fixed]  
**Fix:** [What must change]

---

## Medium Severity Findings

### [M1] [Short title]

**File:** `path/to/file.ts:line`  
**Severity:** MEDIUM  
**Finding:** [What is wrong]  
**Fix:** [Suggested improvement]

---

## Low Severity Findings

### [L1] [Short title]

**File:** `path/to/file.ts:line`  
**Severity:** LOW  
**Finding:** [Minor issue or style note]

---

## Positive Observations

- [What was done well — cite file and pattern]
- [What patterns are consistent with the codebase]

---

## Non-Negotiable Checklist Result

| Rule | Result |
|------|--------|
| RBAC on all admin routes | PASS / FAIL |
| Audit log on all admin mutations | PASS / FAIL |
| No business logic in frontend | PASS / FAIL |
| Domain boundaries respected | PASS / FAIL |
| Tests for all new methods | PASS / FAIL |
| No PSL activation code | PASS / FAIL |
| No real-money paths | PASS / FAIL |
| No production API calls | PASS / FAIL |

---

## Summary

[2-4 sentences summarising the overall code quality, the most important finding, and what must happen before this can be merged or accepted.]
```
