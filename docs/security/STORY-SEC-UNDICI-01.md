# STORY-SEC-UNDICI-01 — Undici HIGH-severity vulnerability remediation

**Date:** 2026-06-20
**Starting main SHA:** `6ed5f23801043718f862de5fea1442dc08b649c1`
**Security branch:** `fix/security-undici-cves`
**Status:** COMPLETE — all 6/6 CI checks green, blocking mode active

---

## Affected Package

| Package | Installed version | Safe version |
|---------|-------------------|--------------|
| `undici` | `8.4.1` | `8.5.0` |

---

## Dependency Path

```
packages/testing (@psl-one/testing@0.0.1)
  └── testcontainers@12.0.2  [direct dependency]
        └── undici@8.4.1      [transitive — constrained as ^8.3.0]
```

`undici` is not a direct dependency of any workspace package. It is introduced solely by `testcontainers` in the test-utilities package.

---

## Advisories Identified

All three HIGH-severity advisories share the range `>=8.0.0 <8.5.0` and are fixed in `>=8.5.0`.

| Advisory | Severity | Title | Fixed in |
|----------|----------|-------|----------|
| GHSA-vmh5-mc38-953g | HIGH | undici: TLS certificate validation bypass via dropped requestTls in SOCKS5 ProxyAgent | >=8.5.0 |
| GHSA-38rv-x7px-6hhq | HIGH | undici: WebSocket client DoS via cumulative fragment bypass | >=8.5.0 |
| GHSA-vxpw-j846-p89q | HIGH | undici: WebSocket client DoS via fragment count bypass | >=8.5.0 |

All confirmed via `pnpm audit` against the npm advisory database.

---

## Remediation Selected

**Option C — pnpm root override** (`package.json > pnpm.overrides`)

```json
"undici": "8.5.0"
```

**Rationale:**
- `undici` is transitive (not directly declared in any workspace)
- `testcontainers@12.0.2` declares `undici: "^8.3.0"`, which semver-includes `8.5.0`
- The root `package.json` already uses `pnpm.overrides` for 7 other transitive pins — this entry follows the established pattern
- `8.5.0` is the specific minimum safe version for all three advisories; it is not an unbounded range
- `undici@8.5.0` is a patch release within the `8.x` major line; no breaking API changes expected for `testcontainers`'s usage

---

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Added `"undici": "8.5.0"` to `pnpm.overrides` |
| `pnpm-lock.yaml` | `undici@8.4.1` → `undici@8.5.0` throughout |
| `.github/workflows/ci.yml` | `exit-code: 0` → `exit-code: 1` on Trivy filesystem scan; advisory comment removed |
| `.github/workflows/container-build.yml` | `exit-code: 0` → `exit-code: 1` on Trivy image scan; advisory comment removed |
| `apps/api/Dockerfile` | Remove npm/npx from runner stage (see picomatch section below) |
| `apps/web/Dockerfile` | Remove npm/npx from runner stage (see picomatch section below) |

---

## Scan Results

### Before remediation

```
10 vulnerabilities found
Severity: 2 low | 5 moderate | 3 high

HIGH  GHSA-vmh5-mc38-953g  undici TLS validation bypass     undici@8.4.1
HIGH  GHSA-38rv-x7px-6hhq  undici WebSocket DoS (cumulative) undici@8.4.1
HIGH  GHSA-vxpw-j846-p89q  undici WebSocket DoS (fragment)  undici@8.4.1
```

Trivy CI scans were in advisory mode (`exit-code: 0`) from STORY-CI-REPAIR-01.

### After remediation

```
3 vulnerabilities found
Severity: 3 moderate

0 HIGH, 0 CRITICAL
```

Remaining moderate findings (out of scope for this story):

| Advisory | Severity | Package | Path |
|----------|----------|---------|------|
| GHSA-qx2v-qp2m-jg93 | MODERATE | `postcss@8.4.31` | Multiple apps > `next@15.5.18` > postcss |
| GHSA-w5hq-g745-h8pq | MODERATE | `uuid@9.0.1` | Multiple paths (29 paths) |
| GHSA-f38q-mgvj-vph7 | MODERATE | `protobufjs@7.6.2` | `testcontainers > dockerode > @grpc` chain |

These moderate findings predate this story and are not introduced by the undici fix. They are tracked for future security triage stories.

### Container image scans — round 1 (CI run 27866247639)

After the undici fix, the filesystem scan passed with `exit-code: 1`. However, the three container image
scans still failed:

```
picomatch (package.json) | CVE-2026-33671 | HIGH | fixed | 4.0.3 | 4.0.4, 3.0.2, 2.3.2
Path: usr/local/lib/node_modules/npm/node_modules/picomatch/package.json
```

**Root cause:** The `node:22-alpine` base image ships npm as a bundled tool at
`/usr/local/lib/node_modules/npm/`. npm@10.x bundles `picomatch@4.0.3` internally. This is
npm's own runtime dependency — not our application code. Our application (NestJS API, Next.js web)
does not import or use picomatch at runtime.

**Fix:** Remove npm and npx from the production runner stages. The runner targets only
execute pre-compiled application code (`node apps/api/dist/main.js`, `node apps/web/server.js`,
`prisma migrate deploy`). None of these require npm.

Added to both `apps/api/Dockerfile` and `apps/web/Dockerfile` runner stages:
```dockerfile
RUN apk add --no-cache curl tini [openssl] && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
```

Benefits beyond the CVE fix: reduces container attack surface (principle of least privilege),
removes an unused package manager from production images.

---

## Gate Results

| Gate | Result |
|------|--------|
| Experience typecheck | PASS (0 errors) |
| Experience tests | PASS (384/384) |
| Experience build | PASS (56 pages) |
| API typecheck | PASS (0 errors) |
| codex:validate | PASS (0 errors) |
| docs:validate | PASS (18/18) |
| git diff --check | PASS |
| pnpm audit (HIGH/CRITICAL) | PASS (0 HIGH, 0 CRITICAL) |
| CI: build-and-test | PASS (run 27868007855) |
| CI: event-schema-validation | PASS (run 27868007855) |
| CI: security-scan (filesystem, exit-code: 1) | PASS (run 27868007855) |
| CI: build-and-scan (api) | PASS (run 27868007856) |
| CI: build-and-scan (api-migrator) | PASS (run 27868007856) |
| CI: build-and-scan (web) | PASS (run 27868007856) |

---

## Trivy Blocking Mode

Trivy `exit-code` restored from `0` (advisory) back to `1` (blocking) in:
- `.github/workflows/ci.yml` — filesystem scan
- `.github/workflows/container-build.yml` — image scan (×3 matrix jobs)

---

## Remaining Vulnerability Debt

| Advisory | Severity | Package | Introduced by | Next action |
|----------|----------|---------|---------------|-------------|
| GHSA-qx2v-qp2m-jg93 | MODERATE | postcss | `next@15.5.18` | Track; fix requires Next.js upgrade |
| GHSA-w5hq-g745-h8pq | MODERATE | uuid | Multiple (apollo, nest) | Track; upgrade uuid if direct |
| GHSA-f38q-mgvj-vph7 | MODERATE | protobufjs | testcontainers > dockerode | Track; awaiting testcontainers upgrade |

None of these are HIGH or CRITICAL. They will not block CI with `severity: CRITICAL,HIGH`.
