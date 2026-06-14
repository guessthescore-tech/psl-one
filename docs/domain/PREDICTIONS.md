# PSL One — Predictions Domain

**Purpose:** Guess the Score prediction lifecycle, rules, and points  
**Audience:** Backend engineers, product  
**Status:** Current as of STORY-39  
**Last verified:** 2026-06-14  

---

## Domain Overview

"Guess the Score" — fans predict the exact scoreline of published fixtures. Points awarded for correct results and exact scores.

Modules: `PredictionsModule`, `PredictionRulesModule`

---

## Prediction Lifecycle

```
PENDING → (match settled by admin) → WON / LOST / VOID
```

- **PENDING** — fan has submitted a prediction, match not yet played
- **WON** — prediction was correct (exact score or correct result, per rules config)
- **LOST** — prediction was incorrect
- **VOID** — fixture cancelled, or admin voided the prediction

---

## PredictionRulesConfig

Admin-configurable per season:

| Field | Description |
|-------|-------------|
| `exactScorePoints` | Points for exact score (e.g., 3) |
| `correctResultPoints` | Points for correct result (win/draw/loss, e.g., 1) |
| `predictionWindowMinutes` | Minutes before kickoff that predictions close |
| `maxPredictionsPerFixture` | Number of predictions a fan can make per fixture |

Managed at:
- `POST /admin/prediction-rules/:seasonId`
- `GET /admin/prediction-rules/:seasonId`

---

## PredictionPointsLedger

Immutable points record. Written when a prediction is settled:

```
Type: EXACT_SCORE_WIN | CORRECT_RESULT_WIN | LOSS | VOID_REFUND
```

Never updated. Corrections are new entries. Used for fan leaderboard scoring.

---

## Fan Value Side Effects

When a fan submits a prediction, `FanValueLedger` receives an engagement entry. This is a non-financial loyalty signal, separate from prediction points.

---

## API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| GET | `/predictions` | Fan | List my predictions |
| POST | `/predictions` | Fan | Submit a prediction |
| GET | `/predictions/:id` | Fan | Get a prediction |
| DELETE | `/predictions/:id` | Fan | Cancel before lock |
| GET | `/admin/predictions` | Admin | All predictions |
| POST | `/admin/predictions/:id/settle` | Admin | Settle a prediction |
| POST | `/admin/predictions/:id/void` | Admin | Void a prediction |
| POST | `/admin/fixtures/:id/lock` | Admin | Lock all predictions for fixture |

---

## Key Rules

1. **Fixture must be published**: `fixture.isPublished: true` required for prediction creation
2. **Prediction window**: Predictions close `predictionWindowMinutes` before kickoff
3. **Lock prevents changes**: Once admin locks a fixture, no new predictions or cancellations
4. **Exact score priority**: If a fan scores both exact and result, only exact points are awarded (no double-counting)
5. **Void returns nothing**: VOID predictions are logged in ledger with `VOID_REFUND` type (0 points — record only)
6. **Immutable ledger**: `PredictionPointsLedger` rows are never updated or deleted
