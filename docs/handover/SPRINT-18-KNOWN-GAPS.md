# Sprint 18 — Known Gaps

## Summary

Sprint 18 delivers the fixture publishing and pre-flight tools. The following gaps are known, documented, and deferred by design.

---

## Gap 1: No PSL 2026/27 Fixtures (External)

**Status:** Expected, not a bug

**Detail:** Parse PSL (psl.co.za) has not published the 2026/27 fixture schedule. The `/admin/fixtures/imported` page will show an empty table until:
1. psl.co.za publishes fixtures (~July/August 2026)
2. An admin runs the Parse PSL ingestion workflow (`/admin/data-provider/parse-psl`)
3. An admin reviews and publishes the imported fixtures (`/admin/fixtures/imported`)

**Mitigation:** Informational banner shown on admin page. Discovery tools exit cleanly with empty-source message.

---

## Gap 2: PSL Pre-Flight Returns NO_GO (Expected)

**Status:** Expected, not a bug

**Detail:** The PSL pre-flight check will return `NO_GO` as long as no PSL fixtures exist in the database. This is the correct behaviour — the platform should not proceed to PSL activation without fixture data.

**Mitigation:** Pre-flight output clearly lists the reason (no fixtures) and the steps to resolve it.

---

## Gap 3: No Bulk Fixture Import from Admin UI

**Status:** Deferred to a future sprint

**Detail:** The fixture import (Parse PSL ingestion) and fixture publishing are separate two-step workflows. The admin must:
1. Navigate to `/admin/data-provider/parse-psl` to import fixtures
2. Navigate to `/admin/fixtures/imported` to review and publish them

There is no combined import-and-publish flow.

**Mitigation:** Both pages are linked in the admin smoke runbook.

---

## Gap 4: No Pagination Controls on Fixture List

**Status:** Deferred

**Detail:** The `/admin/fixtures/imported` page fetches a default page (up to 50 fixtures). No pagination UI (next/previous page) is implemented.

**Workaround:** Use the `limit` and `offset` query parameters on the API directly, or filter by `providerSource` and `isPublished` to narrow the result set.

---

## Gap 5: Pre-Flight Has No Season-Create Capability

**Status:** By design

**Detail:** The pre-flight check cannot create a PSL season or populate missing data. If the `psl_season_exists` check fails, the admin must ensure the PSL season exists in the database (created via Admin Command Centre or Season Calibration) before the pre-flight can proceed further.

---

## Gap 6: Activation Approval Must Be Created Separately

**Status:** By design

**Detail:** The `SeasonActivationApproval` record (check #10 in the pre-flight) must be created by an owner via the Beta Launch module (`/admin/beta-launch`) before the pre-flight will show PASS for that check. This is intentional — activation requires explicit owner approval.

---

## Gap 7: No EC2 Deploy Yet

**Status:** Awaiting owner authorisation

**Detail:** Sprint 18 code is committed and CI-green but has not been deployed to the beta EC2 instance. Images must be built and pushed to ECR; deployment requires owner authorisation.

---

## Gap 8: Wallet Pre-Flight Check Depends on WalletProviderDetail

**Status:** Acceptable

**Detail:** The `wallet_sandbox_only` check queries `WalletProviderDetail.count({ where: { status: { not: 'SANDBOX' } } })`. If no `WalletProviderDetail` records exist, this returns 0, which correctly passes the check (no non-sandbox providers active). The behaviour is correct even if no wallet records exist.
