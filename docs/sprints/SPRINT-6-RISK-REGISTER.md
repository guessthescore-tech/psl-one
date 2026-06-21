# Sprint 6 Risk Register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|-----------|--------|------------|--------|
| Sportmonks trial API key not yet acquired | HIGH | LOW | NoOpAdapter returns safe empty state; admin routes show "disabled" health | MITIGATED |
| Challenge tokens guessable | LOW | HIGH | crypto.randomBytes(24) = 32-char base64url = 192 bits entropy | MITIGATED |
| Fan accepts their own challenge | MEDIUM | MEDIUM | ForbiddenException thrown with explicit message | MITIGATED |
| Duplicate acceptance by two concurrent users | LOW | MEDIUM | DB unique constraint on token; second acceptance throws BadRequestException | MITIGATED |
| Analytics events leak sensitive data | MEDIUM | HIGH | sanitizeProperties removes password/token/wallet/apiKey/secret/authorization | MITIGATED |
| Onboarding status stale (cached) | LOW | LOW | No caching — always fresh query from Prisma | ACCEPTED |
| Frontend challenge page shows "backend unavailable" | MEDIUM | LOW | Falls back to legacy URL-param link — UX preserved | MITIGATED |
| PSL season accidentally activated | LOW | CRITICAL | No activation code in this sprint; approval gate in SeasonSwitchingModule | CONFIRMED SAFE |
