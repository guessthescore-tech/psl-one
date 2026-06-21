# Sprint 5 — Risk Register

| Risk | Likelihood | Impact | Mitigation | Status |
|------|-----------|--------|-----------|--------|
| Password change bypasses verification | LOW | CRITICAL | bcrypt.compare required; unit tests cover wrong-password case | MITIGATED |
| Deletion request triggers hard-delete | LOW | CRITICAL | Status workflow only; user.delete never called; test asserts this | MITIGATED |
| Audit event leaks plaintext password | LOW | HIGH | Audit payload contains only userId + event type + success flag | MITIGATED |
| Concurrent duplicate deletion requests | LOW | MEDIUM | findFirst(PENDING) before create; idempotent if already pending | MITIGATED |
| New JWT not issued after password change | INFO | LOW | Existing sessions continue (stateless JWT); reset via logout | ACCEPTED |
| POPIA admin fulfilment not automated | INFO | LOW | Deferred to admin workflow; status PENDING until admin acts | DOCUMENTED |
| Migration fails in prod environment | LOW | MEDIUM | Additive only; no destructive changes; tested locally | MITIGATED |
