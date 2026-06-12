import { describe, it, expect, beforeEach } from 'vitest';
import { BetaFeedbackService } from './beta-feedback.service';

describe('BetaFeedbackService', () => {
  let service: BetaFeedbackService;

  beforeEach(() => {
    service = new BetaFeedbackService();
  });

  describe('getOverview', () => {
    it('returns BETA_READY status', () => {
      const result = service.getOverview();
      expect(result.betaStatus).toBe('BETA_READY');
    });

    it('returns positive known issue count', () => {
      const result = service.getOverview();
      expect(result.totalKnownIssues).toBeGreaterThan(0);
    });

    it('includes recommended next actions', () => {
      const result = service.getOverview();
      expect(result.recommendedNextActions.length).toBeGreaterThan(0);
    });

    it('reports COMPLIANT safety status', () => {
      const result = service.getOverview();
      expect(result.safetyStatus).toBe('COMPLIANT');
    });

    it('includes generatedAt timestamp', () => {
      const result = service.getOverview();
      expect(new Date(result.generatedAt).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('ux pass count is positive', () => {
      const result = service.getOverview();
      expect(result.uxChecklistPasses).toBeGreaterThan(0);
    });

    it('completedStories matches story count', () => {
      const result = service.getOverview();
      expect(result.completedStories).toBe(10);
    });
  });

  describe('getKnownIssues', () => {
    it('returns issues array', () => {
      const result = service.getKnownIssues();
      expect(Array.isArray(result.issues)).toBe(true);
      expect(result.issues.length).toBeGreaterThan(0);
    });

    it('total matches array length', () => {
      const result = service.getKnownIssues();
      expect(result.total).toBe(result.issues.length);
    });

    it('includes HIGH severity auth issue', () => {
      const result = service.getKnownIssues();
      const authIssue = result.issues.find((i) => i.id === 'KI-001');
      expect(authIssue).toBeDefined();
      expect(authIssue!.severity).toBe('HIGH');
    });

    it('includes PSL fixture data issue', () => {
      const result = service.getKnownIssues();
      const fixtureIssue = result.issues.find((i) => i.id === 'KI-002');
      expect(fixtureIssue).toBeDefined();
      expect(fixtureIssue!.category).toBe('Data Readiness');
    });

    it('live provider ingestion is DEFERRED', () => {
      const result = service.getKnownIssues();
      const providerIssue = result.issues.find((i) => i.id === 'KI-003');
      expect(providerIssue!.status).toBe('DEFERRED');
    });

    it('commerce issues are DEFERRED not OPEN', () => {
      const result = service.getKnownIssues();
      const commerceIssue = result.issues.find((i) => i.id === 'KI-004');
      expect(commerceIssue!.status).toBe('DEFERRED');
    });

    it('all issues have required fields', () => {
      const result = service.getKnownIssues();
      for (const issue of result.issues) {
        expect(issue.id).toBeTruthy();
        expect(issue.title).toBeTruthy();
        expect(issue.severity).toMatch(/^(HIGH|MEDIUM|LOW|INFO)$/);
        expect(issue.status).toMatch(/^(OPEN|TRACKED|DEFERRED|RESOLVED)$/);
      }
    });
  });

  describe('getUxChecklist', () => {
    it('returns checks array', () => {
      const result = service.getUxChecklist();
      expect(Array.isArray(result.checks)).toBe(true);
      expect(result.checks.length).toBeGreaterThan(0);
    });

    it('summary counts match checks array', () => {
      const result = service.getUxChecklist();
      const total = Object.values(result.summary).reduce((a, b) => a + b, 0);
      expect(total).toBe(result.checks.length);
    });

    it('RBAC check is PASS', () => {
      const result = service.getUxChecklist();
      const rbacCheck = result.checks.find((c) => c.area === 'Auth / RBAC' && c.check.includes('PSL_ADMIN JWT'));
      expect(rbacCheck!.status).toBe('PASS');
    });

    it('fantasy points-only check is PASS', () => {
      const result = service.getUxChecklist();
      const fantasyCheck = result.checks.find((c) => c.check.includes('points-only') && c.area === 'Fantasy');
      expect(fantasyCheck!.status).toBe('PASS');
    });

    it('commerce production-disabled check is PASS', () => {
      const result = service.getUxChecklist();
      const commerceCheck = result.checks.find((c) => c.check.includes('PRODUCTION_DISABLED'));
      expect(commerceCheck!.status).toBe('PASS');
    });

    it('player stats draft admin-only check is PASS', () => {
      const result = service.getUxChecklist();
      const draftCheck = result.checks.find((c) => c.check.includes('DRAFT stats are admin-only'));
      expect(draftCheck!.status).toBe('PASS');
    });

    it('fan value non-financial check is PASS', () => {
      const result = service.getUxChecklist();
      const fvCheck = result.checks.find((c) => c.check.includes('non-financial'));
      expect(fvCheck!.status).toBe('PASS');
    });

    it('all checks have required fields', () => {
      const result = service.getUxChecklist();
      for (const check of result.checks) {
        expect(check.area).toBeTruthy();
        expect(check.check).toBeTruthy();
        expect(check.status).toMatch(/^(PASS|WARN|FAIL|PENDING)$/);
      }
    });
  });

  describe('getReleaseNotes', () => {
    it('returns release notes array', () => {
      const result = service.getReleaseNotes();
      expect(Array.isArray(result.notes)).toBe(true);
    });

    it('includes stories STORY-26 through STORY-35', () => {
      const result = service.getReleaseNotes();
      const stories = result.notes.map((n) => n.story);
      expect(stories).toContain('STORY-26');
      expect(stories).toContain('STORY-34');
      expect(stories).toContain('STORY-35');
    });

    it('STORY-35 includes beta polish deliverables', () => {
      const result = service.getReleaseNotes();
      const story35 = result.notes.find((n) => n.story === 'STORY-35');
      expect(story35).toBeDefined();
      expect(story35!.keyDeliverables.some((d) => d.includes('AdminAuditLog'))).toBe(true);
    });

    it('all notes have safety boundaries', () => {
      const result = service.getReleaseNotes();
      for (const note of result.notes) {
        expect(note.safetyBoundaries.length).toBeGreaterThan(0);
      }
    });

    it('STORY-29 safety boundary mentions points-only', () => {
      const result = service.getReleaseNotes();
      const story29 = result.notes.find((n) => n.story === 'STORY-29');
      expect(story29!.safetyBoundaries.some((s) => s.toLowerCase().includes('points-only'))).toBe(true);
    });

    it('currentVersion includes STORY-35', () => {
      const result = service.getReleaseNotes();
      expect(result.currentVersion).toContain('STORY-35');
    });
  });
});
