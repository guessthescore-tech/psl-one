/**
 * PortalScopeService — Sprint 28
 *
 * DB-backed user-to-club and user-to-sponsor scope resolution.
 * Uses ClubMembership and SponsorMembership tables (migration 44).
 *
 * PSL_INACTIVE - do not activate PSL season
 * WALLET_SANDBOX_ONLY - no production wallet, no real-money
 * SPONSOR_REWARDS_NON_FINANCIAL - no cash payouts
 *
 * Security invariants:
 * - CLUB_ADMIN scope derives from active ClubMembership (DB) — not from query param alone
 * - SPONSOR scope derives from active SponsorMembership (DB) — not from query param alone
 * - Cross-tenant access (wrong club/sponsor) always returns CROSS_*_ACCESS_DENIED (403)
 * - PSL_ADMIN requires explicit teamId/sponsorId param (no implicit all-access)
 * - FAN role always returns ROLE_NOT_PERMITTED (403)
 * - Unauthenticated callers return UNAUTHENTICATED (401)
 */

import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export type PortalScopeResult =
  | { allowed: true; scopeType: 'club'; teamId: string; reason: string }
  | { allowed: true; scopeType: 'sponsor'; sponsorId: string; reason: string }
  | { allowed: true; scopeType: 'league'; reason: string }
  | { allowed: false; reason: string; statusCode: 400 | 401 | 403 | 404; errorCode: string };

@Injectable()
export class PortalScopeService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Resolve club portal scope for a user.
   * CLUB_ADMIN: reads active ClubMembership from DB
   * PSL_ADMIN: requires explicit requestedTeamId param; validates team exists
   * All other roles: ROLE_NOT_PERMITTED (403)
   */
  async resolveClubScope(
    userId: string,
    role: string,
    requestedTeamId?: string,
  ): Promise<PortalScopeResult> {
    if (!userId) {
      return {
        allowed: false,
        reason: 'No user',
        statusCode: 401,
        errorCode: 'UNAUTHENTICATED',
      };
    }

    if (role === 'PSL_ADMIN') {
      if (!requestedTeamId) {
        return {
          allowed: false,
          reason: 'PSL_ADMIN must provide teamId query param',
          statusCode: 400,
          errorCode: 'CLUB_SCOPE_REQUIRED',
        };
      }
      const team = await this.prisma.team.findUnique({ where: { id: requestedTeamId } });
      if (!team) {
        return {
          allowed: false,
          reason: 'Team not found',
          statusCode: 404,
          errorCode: 'TEAM_NOT_FOUND',
        };
      }
      return {
        allowed: true,
        scopeType: 'club',
        teamId: requestedTeamId,
        reason: 'PSL_ADMIN explicit scope',
      };
    }

    if (role === 'CLUB_ADMIN') {
      const membership = await this.prisma.clubMembership.findFirst({
        where: { userId, isActive: true },
        include: { team: true },
      });

      if (!membership) {
        return {
          allowed: false,
          reason: 'No active club membership found for this user',
          statusCode: 403,
          errorCode: 'API_SCOPE_REQUIRED',
        };
      }

      if (requestedTeamId && requestedTeamId !== membership.teamId) {
        return {
          allowed: false,
          reason: 'Cross-club access denied — requested teamId does not match membership',
          statusCode: 403,
          errorCode: 'CROSS_CLUB_ACCESS_DENIED',
        };
      }

      return {
        allowed: true,
        scopeType: 'club',
        teamId: membership.teamId,
        reason: 'CLUB_ADMIN active membership',
      };
    }

    return {
      allowed: false,
      reason: `Role '${role}' is not permitted for club portal`,
      statusCode: 403,
      errorCode: 'ROLE_NOT_PERMITTED',
    };
  }

  /**
   * Resolve sponsor portal scope for a user.
   * SPONSOR: reads active SponsorMembership from DB
   * PSL_ADMIN: requires explicit requestedSponsorId param; validates sponsor exists
   * All other roles: ROLE_NOT_PERMITTED (403)
   */
  async resolveSponsorScope(
    userId: string,
    role: string,
    requestedSponsorId?: string,
  ): Promise<PortalScopeResult> {
    if (!userId) {
      return {
        allowed: false,
        reason: 'No user',
        statusCode: 401,
        errorCode: 'UNAUTHENTICATED',
      };
    }

    if (role === 'PSL_ADMIN') {
      if (!requestedSponsorId) {
        return {
          allowed: false,
          reason: 'PSL_ADMIN must provide sponsorId query param',
          statusCode: 400,
          errorCode: 'SPONSOR_SCOPE_REQUIRED',
        };
      }
      const sponsor = await this.prisma.sponsor.findUnique({ where: { id: requestedSponsorId } });
      if (!sponsor) {
        return {
          allowed: false,
          reason: 'Sponsor not found',
          statusCode: 404,
          errorCode: 'SPONSOR_NOT_FOUND',
        };
      }
      return {
        allowed: true,
        scopeType: 'sponsor',
        sponsorId: requestedSponsorId,
        reason: 'PSL_ADMIN explicit scope',
      };
    }

    if (role === 'SPONSOR') {
      const membership = await this.prisma.sponsorMembership.findFirst({
        where: { userId, isActive: true },
        include: { sponsor: true },
      });

      if (!membership) {
        return {
          allowed: false,
          reason: 'No active sponsor membership found for this user',
          statusCode: 403,
          errorCode: 'API_SCOPE_REQUIRED',
        };
      }

      if (requestedSponsorId && requestedSponsorId !== membership.sponsorId) {
        return {
          allowed: false,
          reason: 'Cross-sponsor access denied — requested sponsorId does not match membership',
          statusCode: 403,
          errorCode: 'CROSS_SPONSOR_ACCESS_DENIED',
        };
      }

      return {
        allowed: true,
        scopeType: 'sponsor',
        sponsorId: membership.sponsorId,
        reason: 'SPONSOR active membership',
      };
    }

    return {
      allowed: false,
      reason: `Role '${role}' is not permitted for sponsor portal`,
      statusCode: 403,
      errorCode: 'ROLE_NOT_PERMITTED',
    };
  }
}
