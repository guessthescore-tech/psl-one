# Historical Records

This directory contains implementation records retained for traceability. They are not the current source of architectural or engineering guidance.

## Purpose

Historical records preserve:

- Sprint completion summaries that document what was built, tested, and accepted at a given point in time.
- Pre-commit handover notes written between working sessions, recording the state of the working tree when work was interrupted.
- Decisions and context that are not repeated in the current documentation.

## Interpretation

| What they are | What they are not |
|---|---|
| Point-in-time records of what was accepted | Current architectural guidance |
| Implementation traceability | Instructions for future development |
| Test counts and story index at the time of writing | Authoritative API or schema documentation |

Counts (tests, routes, pages) in historical records reflect the moment of writing. Current counts are in `docs/reference/`.

## Current authoritative documentation

| Topic | Location |
|---|---|
| Architecture decisions | `docs/adr/` |
| System architecture | `docs/architecture/` |
| Engineering guides | `docs/engineering/` |
| API routes | `docs/reference/API-ROUTES.md` |
| Database models | `docs/reference/DATABASE-MODELS.md` |
| Current platform state | `docs/project/CURRENT-STATE.md` |
| Story index | `docs/project/STORY-INDEX.md` |

## Contents

### handovers/

| File | Sprint/Story | Date | Coverage |
|---|---|---|---|
| `SPRINT-1-HANDOVER.md` | Sprint 1 (STORY-01 to STORY-21) | 2026-06-10 | 21 stories, 812 tests, World Cup beta foundation |
| `SPRINT-1-FINAL-HANDOVER.md` | Sprint 1 final | 2026-06-11 | Full platform summary, admin command centre included |
| `STORY-38-HANDOVER.md` | STORY-38 | 2026-06-14 | Live Match Intelligence & Social Prediction Gaming — pre-commit state |
| `STORY-39-HANDOVER.md` | STORY-39 | 2026-06-14 | Beta Launch Readiness — pre-commit state |

STORY-38 and STORY-39 work is now committed in `d0cc591` and `08e3852` respectively. The handovers describe the pre-commit working tree state and are retained only for traceability.
