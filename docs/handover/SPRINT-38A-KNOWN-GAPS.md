# Sprint 38A — Known Gaps

## GAP-38A-01: SportRadar Trial Key Not Procured

**Severity**: LOW (football-data.org is functional primary)
**Description**: SPORTSRADAR_SOCCER_API_KEY not set; adapter built and wired in fallback chain
**Resolution**: Owner to register at developer.sportradar.com for trial key
**Workaround**: football-data.org handles WC 2026 on free tier (104 matches)

## GAP-38A-02: ScoreBat Widget Token Not Configured

**Severity**: LOW (widget is additive)
**Description**: SCOREBAT_WIDGET_TOKEN not set; /world-cup/live shows placeholder
**Resolution**: Owner to register at scorebat.com for widget token
**Workaround**: Page renders without widget; fixtures and scores still visible

## GAP-38A-03: WC Teams Not in PSL DB

**Severity**: INFO (dry-run only)
**Description**: Team resolution in dry-run shows ⚠️ for WC teams not seeded in DB
**Resolution**: After owner-approved fixture write import, add WC teams to DB
**Impact**: Fixtures can be created without team FK if team names don't match

## GAP-38A-04: WC Season DB Record Verification

**Severity**: INFO
**Description**: Auto-detect uses `competition.code IN ['WC', 'WORLD_CUP_2026', ...]`
**Verification**: Run seed verification or check admin DB for WC season
**Impact**: If WC season not in DB, write import requires explicit `seasonId` param

## GAP-38A-05: ScoreBat CSP Headers Not Updated

**Severity**: LOW
**Description**: `scorebat.com` and `www.scorebat.com` not yet in CSP frame-src
**Resolution**: Add to `next.config.js` or `vercel.json` CSP headers before going live
**Workaround**: Browser will block iframe until CSP updated

## GAP-38A-06: No Player Discovery Endpoint on Backend

**Severity**: INFO
**Description**: `squad-import` tool calls `/discovery/players/:teamId` but route not wired
**Resolution**: Sprint 38B can add `@Get('discovery/players/:teamId')` to controller
**Workaround**: Tool gracefully handles 404 with informative message

## Not Gaps

- PSL INACTIVE: expected and correct
- SOURCE_EMPTY for PSL fixtures: expected (July/August 2026 schedule release)
- No scheduled ingestion: correct by design
- No write imports without flags: correct by design
