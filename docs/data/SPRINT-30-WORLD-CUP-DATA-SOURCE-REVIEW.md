# Sprint 30 — World Cup 2026 Data Source Review

**Status:** RESEARCH_COMPLETE | PSL INACTIVE | WALLET SANDBOX | BETA ONLY
**Date:** 2026-06-24

## Overview

This document reviews available data sources for World Cup 2026 content in the PSL One beta platform.
WC2026 is the active competition context. PSL remains inactive (fixtures ~July/August 2026).

---

## 1. football-data.org

**Type:** REST API  
**Free tier:** Yes — 10 requests/minute, commercial use requires licence  
**WC2026 coverage:** CONFIRMED (Sprint 13 validation: 104 matches ingested)  
**Authentication:** `X-Auth-Token` header (env var, never exposed to frontend)

### Available on free tier
- Fixture schedule (all rounds)
- Team list (48 teams)
- Group standings
- Venue data
- Kickoff times and status
- Basic player stats (limited)

### Limitations
- Rate limit: 10 req/min (manageable for dry-run ingestion)
- Squad depth: limited on free tier
- Live match data: minimal on free tier
- Head-to-head history: not available free

### ToS / Licensing
- Free tier for non-commercial / personal use
- Commercial use requires paid plan (Pro/Enterprise)
- Attribution required on public display
- No redistribution of raw data
- **Recommendation:** Suitable for beta fixture/team data; commercial licence needed pre-production

---

## 2. API-Football (apisports.io)

**Type:** REST API  
**Free tier:** Yes — 100 req/day (very limited)  
**WC2026 coverage:** YES — competition ID TBD (PSL = 288, ACCOUNT_SUSPENDED on beta key)  
**Authentication:** `X-RapidAPI-Key` header

### Available
- Fixtures (all WC rounds)
- Full squad data (23+ players per team)
- Player statistics
- Live match data (with paid plan)
- Head-to-head history

### Limitations
- Free tier: 100 req/day — not viable for sustained ingestion
- Paid plans required for production use
- Beta PSL key was ACCOUNT_SUSPENDED (Sprint 13)
- New key required — owner gate

### ToS / Licensing
- No commercial use on free tier
- Paid plans allow commercial use
- **Recommendation:** Best coverage but requires paid plan. Owner must procure WC key separately from PSL key.

---

## 3. FIFA Official

**Type:** No public API  
**Free tier:** N/A  
**WC2026 coverage:** Official source, no developer API  

### Available
- Public squad pages (web only)
- Official match schedule page
- Player profiles (web)

### Limitations
- No REST API
- No official SDK
- Data available only via web scraping (ToS risk)
- Robots.txt restricts automated access

### Recommendation
- Use for REFERENCE ONLY (verify squad names, shirt numbers)
- Do not scrape aggressively
- Use only for manual cross-reference during calibration
- **Status:** REFERENCE_ONLY

---

## 4. Manual CSV/JSON Fallback

**Type:** Manual data entry  
**Free tier:** Always available  
**WC2026 coverage:** Whatever admin inputs  

### Viable workflow
1. Admin downloads public squad lists (national team sites, Wikipedia)
2. Formats as CSV (playerName, position, teamSlug, shirtNumber)
3. Uploads via SquadImportModule (`/admin/squad-import/batch`)
4. Reviews in `/admin/players` and corrects manually

### Limitations
- Labour-intensive for 48 teams × 23+ players
- Data accuracy depends on admin diligence
- Needs periodic refresh before WC kick-off

### Recommendation
- **Primary fallback for squad data during beta**
- All records marked `provenance: MANUAL_CSV`
- FantasyCalibrationModule can apply flat pricing per position

---

## 5. ESPN / Public Football Sites

**Type:** No official API  
**Free tier:** N/A  
**Research status:** RESEARCH_ONLY  

ESPN, BBC Sport, Transfermarkt, SofaScore — all provide excellent public data but:
- No official API for third-party use
- Scraping violates ToS
- Licensed data partnerships require commercial agreements

### Recommendation
- RESEARCH_ONLY: Use to cross-verify squad data for manual entry
- Never automate against these endpoints
- **Status:** OUT_OF_SCOPE for ingestion

---

## Summary Matrix

| Source | Fixtures | Squads | Live | Free | Notes |
|--------|----------|--------|------|------|-------|
| football-data.org | ✅ CONFIRMED | ⚠️ Limited | ⚠️ Limited | ✅ 10 req/min | RECOMMENDED for fixtures |
| API-Football | ✅ YES | ✅ Full | ✅ Paid | ⚠️ 100/day | Needs paid key |
| FIFA Official | N/A | ✅ Web | ✅ Web | ✅ | Reference only |
| Manual CSV | N/A | ✅ Manual | ❌ | ✅ | Best for squads beta |
| ESPN/Public | ❌ | ❌ | ❌ | ❌ | No API |

---

## Recommendation

**For WC2026 beta:**
- **Fixtures:** football-data.org (already validated, 104 matches)
- **Squads:** Manual CSV upload via SquadImportModule + cross-reference with public national team pages
- **Live match data:** DEFERRED — requires paid provider key (owner gate)
- **Fantasy player pool:** Manual calibration via FantasyPriceCalibrationModule

**Owner actions required:**
1. Decide on paid API-Football plan for production
2. Confirm football-data.org attribution requirement for production UI
3. Authorise squad manual import workflow for WC beta

---

*PSL INACTIVE | WALLET SANDBOX | NO REAL-MONEY | BETA ONLY*
