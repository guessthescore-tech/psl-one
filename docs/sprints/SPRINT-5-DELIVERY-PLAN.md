# Sprint 5 — Delivery Plan

**Sprint:** S5 — Account Security, POPIA Deletion & Trust Foundation
**Branch:** `feature/sprint-5-account-security-trust`
**Date:** 2026-06-21
**Status:** IN PROGRESS

## Goal

A fan can securely change their password, request account deletion in a POPIA-safe way,
and receive clear confirmation and auditability. The platform records privacy/security
actions without destructive deletion or unsafe automation.

## Story Matrix

| Story | Title | Status |
|-------|-------|--------|
| S5-01 | Password Change Backend Contract | IN PROGRESS |
| S5-02 | POPIA Account Deletion Request | IN PROGRESS |
| S5-03 | Account Security Audit Trail | IN PROGRESS |
| S5-04 | Frontend Account Completion | IN PROGRESS |
| S5-05 | Account API Contract Documentation | IN PROGRESS |
| S5-06 | Security and Regression Gates | PENDING |

## Non-negotiable Product State

| Item | State |
|------|-------|
| PSL | INACTIVE |
| World Cup 2026 | ACTIVE beta context |
| Wallet | Sandbox-only |
| Fantasy | Points-only |
| STORY-40 | RESERVED |

## Data Models Added

- `AccountDeletionRequest` — deletion request workflow
- `DeletionRequestStatus` enum — PENDING, CANCELLED, COMPLETED, REJECTED
- Extends `AuditEvent` enum with PASSWORD_CHANGED, PASSWORD_CHANGE_FAILED,
  ACCOUNT_DELETION_REQUESTED, ACCOUNT_DELETION_CANCELLED

## Endpoints Added

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/password/change` | JWT | Change authenticated user's password |
| POST | `/account/deletion-request` | JWT | Submit POPIA deletion request |
| GET | `/account/deletion-request/status` | JWT | Check pending request status |
| POST | `/account/deletion-request/cancel` | JWT | Cancel pending deletion request |

## Migration

`20260621000001_account_security_trust`

## Risk Register

| Risk | Mitigation |
|------|-----------|
| Password change bypasses current-password check | bcrypt.compare required before any update |
| Deletion request triggers immediate hard-delete | Model uses status workflow; no user.delete called |
| Audit event exposes plaintext password | Only event type + userId + success stored; no payload |
| Concurrent deletion requests create duplicates | findFirst PENDING before create — idempotent |
