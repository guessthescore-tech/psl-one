# Sprint 38A — ScoreBat Widget Integration

## Status: ADAPTER_BUILT — TOKEN_OPTIONAL

## Overview

ScoreBat provides an iframe-based video highlights widget for football competitions.
It is NOT a structured data API — the `ScoreBatWidgetAdapter` implements
`ProviderAdapter` for registration purposes only; all data methods return empty arrays.

## Architecture

```
ScoreBat is additive (highlights only):
  - NOT a source for fixture data
  - NOT a source for team/player data
  - NOT a primary provider in any routing chain
  - Widget embed only — iframe rendered on /world-cup/live page
```

## Token Security

`SCOREBAT_WIDGET_TOKEN` is a widget attribution token (not a private API key).
ScoreBat intends for this token to appear in iframe embed URLs. However, PSL One
treats it as a server-side env var to:
1. Prevent NEXT_PUBLIC_ exposure of any provider credential
2. Allow server-side generation of the embed URL
3. Enable the admin config endpoint to return embed metadata

**The token appears in the iframe `src` URL in rendered HTML — this is by ScoreBat design.**

## Allowed CSP Hosts

Add to Content-Security-Policy frame-src:
```
scorebat.com www.scorebat.com
```

Use `ScoreBatWidgetAdapter.getAllowedHosts()` to retrieve programmatically.

## Frontend Integration

```tsx
// Server component reads token from env, constructs embed URL
const widgetConfig = await fetchWidgetConfig(adminToken);
// Client component renders iframe
<ScoreBatWorldCupWidget embedUrl={widgetConfig.embedUrl} />
```

## Safety

- No betting/odds content from ScoreBat (highlights only)
- Token never returned as raw value from health/config endpoints
- SCOREBAT_WIDGET_TOKEN never exposed via NEXT_PUBLIC_
- Widget is additive — platform works without it if token not set
