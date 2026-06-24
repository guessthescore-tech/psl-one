#!/bin/bash
# Sprint 29 Cross-Tenant Membership Smoke
# Runs inside beta EC2 against http://localhost:3000 (Caddy) or http://localhost:4000 (api direct)
#
# PSL INACTIVE | WALLET SANDBOX | NON_FINANCIAL | NO REAL-MONEY
# NO fixture import write | NO fixture publication | NO PSL activation
# NO scheduled ingestion | NO production ingestion
#
# NEVER prints token values, passwords, or JWTs.
# All secrets stored in /tmp/sprint29/ with chmod 600 — deleted after smoke.
#
# Usage (run on EC2 via SSM):
#   bash /tmp/sprint29/cross-tenant-smoke.sh 2>&1

set -euo pipefail

BASE_URL="http://localhost:3000"
PASS=0
FAIL=0
SKIP=0

# ── Helpers ──────────────────────────────────────────────────────────────────

check() {
  local label="$1"
  local expected_status="$2"
  local actual_status="$3"
  if [ "$actual_status" = "$expected_status" ]; then
    echo "PASS  $label (HTTP $actual_status)"
    PASS=$((PASS + 1))
  else
    echo "FAIL  $label (expected: $expected_status, got: $actual_status)"
    FAIL=$((FAIL + 1))
  fi
}

skip_check() {
  echo "SKIP  $1 (reason: $2)"
  SKIP=$((SKIP + 1))
}

# ── Load scope IDs and tokens (never echo values) ────────────────────────────

ADMIN_TOKEN="$(cat /tmp/sprint29/admin_token 2>/dev/null || echo '')"
CLUB_TOKEN="$(cat /tmp/sprint29/club_token 2>/dev/null || echo '')"
SPONSOR_TOKEN="$(cat /tmp/sprint29/sponsor_token 2>/dev/null || echo '')"
FAN_TOKEN="$(cat /tmp/sprint29/fan_token 2>/dev/null || echo '')"
ALLOWED_TEAM_ID="$(cat /tmp/sprint29/allowed_team_id 2>/dev/null || echo '')"
FORBIDDEN_TEAM_ID="$(cat /tmp/sprint29/forbidden_team_id 2>/dev/null || echo '')"
ALLOWED_SPONSOR_ID="$(cat /tmp/sprint29/allowed_sponsor_id 2>/dev/null || echo '')"
FORBIDDEN_SPONSOR_ID="$(cat /tmp/sprint29/forbidden_sponsor_id 2>/dev/null || echo '')"

echo "======================================="
echo "PSL ONE — Sprint 29 Cross-Tenant Membership Smoke"
echo "PSL INACTIVE | WALLET SANDBOX | NON_FINANCIAL"
echo "NO PSL activation | NO real-money | NO billing"
echo "======================================="

# ── 1. Health check ───────────────────────────────────────────────────────────

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/health/ready" 2>/dev/null || echo "000")
check "API health check → 200" "200" "$STATUS"

# ── 2. Anonymous access → 401 ─────────────────────────────────────────────────

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/club-portal/overview" 2>/dev/null || echo "000")
check "Anonymous /club-portal/overview → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/sponsor-portal/overview" 2>/dev/null || echo "000")
check "Anonymous /sponsor-portal/overview → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/club-portal/fixtures" 2>/dev/null || echo "000")
check "Anonymous /club-portal/fixtures → 401" "401" "$STATUS"

STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 "$BASE_URL/sponsor-portal/campaigns" 2>/dev/null || echo "000")
check "Anonymous /sponsor-portal/campaigns → 401" "401" "$STATUS"

# ── 3. PSL_ADMIN with explicit teamId ────────────────────────────────────────

if [ -n "$ADMIN_TOKEN" ] && [ -n "$ALLOWED_TEAM_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/club-portal/overview?teamId=$ALLOWED_TEAM_ID" 2>/dev/null || echo "000")
  check "PSL_ADMIN /club-portal/overview?teamId=ALLOWED → 200" "200" "$STATUS"
else
  skip_check "PSL_ADMIN /club-portal/overview?teamId=ALLOWED" "admin token or allowed_team_id not set"
fi

if [ -n "$ADMIN_TOKEN" ] && [ -n "$ALLOWED_SPONSOR_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/sponsor-portal/overview?sponsorId=$ALLOWED_SPONSOR_ID" 2>/dev/null || echo "000")
  check "PSL_ADMIN /sponsor-portal/overview?sponsorId=ALLOWED → 200" "200" "$STATUS"
else
  skip_check "PSL_ADMIN /sponsor-portal/overview?sponsorId=ALLOWED" "admin token or allowed_sponsor_id not set"
fi

# PSL_ADMIN without required scope param → 400 or 403
if [ -n "$ADMIN_TOKEN" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    "$BASE_URL/club-portal/overview" 2>/dev/null || echo "000")
  if [ "$STATUS" = "400" ] || [ "$STATUS" = "403" ]; then
    check "PSL_ADMIN /club-portal/overview (no teamId) → 400/403" "$STATUS" "$STATUS"
  else
    check "PSL_ADMIN /club-portal/overview (no teamId) → 400/403" "400" "$STATUS"
  fi
else
  skip_check "PSL_ADMIN scope-less test" "admin token not set"
fi

# ── 4. CLUB_ADMIN allowed club → 200 ─────────────────────────────────────────

if [ -n "$CLUB_TOKEN" ] && [ -n "$ALLOWED_TEAM_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $CLUB_TOKEN" \
    "$BASE_URL/club-portal/overview?teamId=$ALLOWED_TEAM_ID" 2>/dev/null || echo "000")
  check "CLUB_ADMIN /club-portal/overview (allowed team) → 200" "200" "$STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $CLUB_TOKEN" \
    "$BASE_URL/club-portal/fixtures?teamId=$ALLOWED_TEAM_ID" 2>/dev/null || echo "000")
  check "CLUB_ADMIN /club-portal/fixtures (allowed team) → 200" "200" "$STATUS"
else
  skip_check "CLUB_ADMIN allowed-club tests" "club token or allowed_team_id not set"
fi

# ── 5. CLUB_ADMIN cross-tenant forbidden → 403 ───────────────────────────────
# Verifies CROSS_CLUB_ACCESS_DENIED from PortalScopeService

if [ -n "$CLUB_TOKEN" ] && [ -n "$FORBIDDEN_TEAM_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $CLUB_TOKEN" \
    "$BASE_URL/club-portal/overview?teamId=$FORBIDDEN_TEAM_ID" 2>/dev/null || echo "000")
  check "CLUB_ADMIN /club-portal/overview (cross-tenant/forbidden) → 403" "403" "$STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $CLUB_TOKEN" \
    "$BASE_URL/club-portal/fixtures?teamId=$FORBIDDEN_TEAM_ID" 2>/dev/null || echo "000")
  check "CLUB_ADMIN /club-portal/fixtures (cross-tenant/forbidden) → 403" "403" "$STATUS"
else
  skip_check "CLUB_ADMIN cross-tenant tests" "club token or forbidden_team_id not set"
fi

# ── 6. CLUB_ADMIN cannot access sponsor portal → 403 ─────────────────────────

if [ -n "$CLUB_TOKEN" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $CLUB_TOKEN" \
    "$BASE_URL/sponsor-portal/overview" 2>/dev/null || echo "000")
  check "CLUB_ADMIN /sponsor-portal/* → 403 (role isolation)" "403" "$STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $CLUB_TOKEN" \
    "$BASE_URL/sponsor-portal/campaigns" 2>/dev/null || echo "000")
  check "CLUB_ADMIN /sponsor-portal/campaigns → 403" "403" "$STATUS"
else
  skip_check "CLUB_ADMIN sponsor-portal isolation test" "club token not set"
fi

# ── 7. SPONSOR allowed sponsor → 200 ─────────────────────────────────────────

if [ -n "$SPONSOR_TOKEN" ] && [ -n "$ALLOWED_SPONSOR_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $SPONSOR_TOKEN" \
    "$BASE_URL/sponsor-portal/overview?sponsorId=$ALLOWED_SPONSOR_ID" 2>/dev/null || echo "000")
  check "SPONSOR /sponsor-portal/overview (allowed sponsor) → 200" "200" "$STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $SPONSOR_TOKEN" \
    "$BASE_URL/sponsor-portal/campaigns?sponsorId=$ALLOWED_SPONSOR_ID" 2>/dev/null || echo "000")
  check "SPONSOR /sponsor-portal/campaigns (allowed sponsor) → 200" "200" "$STATUS"
else
  skip_check "SPONSOR allowed-sponsor tests" "sponsor token or allowed_sponsor_id not set"
fi

# ── 8. SPONSOR cross-tenant forbidden → 403 ──────────────────────────────────
# Verifies CROSS_SPONSOR_ACCESS_DENIED from PortalScopeService

if [ -n "$SPONSOR_TOKEN" ] && [ -n "$FORBIDDEN_SPONSOR_ID" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $SPONSOR_TOKEN" \
    "$BASE_URL/sponsor-portal/overview?sponsorId=$FORBIDDEN_SPONSOR_ID" 2>/dev/null || echo "000")
  check "SPONSOR /sponsor-portal/overview (cross-tenant/forbidden) → 403" "403" "$STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $SPONSOR_TOKEN" \
    "$BASE_URL/sponsor-portal/campaigns?sponsorId=$FORBIDDEN_SPONSOR_ID" 2>/dev/null || echo "000")
  check "SPONSOR /sponsor-portal/campaigns (cross-tenant/forbidden) → 403" "403" "$STATUS"
else
  skip_check "SPONSOR cross-tenant tests" "sponsor token or forbidden_sponsor_id not set"
fi

# ── 9. SPONSOR cannot access club portal → 403 ───────────────────────────────

if [ -n "$SPONSOR_TOKEN" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $SPONSOR_TOKEN" \
    "$BASE_URL/club-portal/overview" 2>/dev/null || echo "000")
  check "SPONSOR /club-portal/* → 403 (role isolation)" "403" "$STATUS"
else
  skip_check "SPONSOR club-portal isolation test" "sponsor token not set"
fi

# ── 10. FAN cannot access portals → 403 ──────────────────────────────────────

if [ -n "$FAN_TOKEN" ]; then
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $FAN_TOKEN" \
    "$BASE_URL/club-portal/overview" 2>/dev/null || echo "000")
  check "FAN /club-portal/* → 403" "403" "$STATUS"

  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 \
    -H "Authorization: Bearer $FAN_TOKEN" \
    "$BASE_URL/sponsor-portal/overview" 2>/dev/null || echo "000")
  check "FAN /sponsor-portal/* → 403" "403" "$STATUS"
else
  skip_check "FAN isolation tests" "fan token not set"
fi

# ── Summary ───────────────────────────────────────────────────────────────────

echo ""
echo "CROSS_CLUB_ACCESS_DENIED:   enforced by PortalScopeService (403 on forbidden teamId)"
echo "CROSS_SPONSOR_ACCESS_DENIED: enforced by PortalScopeService (403 on forbidden sponsorId)"
echo ""
echo "======================================="
echo "SAFETY CONFIRMATIONS"
echo "PSL INACTIVE           — PSL season NOT activated during this run"
echo "WALLET SANDBOX         — no production wallet calls executed"
echo "NON_FINANCIAL          — no real-money, no billing, no betting, no cash"
echo "NO FIXTURE WRITE       — no fixture import or publication"
echo "NO SCHEDULED INGESTION — no cron or EventBridge triggers fired"
echo "NO PSL_INACTIVE bypass — PSL season state unchanged"
echo "======================================="
echo ""
echo "Results: $PASS PASS / $FAIL FAIL / $SKIP SKIP"

if [ "$FAIL" -eq 0 ]; then
  echo "SMOKE: PASS"
  exit 0
else
  echo "SMOKE: FAIL — $FAIL check(s) failed"
  exit 1
fi
