import bcrypt from 'bcrypt';
import { PrismaClient, PlayerPosition, FixtureStatus, GameweekStatus, CompetitionFormat, StageType, SeasonStatus, AchievementCategory, AchievementTriggerType, BadgeRarity, FanValueType, RewardReadinessCategory, SeasonTeamStatus, SeasonTeamSource, ClubProfileStatus, ShopProductCategory, ShopProductAvailability, ShopProductStatus, ClubContentType, ClubContentStatus, PredictionMarketType, DataSourceType, DataStatus, FreshnessStatus, ComplianceReviewStatus, UserRole } from '@prisma/client';
import { VENUES } from './seed-data/world-cup-2026/venues';
import { TEAMS, TBD_TEAM } from './seed-data/world-cup-2026/teams';
import { GROUPS } from './seed-data/world-cup-2026/groups';
import { ALL_FIXTURES } from './seed-data/world-cup-2026/fixtures';
import { PLAYERS } from './seed-data/world-cup-2026/players';
import { PSL_CLUBS } from './seed-data/psl-clubs';
import { PSL_PLACEHOLDER_PLAYERS, PROVISIONAL_PRICE } from './seed-data/psl-players';

const prisma = new PrismaClient();
const SEED_PLATFORM_USERS_PASSWORD = process.env.SEED_PLATFORM_USERS_PASSWORD ?? 'PslOneSeed!2026';
const SEED_PLATFORM_ADMIN_EMAIL = process.env.SEED_PLATFORM_ADMIN_EMAIL ?? 'admin@pslone.co.za';
const SEED_PLATFORM_USER_EMAIL = process.env.SEED_PLATFORM_USER_EMAIL ?? 'obe@digisphere.co.za';
const SEED_PLATFORM_PARTNER_EMAIL = process.env.SEED_PLATFORM_PARTNER_EMAIL ?? 'guessthescore2@gmail.com';

async function main() {
  console.log('Seeding FIFA World Cup 2026 full dataset…');

  // Reset fan preferred-team FK first to allow team deletion
  await prisma.fanProfile.updateMany({ data: { preferredTeamId: null } });

  // Clear club experience data
  await prisma.clubExperienceStatus.deleteMany();
  await prisma.clubShopProduct.deleteMany();
  await prisma.clubContentItem.deleteMany();
  await prisma.clubProfile.deleteMany();
  await prisma.seasonSquadRegistration.deleteMany();
  await prisma.seasonTeam.deleteMany();

  // Clear activity feed data
  await prisma.activityReaction.deleteMany();
  await prisma.activityFeedItem.deleteMany();

  // Clear notification data
  await prisma.notificationDeliveryLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.notificationPreference.deleteMany();

  // Clear rewards readiness data
  await prisma.fanRewardReadiness.deleteMany();
  await prisma.rewardReadinessDefinition.deleteMany();

  // Clear achievement data first (depend on users and definitions)
  await prisma.fanBadge.deleteMany();
  await prisma.fanAchievement.deleteMany();
  await prisma.achievementBadge.deleteMany();
  await prisma.achievementDefinition.deleteMany();
  await prisma.badgeDefinition.deleteMany();

  // Clear prediction/challenge/ledger data before clearing football tables
  await prisma.fanValueLedger.deleteMany();
  await prisma.fantasyPlayerGameweekScore.deleteMany();
  await prisma.fantasyGameweekScore.deleteMany();
  await prisma.fantasyPointsLedger.deleteMany();
  await prisma.fantasyHeadToHeadFixture.deleteMany();
  await prisma.fantasyCupTie.deleteMany();
  await prisma.fantasyCupRound.deleteMany();
  await prisma.fantasyCup.deleteMany();
  await prisma.fantasyLeagueMember.deleteMany();
  await prisma.fantasyLeague.deleteMany();
  await prisma.fantasyRulesConfig.deleteMany();
  await prisma.fantasyAutoSubstitution.deleteMany();
  await prisma.fantasyGameweekLineupSnapshot.deleteMany();
  await prisma.fantasyFreeHitSnapshot.deleteMany();
  await prisma.fantasyChip.deleteMany();
  await prisma.gameweek.deleteMany();
  await prisma.fantasyTransfer.deleteMany();
  await prisma.fantasyTeamPlayer.deleteMany();
  await prisma.fantasyTeam.deleteMany();
  await prisma.predictionPointsLedger.deleteMany();
  await prisma.peerChallenge.deleteMany();
  await prisma.scorePrediction.deleteMany();

  // Clear STORY-38 social prediction data (in FK dependency order, before gameweeks/fixtures)
  await prisma.socialPredictionPointsEntry.deleteMany();
  await prisma.challengeScore.deleteMany();
  await prisma.challengeMatch.deleteMany();
  await prisma.challengeListing.deleteMany();
  await prisma.gameweekPointsAllocation.deleteMany();
  await prisma.fixturePredictionMarket.deleteMany();
  await prisma.predictionMarketConfig.deleteMany();
  await prisma.complianceDomainConfig.deleteMany();

  // Clear STORY-37 data (media, campaigns, rewards, wallet) — must come before sponsors/teams
  await prisma.campaignAnalyticsSnapshot.deleteMany();
  await prisma.fanCampaignActionCompletion.deleteMany();
  await prisma.fanCampaignParticipation.deleteMany();
  await prisma.fanReward.deleteMany();
  await prisma.rewardDefinition.deleteMany();
  await prisma.campaignAction.deleteMany();
  await prisma.mediaEngagementEvent.deleteMany();
  await prisma.mediaAsset.deleteMany();
  await prisma.walletTransaction.deleteMany();
  await prisma.walletLink.deleteMany();
  await prisma.walletProviderDetail.deleteMany();
  await prisma.campaignTriggerEvent.deleteMany();
  await prisma.sponsorCampaign.deleteMany();
  await prisma.sponsor.deleteMany();

  // Clear squad import data (depend on season)
  await prisma.squadImportRow.deleteMany();
  await prisma.squadImportBatch.deleteMany();

  // Clear price calibration batch data (depend on season)
  await prisma.fantasyPriceCalibrationBatch.deleteMany();

  // Clear fixture import data (depend on season and fixture)
  await prisma.fixtureImportRow.deleteMany();
  await prisma.fixtureImportBatch.deleteMany();

  // Clear season switch audit data
  await prisma.seasonSwitchAudit.deleteMany();

  // Clear STORY-39 beta launch data (before seasons and users)
  await prisma.seasonActivationApproval.deleteMany();
  await prisma.betaCohortMember.deleteMany();
  await prisma.betaCohort.deleteMany();

  // Clear prediction calibration config (depends on season)
  await prisma.predictionRulesConfig.deleteMany();

  // Clear fantasy player prices/history before deleting players
  await prisma.fantasyPlayerPriceHistory.deleteMany();
  await prisma.fantasyPlayerPrice.deleteMany();

  // Clear football data in dependency order
  await prisma.adminAuditLog.deleteMany();
  await prisma.playerMatchStats.deleteMany();
  await prisma.fantasyPlayerMatchStat.deleteMany();
  await prisma.fixtureLineup.deleteMany();
  await prisma.matchEvent.deleteMany();
  await prisma.playerRating.deleteMany();
  await prisma.dataIngestionLog.deleteMany();
  await prisma.leagueStanding.deleteMany();
  await prisma.teamFormRecord.deleteMany();
  await prisma.groupStanding.deleteMany();
  await prisma.fixture.deleteMany();
  await prisma.player.deleteMany();
  await prisma.group.deleteMany();
  await prisma.team.deleteMany();
  await prisma.venue.deleteMany();
  await prisma.season.deleteMany();
  await prisma.competition.deleteMany();

  console.log('  ✓ Cleared existing data');

  // ── Competition ──────────────────────────────────────────────────────────
  const competition = await prisma.competition.create({
    data: {
      name: 'FIFA World Cup',
      slug: 'fifa-world-cup',
      format: CompetitionFormat.HYBRID,
      teamCount: 48,
      hasGroups: true,
      hasKnockouts: true,
      hasHomeAway: true,
      usesNeutralVenues: true,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
    },
  });

  // ── Season ────────────────────────────────────────────────────────────────
  const season = await prisma.season.create({
    data: {
      competitionId: competition.id,
      name: 'FIFA World Cup 2026',
      slug: 'fifa-world-cup-2026',
      startDate: new Date('2026-06-11'),
      endDate: new Date('2026-07-19'),
      isActive: true,
      status: SeasonStatus.ACTIVE,
    },
  });

  console.log(`  ✓ Competition: ${competition.name}, Season: ${season.name}`);

  // ── Venues ───────────────────────────────────────────────────────────────
  const venueMap = new Map<string, string>(); // externalId → id
  for (const v of VENUES) {
    const venue = await prisma.venue.create({
      data: {
        name: v.name,
        city: v.city,
        country: v.country,
        capacity: v.capacity,
        externalId: v.externalId,
        source: v.source,
      },
    });
    venueMap.set(v.externalId, venue.id);
  }
  console.log(`  ✓ Venues: ${VENUES.length}`);

  // ── Teams (48 + TBD) ─────────────────────────────────────────────────────
  const teamMap = new Map<string, string>(); // externalId → id
  for (const t of [...TEAMS, TBD_TEAM]) {
    const team = await prisma.team.create({
      data: {
        name: t.name,
        slug: t.slug,
        shortName: t.shortName,
        country: t.country,
        externalId: t.externalId,
        source: t.source,
      },
    });
    teamMap.set(t.externalId, team.id);
  }
  console.log(`  ✓ Teams: ${TEAMS.length} + 1 TBD`);

  // ── Players ───────────────────────────────────────────────────────────────
  const playersBatch: {
    teamId: string;
    name: string;
    position: PlayerPosition;
    nationality: string;
    number?: number;
    source: string;
  }[] = [];

  for (const p of PLAYERS) {
    const teamId = teamMap.get(p.teamExternalId);
    if (!teamId) continue;
    playersBatch.push({
      teamId,
      name: p.name,
      position: p.position as PlayerPosition,
      nationality: p.nationality,
      source: p.source,
      ...(p.number !== undefined ? { number: p.number } : {}),
    });
  }

  await prisma.player.createMany({ data: playersBatch });
  console.log(`  ✓ Players: ${playersBatch.length}`);

  // ── World Cup SeasonTeam registrations ───────────────────────────────────
  // Keep the World Cup player pool and club experience season-scoped even when
  // the beta seed is run on a fresh database.
  let wcSeasonTeamCount = 0;
  for (const team of TEAMS) {
    const teamId = teamMap.get(team.externalId);
    if (!teamId) continue;
    await prisma.seasonTeam.upsert({
      where: { seasonId_teamId: { seasonId: season.id, teamId } },
      create: {
        seasonId: season.id,
        teamId,
        status: SeasonTeamStatus.ACTIVE,
        source: SeasonTeamSource.IMPORT,
      },
      update: {
        status: SeasonTeamStatus.ACTIVE,
        source: SeasonTeamSource.IMPORT,
      },
    });
    wcSeasonTeamCount++;
  }
  console.log(`  ✓ World Cup season teams: ${wcSeasonTeamCount} (ACTIVE, IMPORT)`);

  // ── Groups ────────────────────────────────────────────────────────────────
  const groupMap = new Map<string, string>(); // name → id
  for (const g of GROUPS) {
    const group = await prisma.group.create({
      data: { seasonId: season.id, name: g.name },
    });
    groupMap.set(g.name, group.id);
  }
  console.log(`  ✓ Groups: ${GROUPS.length}`);

  // ── Fixtures ──────────────────────────────────────────────────────────────
  let fixtureCount = 0;
  for (const f of ALL_FIXTURES) {
    const homeTeamId = teamMap.get(f.homeTeam);
    const awayTeamId = teamMap.get(f.awayTeam);
    const venueId = f.venueId ? venueMap.get(f.venueId) : undefined;
    const groupId = f.group ? groupMap.get(f.group) : undefined;

    if (!homeTeamId || !awayTeamId) {
      console.warn(`  ⚠ Skipping fixture — team not found: ${f.homeTeam} vs ${f.awayTeam}`);
      continue;
    }

    await prisma.fixture.create({
      data: {
        seasonId: season.id,
        homeTeamId,
        awayTeamId,
        status: FixtureStatus.SCHEDULED,
        kickoffAt: new Date(f.kickoffAt),
        round: f.round,
        externalId: f.matchNumber ? `wc2026-${f.matchNumber}` : undefined,
        source: 'fifa-wc2026',
        ...(venueId ? { venueId } : {}),
        ...(groupId ? { groupId } : {}),
      },
    });
    fixtureCount++;
  }
  console.log(`  ✓ Fixtures: ${fixtureCount}`);

  // ── Competition Stages ────────────────────────────────────────────────────
  const STAGE_DEFS = [
    { slug: 'group-stage',          name: 'Group Stage',           type: StageType.GROUP,    order: 1, rounds: ['GROUP'] },
    { slug: 'round-of-32',          name: 'Round of 32',           type: StageType.KNOCKOUT, order: 2, rounds: ['ROUND_OF_32'] },
    { slug: 'round-of-16',          name: 'Round of 16',           type: StageType.KNOCKOUT, order: 3, rounds: ['ROUND_OF_16'] },
    { slug: 'quarter-finals',       name: 'Quarter-finals',        type: StageType.KNOCKOUT, order: 4, rounds: ['QUARTER_FINAL'] },
    { slug: 'semi-finals',          name: 'Semi-finals',           type: StageType.KNOCKOUT, order: 5, rounds: ['SEMI_FINAL'] },
    { slug: 'third-place-play-off', name: 'Third-place Play-off',  type: StageType.PLAYOFF,  order: 6, rounds: ['THIRD_PLACE'] },
    { slug: 'final',                name: 'Final',                 type: StageType.FINAL,    order: 7, rounds: ['FINAL'] },
  ];

  const stageMap = new Map<string, string>(); // round → stage id
  for (const def of STAGE_DEFS) {
    const stage = await prisma.competitionStage.create({
      data: { competitionId: competition.id, name: def.name, slug: def.slug, type: def.type, order: def.order },
    });
    for (const round of def.rounds) stageMap.set(round, stage.id);
  }
  console.log(`  ✓ Stages: ${STAGE_DEFS.length}`);

  // Assign stageId and set isNeutralVenue=true for all WC fixtures
  for (const f of ALL_FIXTURES) {
    const stageId = stageMap.get(f.round);
    await prisma.fixture.updateMany({
      where: { externalId: `wc2026-${f.matchNumber}` },
      data: {
        isNeutralVenue: true,
        ...(stageId ? { stageId } : {}),
      },
    });
  }
  console.log(`  ✓ Fixtures updated: isNeutralVenue=true, stage assigned`);

  // ── Gameweeks ─────────────────────────────────────────────────────────────
  // Build date bounds per (round, matchday) group from fixture data
  type GwKey = string;
  const gwBounds = new Map<GwKey, { min: Date; max: Date }>();

  function gwKey(round: string, matchday?: number): GwKey {
    return round === 'GROUP' ? `GROUP:${matchday ?? 0}` : round;
  }

  for (const f of ALL_FIXTURES) {
    const key = gwKey(f.round, f.matchday);
    const kickoff = new Date(f.kickoffAt);
    const existing = gwBounds.get(key);
    if (!existing) {
      gwBounds.set(key, { min: kickoff, max: kickoff });
    } else {
      if (kickoff < existing.min) existing.min = kickoff;
      if (kickoff > existing.max) existing.max = kickoff;
    }
  }

  function hoursAgo(date: Date, hours: number): Date {
    return new Date(date.getTime() - hours * 60 * 60 * 1000);
  }

  const GAMEWEEK_DEFS = [
    { key: 'GROUP:1',      slug: 'group-matchday-1',  name: 'Group Stage – Matchday 1',  round: 1 },
    { key: 'GROUP:2',      slug: 'group-matchday-2',  name: 'Group Stage – Matchday 2',  round: 2 },
    { key: 'GROUP:3',      slug: 'group-matchday-3',  name: 'Group Stage – Matchday 3',  round: 3 },
    { key: 'ROUND_OF_32',  slug: 'round-of-32',       name: 'Round of 32',               round: 4 },
    { key: 'ROUND_OF_16',  slug: 'round-of-16',       name: 'Round of 16',               round: 5 },
    { key: 'QUARTER_FINAL',slug: 'quarter-finals',    name: 'Quarter-finals',            round: 6 },
    { key: 'SEMI_FINAL',   slug: 'semi-finals',       name: 'Semi-finals',               round: 7 },
    { key: 'THIRD_PLACE',  slug: 'third-place',       name: 'Third-place Play-off',      round: 8 },
    { key: 'FINAL',        slug: 'final',             name: 'Final',                     round: 9 },
  ];

  const gameweekMap = new Map<GwKey, string>(); // key → gameweek id
  for (const def of GAMEWEEK_DEFS) {
    const bounds = gwBounds.get(def.key);
    if (!bounds) continue;
    const gw = await prisma.gameweek.create({
      data: {
        seasonId: season.id,
        name: def.name,
        slug: def.slug,
        round: def.round,
        startsAt: bounds.min,
        endsAt: new Date(bounds.max.getTime() + 2 * 60 * 60 * 1000), // +2h after last kickoff
        transferDeadlineAt: hoursAgo(bounds.min, 1),
        predictionDeadlineAt: hoursAgo(bounds.min, 0.5),
        status: GameweekStatus.UPCOMING,
      },
    });
    gameweekMap.set(def.key, gw.id);
  }
  console.log(`  ✓ Gameweeks: ${gameweekMap.size}`);

  // Assign gameweek IDs to fixtures
  const seedAssignedAt = new Date();
  for (const f of ALL_FIXTURES) {
    const key = gwKey(f.round, f.matchday);
    const gameweekId = gameweekMap.get(key);
    if (!gameweekId) continue;
    await prisma.fixture.updateMany({
      where: { externalId: `wc2026-${f.matchNumber}` },
      data: { gameweekId, assignmentStatus: 'AUTO_ASSIGNED', assignmentSource: 'seed', assignedAt: seedAssignedAt },
    });
  }
  console.log(`  ✓ Fixtures assigned to gameweeks`);

  // ── Initial Group Standings (zeros) ───────────────────────────────────────
  let standingCount = 0;
  for (const g of GROUPS) {
    const groupId = groupMap.get(g.name);
    if (!groupId) continue;
    for (const externalId of g.teams) {
      const teamId = teamMap.get(externalId);
      if (!teamId) continue;
      await prisma.groupStanding.create({
        data: {
          groupId,
          teamId,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        },
      });
      standingCount++;
    }
  }
  console.log(`  ✓ Group standings initialised: ${standingCount}`);

  // ── PSL Premiership competition shell ──────────────────────────────────────
  const psl = await prisma.competition.upsert({
    where: { slug: 'psl-premiership' },
    update: {},
    create: {
      name: 'PSL Premiership',
      slug: 'psl-premiership',
      format: CompetitionFormat.LEAGUE,
      teamCount: 16,
      hasGroups: false,
      hasKnockouts: false,
      hasHomeAway: true,
      usesNeutralVenues: false,
      pointsForWin: 3,
      pointsForDraw: 1,
      pointsForLoss: 0,
      source: 'SOFASCORE_REFERENCE',
      sourceUrl: 'https://www.sofascore.com/tournament/football/south-africa/premiership/12631',
    },
  });

  await prisma.season.upsert({
    where: { slug: 'psl-premiership-upcoming' },
    update: {},
    create: {
      competitionId: psl.id,
      name: 'PSL Premiership – Upcoming Season',
      slug: 'psl-premiership-upcoming',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2027-05-31'),
      isActive: false,
      status: SeasonStatus.UPCOMING,
      source: 'SOFASCORE_REFERENCE',
      sourceUrl: 'https://www.sofascore.com/tournament/football/south-africa/premiership/12631',
    },
  });

  console.log(`  ✓ PSL Premiership competition shell seeded (inactive)`);

  // ── Achievement & Badge Definitions ────────────────────────────────────────
  type AchDef = {
    slug: string; name: string; description: string;
    category: AchievementCategory; triggerType: AchievementTriggerType;
    threshold?: number; fanValuePoints: number; valueType?: FanValueType;
    sortOrder: number;
  };
  type BadgeDef = {
    slug: string; name: string; description: string;
    icon: string; rarity: BadgeRarity; category: AchievementCategory; sortOrder: number;
  };
  type Pair = { achievement: string; badge: string };

  const achDefs: AchDef[] = [
    // Fantasy
    { slug: 'first-fantasy-team', name: 'First Fantasy Team', description: 'Create your first fantasy team.', category: 'FANTASY', triggerType: 'FIRST_FANTASY_TEAM', fanValuePoints: 10, sortOrder: 10 },
    { slug: 'fantasy-gameweek-25', name: 'Gameweek Grinder', description: 'Score 25+ points in a single gameweek.', category: 'FANTASY', triggerType: 'FANTASY_GAMEWEEK_POINTS', threshold: 25, fanValuePoints: 15, sortOrder: 20 },
    { slug: 'fantasy-gameweek-50', name: 'Gameweek Hero', description: 'Score 50+ points in a single gameweek.', category: 'FANTASY', triggerType: 'FANTASY_GAMEWEEK_POINTS', threshold: 50, fanValuePoints: 25, sortOrder: 21 },
    { slug: 'fantasy-gameweek-75', name: 'Gameweek Legend', description: 'Score 75+ points in a single gameweek.', category: 'FANTASY', triggerType: 'FANTASY_GAMEWEEK_POINTS', threshold: 75, fanValuePoints: 50, sortOrder: 22 },
    { slug: 'fantasy-season-100', name: 'Season Century', description: 'Score 100+ total points in a season.', category: 'FANTASY', triggerType: 'FANTASY_SEASON_POINTS', threshold: 100, fanValuePoints: 30, sortOrder: 30 },
    { slug: 'joined-first-fantasy-league', name: 'League Joiner', description: 'Join your first fantasy league.', category: 'LEAGUES', triggerType: 'FIRST_LEAGUE_JOIN', fanValuePoints: 10, sortOrder: 40 },
    { slug: 'created-first-fantasy-league', name: 'League Boss', description: 'Create your first fantasy league.', category: 'LEAGUES', triggerType: 'FIRST_LEAGUE_CREATED', fanValuePoints: 15, sortOrder: 41 },
    // Predictions
    { slug: 'first-prediction', name: 'First Prediction', description: 'Make your first match prediction.', category: 'PREDICTIONS', triggerType: 'FIRST_PREDICTION', fanValuePoints: 5, sortOrder: 50 },
    { slug: 'first-exact-score', name: 'Exact Score!', description: 'Predict the exact score of a match.', category: 'PREDICTIONS', triggerType: 'FIRST_EXACT_PREDICTION', fanValuePoints: 20, sortOrder: 51 },
    { slug: 'prediction-points-25', name: 'Prediction Starter', description: 'Earn 25+ prediction points total.', category: 'PREDICTIONS', triggerType: 'PREDICTION_POINTS', threshold: 25, fanValuePoints: 10, sortOrder: 60 },
    { slug: 'prediction-points-50', name: 'Prediction Pro', description: 'Earn 50+ prediction points total.', category: 'PREDICTIONS', triggerType: 'PREDICTION_POINTS', threshold: 50, fanValuePoints: 20, sortOrder: 61 },
    // Challenges
    { slug: 'first-peer-challenge', name: 'Challenger', description: 'Issue or accept your first peer challenge.', category: 'CHALLENGES', triggerType: 'FIRST_CHALLENGE', fanValuePoints: 10, sortOrder: 70 },
    { slug: 'first-challenge-win', name: 'Challenge Winner', description: 'Win your first peer challenge.', category: 'CHALLENGES', triggerType: 'FIRST_CHALLENGE_WIN', fanValuePoints: 15, sortOrder: 71 },
    // Fan Value
    { slug: 'fan-value-100', name: 'Rising Fan', description: 'Accumulate 100+ fan value points.', category: 'FAN_VALUE', triggerType: 'FAN_VALUE_POINTS', threshold: 100, fanValuePoints: 20, sortOrder: 80 },
    { slug: 'fan-value-250', name: 'Dedicated Fan', description: 'Accumulate 250+ fan value points.', category: 'FAN_VALUE', triggerType: 'FAN_VALUE_POINTS', threshold: 250, fanValuePoints: 30, sortOrder: 81 },
    // Profile
    { slug: 'profile-completed', name: 'Profile Complete', description: 'Complete your fan profile.', category: 'PROFILE', triggerType: 'PROFILE_COMPLETED', fanValuePoints: 10, sortOrder: 90 },
    // Platform
    { slug: 'early-supporter', name: 'Early Supporter', description: 'One of the first fans on PSL One.', category: 'PLATFORM', triggerType: 'MANUAL', fanValuePoints: 25, sortOrder: 100 },
  ];

  const badgeDefs: BadgeDef[] = [
    { slug: 'badge-first-fantasy-team', name: 'Team Maker', description: 'Created first fantasy team.', icon: '⚽', rarity: 'COMMON', category: 'FANTASY', sortOrder: 10 },
    { slug: 'badge-gameweek-grinder', name: 'Gameweek Grinder', description: 'Scored 25+ in a gameweek.', icon: '🏃', rarity: 'COMMON', category: 'FANTASY', sortOrder: 20 },
    { slug: 'badge-gameweek-hero', name: 'Gameweek Hero', description: 'Scored 50+ in a gameweek.', icon: '🦸', rarity: 'UNCOMMON', category: 'FANTASY', sortOrder: 21 },
    { slug: 'badge-gameweek-legend', name: 'Gameweek Legend', description: 'Scored 75+ in a gameweek.', icon: '🏆', rarity: 'RARE', category: 'FANTASY', sortOrder: 22 },
    { slug: 'badge-season-century', name: 'Century Badge', description: 'Scored 100+ in a season.', icon: '💯', rarity: 'UNCOMMON', category: 'FANTASY', sortOrder: 30 },
    { slug: 'badge-league-joiner', name: 'League Member', description: 'Joined first league.', icon: '🤝', rarity: 'COMMON', category: 'LEAGUES', sortOrder: 40 },
    { slug: 'badge-league-boss', name: 'League Boss', description: 'Created first league.', icon: '👑', rarity: 'UNCOMMON', category: 'LEAGUES', sortOrder: 41 },
    { slug: 'badge-first-prediction', name: 'Predictor', description: 'Made first prediction.', icon: '🎯', rarity: 'COMMON', category: 'PREDICTIONS', sortOrder: 50 },
    { slug: 'badge-exact-score', name: 'Oracle', description: 'Exact score prediction.', icon: '🔮', rarity: 'RARE', category: 'PREDICTIONS', sortOrder: 51 },
    { slug: 'badge-prediction-starter', name: 'Prediction Starter', description: '25+ prediction points.', icon: '📈', rarity: 'COMMON', category: 'PREDICTIONS', sortOrder: 60 },
    { slug: 'badge-prediction-pro', name: 'Prediction Pro', description: '50+ prediction points.', icon: '🏅', rarity: 'UNCOMMON', category: 'PREDICTIONS', sortOrder: 61 },
    { slug: 'badge-challenger', name: 'Challenger', description: 'First peer challenge.', icon: '⚔️', rarity: 'COMMON', category: 'CHALLENGES', sortOrder: 70 },
    { slug: 'badge-challenge-winner', name: 'Challenge Winner', description: 'Won first challenge.', icon: '🥇', rarity: 'UNCOMMON', category: 'CHALLENGES', sortOrder: 71 },
    { slug: 'badge-rising-fan', name: 'Rising Fan', description: '100+ fan value points.', icon: '⭐', rarity: 'COMMON', category: 'FAN_VALUE', sortOrder: 80 },
    { slug: 'badge-dedicated-fan', name: 'Dedicated Fan', description: '250+ fan value points.', icon: '🌟', rarity: 'UNCOMMON', category: 'FAN_VALUE', sortOrder: 81 },
    { slug: 'badge-profile-complete', name: 'Fan Identity', description: 'Profile completed.', icon: '👤', rarity: 'COMMON', category: 'PROFILE', sortOrder: 90 },
    { slug: 'badge-early-supporter', name: 'Early Supporter', description: 'PSL One founding fan.', icon: '🏟️', rarity: 'EPIC', category: 'PLATFORM', sortOrder: 100 },
  ];

  const achBadgePairs: Pair[] = [
    { achievement: 'first-fantasy-team', badge: 'badge-first-fantasy-team' },
    { achievement: 'fantasy-gameweek-25', badge: 'badge-gameweek-grinder' },
    { achievement: 'fantasy-gameweek-50', badge: 'badge-gameweek-hero' },
    { achievement: 'fantasy-gameweek-75', badge: 'badge-gameweek-legend' },
    { achievement: 'fantasy-season-100', badge: 'badge-season-century' },
    { achievement: 'joined-first-fantasy-league', badge: 'badge-league-joiner' },
    { achievement: 'created-first-fantasy-league', badge: 'badge-league-boss' },
    { achievement: 'first-prediction', badge: 'badge-first-prediction' },
    { achievement: 'first-exact-score', badge: 'badge-exact-score' },
    { achievement: 'prediction-points-25', badge: 'badge-prediction-starter' },
    { achievement: 'prediction-points-50', badge: 'badge-prediction-pro' },
    { achievement: 'first-peer-challenge', badge: 'badge-challenger' },
    { achievement: 'first-challenge-win', badge: 'badge-challenge-winner' },
    { achievement: 'fan-value-100', badge: 'badge-rising-fan' },
    { achievement: 'fan-value-250', badge: 'badge-dedicated-fan' },
    { achievement: 'profile-completed', badge: 'badge-profile-complete' },
    { achievement: 'early-supporter', badge: 'badge-early-supporter' },
  ];

  for (const d of achDefs) {
    await prisma.achievementDefinition.upsert({
      where: { slug: d.slug },
      create: { ...d, valueType: d.valueType ?? FanValueType.ACHIEVEMENT_POINTS },
      update: { name: d.name, description: d.description, fanValuePoints: d.fanValuePoints },
    });
  }

  for (const b of badgeDefs) {
    await prisma.badgeDefinition.upsert({ where: { slug: b.slug }, create: b, update: { name: b.name } });
  }

  for (const p of achBadgePairs) {
    const ach = await prisma.achievementDefinition.findUniqueOrThrow({ where: { slug: p.achievement } });
    const bdg = await prisma.badgeDefinition.findUniqueOrThrow({ where: { slug: p.badge } });
    await prisma.achievementBadge.upsert({
      where: { achievementDefinitionId_badgeDefinitionId: { achievementDefinitionId: ach.id, badgeDefinitionId: bdg.id } },
      create: { achievementDefinitionId: ach.id, badgeDefinitionId: bdg.id },
      update: {},
    });
  }

  console.log(`  ✓ Achievement definitions seeded: ${achDefs.length}`);
  console.log(`  ✓ Badge definitions seeded: ${badgeDefs.length}`);

  // ── Reward Readiness Definitions ──────────────────────────────────────────

  interface RewardDef {
    slug: string;
    name: string;
    description: string;
    category: RewardReadinessCategory;
    sortOrder: number;
    minFanValuePoints?: number;
    requiredAchievementSlugs?: string[];
    requiredBadgeSlugs?: string[];
    requiresFantasyTeam?: boolean;
    requiresPredictionActivity?: boolean;
    requiresChallengeActivity?: boolean;
    unlockHint?: string;
    sponsorName?: string;
  }

  const rewardDefs: RewardDef[] = [
    {
      slug: 'fantasy-starter-reward',
      name: 'Fantasy Starter Reward',
      description: 'Available to fans who have built a fantasy team and earned at least 10 Fan Value points.',
      category: RewardReadinessCategory.FANTASY,
      sortOrder: 10,
      minFanValuePoints: 10,
      requiresFantasyTeam: true,
      unlockHint: 'Build a fantasy team and earn 10 Fan Value points to unlock this reward opportunity.',
    },
    {
      slug: 'prediction-explorer-reward',
      name: 'Prediction Explorer Reward',
      description: 'Available to fans who have made match predictions and earned at least 20 Fan Value points.',
      category: RewardReadinessCategory.PREDICTIONS,
      sortOrder: 20,
      minFanValuePoints: 20,
      requiresPredictionActivity: true,
      unlockHint: 'Make at least one prediction and earn 20 Fan Value points.',
    },
    {
      slug: 'challenge-champion-reward',
      name: 'Challenge Champion Reward',
      description: 'Available to fans who have participated in peer challenges and earned at least 30 Fan Value points.',
      category: RewardReadinessCategory.CHALLENGES,
      sortOrder: 30,
      minFanValuePoints: 30,
      requiresChallengeActivity: true,
      unlockHint: 'Issue or accept a peer challenge and earn 30 Fan Value points.',
    },
    {
      slug: 'loyal-fan-reward',
      name: 'Loyal Fan Reward',
      description: 'Available to fans who have accumulated 100 or more Fan Value points across all activities.',
      category: RewardReadinessCategory.FAN_VALUE,
      sortOrder: 40,
      minFanValuePoints: 100,
      unlockHint: 'Accumulate 100 Fan Value points through fantasy, predictions, and challenges.',
    },
    {
      slug: 'sponsor-ready-reward',
      name: 'Sponsor Engagement Ready',
      description: 'For highly active fans: fantasy team, predictions, and 50 Fan Value points required.',
      category: RewardReadinessCategory.SPONSOR_READY,
      sortOrder: 50,
      minFanValuePoints: 50,
      requiresFantasyTeam: true,
      requiresPredictionActivity: true,
      sponsorName: 'PSL One Sponsor (TBD)',
      unlockHint: 'Build a fantasy team, make predictions, and earn 50 Fan Value points.',
    },
    {
      slug: 'platform-pioneer-reward',
      name: 'Platform Pioneer Reward',
      description: 'Exclusive reward opportunity for early PSL One platform adopters. Requires the Early Supporter badge.',
      category: RewardReadinessCategory.PLATFORM,
      sortOrder: 60,
      requiredAchievementSlugs: ['early-supporter'],
      requiredBadgeSlugs: ['badge-early-supporter'],
      unlockHint: 'Earn the Early Supporter achievement to unlock this exclusive platform pioneer reward.',
    },
  ];

  for (const r of rewardDefs) {
    await prisma.rewardReadinessDefinition.upsert({
      where: { slug: r.slug },
      create: {
        ...r,
        requiredAchievementSlugs: r.requiredAchievementSlugs ?? [],
        requiredBadgeSlugs: r.requiredBadgeSlugs ?? [],
      },
      update: { name: r.name, description: r.description, isEnabled: true },
    });
  }

  console.log(`  ✓ Reward readiness definitions seeded: ${rewardDefs.length}`);

  // ── PSL Club Experience ───────────────────────────────────────────────────
  const pslSeason = await prisma.season.findUnique({ where: { slug: 'psl-premiership-upcoming' } });
  if (!pslSeason) throw new Error('PSL season not found — seed order error');

  const pslVenueMap = new Map<string, string>(); // externalId → id
  const uniqueVenues = new Map<string, { name: string; capacity: number; city: string }>();
  for (const club of PSL_CLUBS) {
    if (!uniqueVenues.has(club.venueExternalId)) {
      uniqueVenues.set(club.venueExternalId, {
        name: club.venueName,
        capacity: club.venueCapacity,
        city: club.city,
      });
    }
  }

  for (const [externalId, v] of uniqueVenues) {
    const venue = await prisma.venue.upsert({
      where: { externalId },
      update: {},
      create: {
        name: v.name,
        city: v.city,
        country: 'South Africa',
        capacity: v.capacity,
        externalId,
        source: 'PSL_MANUAL',
      },
    });
    pslVenueMap.set(externalId, venue.id);
  }
  console.log(`  ✓ PSL Venues upserted: ${pslVenueMap.size}`);

  const pslTeamMap = new Map<string, string>(); // externalId → id
  for (const club of PSL_CLUBS) {
    const team = await prisma.team.upsert({
      where: { slug: club.slug },
      update: { shortName: club.shortName },
      create: {
        name: club.name,
        slug: club.slug,
        shortName: club.shortName,
        country: club.country,
        externalId: club.externalId,
        source: 'PSL_MANUAL',
      },
    });
    pslTeamMap.set(club.externalId, team.id);

    const venueId = pslVenueMap.get(club.venueExternalId);

    // ClubProfile
    await prisma.clubProfile.upsert({
      where: { teamId: team.id },
      update: {},
      create: {
        teamId: team.id,
        profileStatus: ClubProfileStatus.DRAFT,
        primaryColor: club.primaryColour,
        secondaryColor: club.secondaryColour,
        city: club.city,
        country: club.country,
      },
    });

    // SeasonTeam
    await prisma.seasonTeam.upsert({
      where: { seasonId_teamId: { seasonId: pslSeason.id, teamId: team.id } },
      update: {},
      create: {
        seasonId: pslSeason.id,
        teamId: team.id,
        status: SeasonTeamStatus.PROVISIONAL,
        source: SeasonTeamSource.MANUAL,
      },
    });

    // Placeholder content item (create only — no unique slug, idempotent via deleteMany above)
    await prisma.clubContentItem.create({
      data: {
        teamId: team.id,
        title: `Welcome to ${club.name}`,
        summary: `${club.name} is competing in the PSL Premiership. Follow the club for the latest news and squad information.`,
        type: ClubContentType.ANNOUNCEMENT,
        status: ClubContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });

    // Placeholder shop products (8 per club, catalogue-only)
    const PLACEHOLDER_PRODUCTS = [
      { suffix: 'home-kit',      name: 'Home Kit Placeholder',       category: ShopProductCategory.HOME_KIT,      featured: true  },
      { suffix: 'away-kit',      name: 'Away Kit Placeholder',       category: ShopProductCategory.AWAY_KIT,      featured: false },
      { suffix: 'third-kit',     name: 'Third Kit Placeholder',      category: ShopProductCategory.THIRD_KIT,     featured: false },
      { suffix: 'training-top',  name: 'Training Top Placeholder',   category: ShopProductCategory.TRAINING_WEAR, featured: false },
      { suffix: 'club-scarf',    name: 'Club Scarf Placeholder',     category: ShopProductCategory.ACCESSORIES,   featured: false },
      { suffix: 'lifestyle-hood',name: 'Lifestyle Hoodie Placeholder',category: ShopProductCategory.LIFESTYLE,    featured: false },
      { suffix: 'kids-mini-kit', name: 'Kids Mini Kit Placeholder',  category: ShopProductCategory.KIDS,          featured: false },
      { suffix: 'souvenirs',     name: 'Souvenirs Placeholder',      category: ShopProductCategory.SOUVENIRS,     featured: false },
    ];
    for (const prod of PLACEHOLDER_PRODUCTS) {
      await prisma.clubShopProduct.upsert({
        where: { teamId_slug: { teamId: team.id, slug: `${club.slug}-${prod.suffix}` } },
        update: {},
        create: {
          teamId: team.id,
          name: `${club.shortName} ${prod.name}`,
          slug: `${club.slug}-${prod.suffix}`,
          description: `Placeholder listing. Official ${club.name} merchandise coming soon.`,
          category: prod.category,
          status: ShopProductStatus.PUBLISHED,
          availability: ShopProductAvailability.COMING_SOON,
          featured: prod.featured,
          priceDisplay: 'Price TBC',
          currencyCode: 'ZAR',
        },
      });
    }

    // ClubExperienceStatus
    await prisma.clubExperienceStatus.upsert({
      where: { teamId: team.id },
      update: {},
      create: {
        teamId: team.id,
        profileReady: false,
        squadReady: false,
        shopfrontReady: false,
        catalogueReady: true,
        fixturesReady: false,
        venueReady: !!pslVenueMap.get(club.venueExternalId),
        lastReviewedAt: new Date(),
        reviewNotes: 'Seeded — awaiting squad, profile, and fixture assignment.',
      },
    });
  }

  console.log(`  ✓ PSL Clubs seeded: ${PSL_CLUBS.length}`);
  console.log(`  ✓ PSL Season team registrations: ${PSL_CLUBS.length} (PROVISIONAL)`);

  // ── PSL Fantasy Calibration ───────────────────────────────────────────────
  // Provisional placeholder players — NOT official PSL data
  let pslPlayerCount = 0;
  for (const p of PSL_PLACEHOLDER_PLAYERS) {
    const teamId = pslTeamMap.get(p.clubExternalId);
    if (!teamId) continue;
    const existing = await prisma.player.findFirst({ where: { externalId: p.externalId } });
    if (!existing) {
      await prisma.player.create({
        data: {
          teamId,
          name: p.name,
          position: p.position,
          nationality: p.nationality,
          number: p.shirtNumber,
          externalId: p.externalId,
          source: 'PSL_PLACEHOLDER',
        },
      });
    }
    pslPlayerCount++;
  }
  console.log(`  ✓ PSL placeholder players: ${pslPlayerCount} (PROVISIONAL)`);

  // PSL FantasyRulesConfig — provisional PSL 30-round season settings
  await prisma.fantasyRulesConfig.upsert({
    where: { seasonId: pslSeason.id },
    create: {
      seasonId: pslSeason.id,
      // PSL uses 30 rounds; halfway = gameweek 15
      halfwayGameweek: 15,
      seasonGameweekCount: 30,
      // All other defaults match the platform's existing EPL-derived rules
    },
    update: {},
  });
  console.log(`  ✓ PSL FantasyRulesConfig seeded (PROVISIONAL — 30-round season)`);

  // PSL provisional player prices — only seed if price is missing
  let pslPriceCount = 0;
  for (const p of PSL_PLACEHOLDER_PLAYERS) {
    const teamId = pslTeamMap.get(p.clubExternalId);
    if (!teamId) continue;
    const player = await prisma.player.findFirst({ where: { externalId: p.externalId } });
    if (!player) continue;
    const price = PROVISIONAL_PRICE[p.position];
    await prisma.fantasyPlayerPrice.upsert({
      where: { playerId_seasonId: { playerId: player.id, seasonId: pslSeason.id } },
      create: { playerId: player.id, seasonId: pslSeason.id, price },
      update: {},
    });
    pslPriceCount++;
  }
  console.log(`  ✓ PSL provisional player prices: ${pslPriceCount} (PROVISIONAL)`);

  // PSL SeasonSquadRegistration for placeholder players
  let pslRegCount = 0;
  for (const p of PSL_PLACEHOLDER_PLAYERS) {
    const teamId = pslTeamMap.get(p.clubExternalId);
    if (!teamId) continue;
    const player = await prisma.player.findFirst({ where: { externalId: p.externalId } });
    if (!player) continue;
    await prisma.seasonSquadRegistration.upsert({
      where: { seasonId_playerId: { seasonId: pslSeason.id, playerId: player.id } },
      create: {
        seasonId: pslSeason.id,
        teamId,
        playerId: player.id,
        status: 'PROVISIONAL',
        shirtNumber: p.shirtNumber,
        source: 'PLACEHOLDER',
      },
      update: {},
    });
    pslRegCount++;
  }
  console.log(`  ✓ PSL squad registrations: ${pslRegCount} (PROVISIONAL)`);

  // PSL PredictionRulesConfig — provisional calibration values (10/5/3/0 matches existing scoring engine)
  await prisma.predictionRulesConfig.upsert({
    where: { seasonId: pslSeason.id },
    create: {
      seasonId: pslSeason.id,
      correctScorePoints: 10,
      correctGoalDifferencePoints: 5,
      correctResultPoints: 3,
      participationPoints: 0,
      challengeWinPoints: 0,
      challengeDrawPoints: 0,
      lockMinutesBeforeKickoff: 0,
      status: 'PROVISIONAL',
    },
    update: {},
  });
  console.log(`  ✓ PSL PredictionRulesConfig seeded (PROVISIONAL — 10/5/3/0 scoring)`);

  // Integration Provider Configs — non-sensitive readiness state only, no credentials
  const integrationProviders = [
    { providerKey: 'wallet-default', displayName: 'Fan Wallet Provider', providerType: 'WALLET', mode: 'SANDBOX', status: 'SANDBOX_READY', requiresComplianceApproval: true, requiresContractApproval: true, notes: 'Production disabled. Fantasy and Guess the Score remain POINTS-ONLY. Real-money wallet requires provider contract and compliance sign-off.' },
    { providerKey: 'payment-default', displayName: 'Payment Gateway Provider', providerType: 'PAYMENT', mode: 'MOCK', status: 'PROVIDER_REQUIRED', requiresComplianceApproval: true, requiresContractApproval: true, notes: 'No payment provider selected. Production disabled.' },
    { providerKey: 'checkout-default', displayName: 'Checkout / Commerce Provider', providerType: 'CHECKOUT', mode: 'SANDBOX', status: 'PRODUCTION_DISABLED', requiresComplianceApproval: true, requiresContractApproval: true, notes: 'Production checkout explicitly disabled. Sandbox config only. No real orders.' },
    { providerKey: 'ticketing-default', displayName: 'Ticket Inventory Provider', providerType: 'TICKETING', mode: 'MOCK', status: 'PROVIDER_REQUIRED', requiresComplianceApproval: false, requiresContractApproval: true, notes: 'No ticketing provider selected. No real ticket issuance.' },
    { providerKey: 'live-data-default', displayName: 'Live Sports Data Provider', providerType: 'LIVE_DATA', mode: 'MOCK', status: 'PROVIDER_REQUIRED', requiresComplianceApproval: false, requiresContractApproval: true, notes: 'Stub/mock provider only. No production ingestion. LiveMatchProviderInterface ready for wiring.' },
    { providerKey: 'sponsor-activation-default', displayName: 'Sponsor Activation Platform', providerType: 'SPONSOR_ACTIVATION', mode: 'MOCK', status: 'INTEGRATION_READY', requiresComplianceApproval: true, requiresContractApproval: true, notes: 'Admin shell ready. No live sponsor campaign activation.' },
    { providerKey: 'rewards-redemption-default', displayName: 'Rewards Redemption Provider', providerType: 'REWARDS_REDEMPTION', mode: 'MOCK', status: 'COMPLIANCE_REQUIRED', requiresComplianceApproval: true, requiresContractApproval: true, notes: 'RewardReadinessModule built. Eligibility checks only. Production redemption disabled.' },
    { providerKey: 'notifications-default', displayName: 'Notifications Provider (Email/Push)', providerType: 'NOTIFICATIONS', mode: 'SANDBOX', status: 'SANDBOX_READY', requiresComplianceApproval: false, requiresContractApproval: false, notes: 'Notifications queued but not delivered. Wire email/push provider in Sprint 3+.' },
    { providerKey: 'analytics-default', displayName: 'Analytics & Data Provider', providerType: 'ANALYTICS', mode: 'SANDBOX', status: 'SANDBOX_READY', requiresComplianceApproval: false, requiresContractApproval: false, notes: 'Admin KPIs built. Wire DataDog/Amplitude in Sprint 3+.' },
  ] as const;

  for (const p of integrationProviders) {
    await prisma.integrationProviderConfig.upsert({
      where: { providerKey: p.providerKey },
      create: {
        providerKey: p.providerKey,
        displayName: p.displayName,
        providerType: p.providerType as any,
        mode: p.mode as any,
        status: p.status as any,
        isEnabled: false,
        isProductionEnabled: false,
        requiresComplianceApproval: p.requiresComplianceApproval,
        requiresContractApproval: p.requiresContractApproval,
        notes: p.notes,
      },
      update: { displayName: p.displayName, notes: p.notes },
    });
  }
  console.log(`  ✓ ${integrationProviders.length} IntegrationProviderConfig entries seeded (all production-disabled)`);

  // ── STORY-37: Silicon Enterprise Sandbox Wallet Provider ──────────────────
  // Seeding operational metadata only. No API keys. No secrets. SANDBOX mode.
  // PSL One does not hold regulated funds. Wallet linking is sandbox-only.
  const walletProviderConfig = await prisma.integrationProviderConfig.upsert({
    where: { providerKey: 'silicon-enterprise-wallet' },
    create: {
      providerKey: 'silicon-enterprise-wallet',
      displayName: 'Silicon Enterprise Wallet',
      providerType: 'WALLET',
      mode: 'SANDBOX',
      status: 'SANDBOX_READY',
      isEnabled: false,
      isProductionEnabled: false,
      requiresComplianceApproval: true,
      requiresContractApproval: true,
      notes: 'External wallet integration partner. PSL One does not hold regulated funds. Sandbox mode only.',
    },
    update: {},
  });
  await prisma.walletProviderDetail.upsert({
    where: { slug: 'silicon-enterprise-wallet' },
    create: {
      integrationProviderConfigId: walletProviderConfig.id,
      name: 'Silicon Enterprise Wallet',
      slug: 'silicon-enterprise-wallet',
      providerType: 'MOBILE_WALLET',
      status: 'SANDBOX',
      publicDisplayName: 'Silicon Enterprise Wallet (Sandbox)',
      authType: 'NONE',
      contactName: 'Brian Mather',
      contactEmail: 'brian.mather@siliconenterprise.com',
      notes: 'External wallet integration partner. PSL One does not hold regulated funds. Sandbox mode only. No production credentials stored.',
    },
    update: {},
  });
  console.log(`  ✓ Silicon Enterprise Wallet provider seeded (SANDBOX, admin-only metadata)`);

  // ── STORY-37: Demo Sponsor (clearly fictional) ────────────────────────────
  const demoSponsor = await prisma.sponsor.upsert({
    where: { slug: 'demo-sponsor' },
    create: {
      name: 'Demo Sponsor',
      slug: 'demo-sponsor',
      sector: 'Technology',
      status: 'PROSPECT',
    },
    update: {},
  });
  console.log(`  ✓ Demo Sponsor seeded (PROSPECT, fictional)`);

  // ── STORY-37: Draft media asset (no copyrighted content) ─────────────────
  await prisma.mediaAsset.upsert({
    where: { slug: 'test-media-asset' },
    create: {
      title: 'Test Media Asset',
      slug: 'test-media-asset',
      description: 'Placeholder media asset for testing. No copyrighted content.',
      mediaType: 'ARTICLE',
      contentCategory: 'OTHER',
      visibility: 'DRAFT',
      rightsStatus: 'PENDING_REVIEW',
      isFeatured: false,
      isLowDataAvailable: false,
    },
    update: {},
  });
  console.log(`  ✓ Test Media Asset seeded (DRAFT, no copyrighted content)`);

  const publicMediaAssets = [
    {
      slug: 'world-cup-2026-kickoff-guide',
      title: 'World Cup 2026 Kickoff Guide',
      description: 'A short guide to the beta World Cup fixture feed, schedule navigation, and points-only gameplay surfaces.',
      mediaType: 'ARTICLE',
      contentCategory: 'EDUCATION',
      isFeatured: true,
    },
    {
      slug: 'world-cup-2026-fixtures-explainer',
      title: 'How the World Cup Fixture Schedule Is Wired',
      description: 'Notes on the public feed import, schedule population, and how the platform keeps provisional seed data in sync.',
      mediaType: 'ARTICLE',
      contentCategory: 'CLUB_NEWS',
      isFeatured: false,
    },
    {
      slug: 'world-cup-2026-fan-value-primer',
      title: 'Fan Value Primer',
      description: 'A quick explainer for points-based loyalty, campaigns, and the non-financial reward model.',
      mediaType: 'ARTICLE',
      contentCategory: 'SPONSOR_BRANDED',
      isFeatured: false,
    },
  ] as const;

  const publicMediaBySlug = new Map<string, string>();
  for (const asset of publicMediaAssets) {
    const created = await prisma.mediaAsset.upsert({
      where: { slug: asset.slug },
      create: {
        title: asset.title,
        slug: asset.slug,
        description: asset.description,
        mediaType: asset.mediaType,
        contentCategory: asset.contentCategory,
        visibility: 'PUBLIC',
        rightsStatus: 'CLEAR',
        isFeatured: asset.isFeatured,
        isLowDataAvailable: true,
        publishedAt: new Date('2026-06-29T00:00:00Z'),
      },
      update: {
        title: asset.title,
        description: asset.description,
        mediaType: asset.mediaType,
        contentCategory: asset.contentCategory,
        visibility: 'PUBLIC',
        rightsStatus: 'CLEAR',
        isFeatured: asset.isFeatured,
        isLowDataAvailable: true,
        publishedAt: new Date('2026-06-29T00:00:00Z'),
      },
    });
    publicMediaBySlug.set(asset.slug, created.id);
  }
  console.log(`  ✓ Public media assets seeded: ${publicMediaAssets.length}`);

  // ── STORY-37: Draft campaign with one action ──────────────────────────────
  const draftCampaign = await prisma.sponsorCampaign.upsert({
    where: { slug: 'sandbox-campaign' },
    create: {
      title: 'Sandbox Campaign',
      slug: 'sandbox-campaign',
      description: 'Demonstration campaign for testing. Not published.',
      sponsorId: demoSponsor.id,
      campaignType: 'OTHER',
      status: 'DRAFT',
      startsAt: new Date('2026-08-01T00:00:00Z'),
      endsAt: new Date('2026-09-30T23:59:59Z'),
      audienceScope: 'GLOBAL',
      requiresWalletLinked: false,
      requiresAgeConfirmation: false,
    },
    update: {},
  });
  const existingAction = await prisma.campaignAction.findFirst({ where: { campaignId: draftCampaign.id } });
  if (!existingAction) {
    await prisma.campaignAction.create({
      data: {
        campaignId: draftCampaign.id,
        title: 'Click the call to action',
        actionType: 'CLICK_CTA',
        pointsAwarded: 10,
        displayOrder: 1,
        isRequired: true,
      },
    });
  }
  console.log(`  ✓ Sandbox Campaign seeded (DRAFT) with one CLICK_CTA action`);

  const worldCupCampaign = await prisma.sponsorCampaign.upsert({
    where: { slug: 'world-cup-fan-quest' },
    create: {
      title: 'World Cup Fan Quest',
      slug: 'world-cup-fan-quest',
      description: 'A points-only fan campaign that surfaces the public World Cup guide content and keeps the campaign rail populated.',
      sponsorId: demoSponsor.id,
      seasonId: season.id,
      campaignType: 'CONTENT_UNLOCK',
      status: 'PUBLISHED',
      startsAt: new Date('2026-06-20T00:00:00Z'),
      endsAt: new Date('2026-07-31T23:59:59Z'),
      audienceScope: 'SEASON',
      callToActionLabel: 'Open guide',
      callToActionUrl: '/media/world-cup-2026-kickoff-guide',
      termsAndConditions: 'Points-only campaign. No cash value, no wagering, no real-money rewards.',
      maxParticipationsPerFan: 1,
      requiresContentWatch: true,
      publishedAt: new Date('2026-06-29T00:00:00Z'),
    },
    update: {
      title: 'World Cup Fan Quest',
      description: 'A points-only fan campaign that surfaces the public World Cup guide content and keeps the campaign rail populated.',
      sponsorId: demoSponsor.id,
      seasonId: season.id,
      campaignType: 'CONTENT_UNLOCK',
      status: 'PUBLISHED',
      startsAt: new Date('2026-06-20T00:00:00Z'),
      endsAt: new Date('2026-07-31T23:59:59Z'),
      audienceScope: 'SEASON',
      callToActionLabel: 'Open guide',
      callToActionUrl: '/media/world-cup-2026-kickoff-guide',
      termsAndConditions: 'Points-only campaign. No cash value, no wagering, no real-money rewards.',
      maxParticipationsPerFan: 1,
      requiresContentWatch: true,
      publishedAt: new Date('2026-06-29T00:00:00Z'),
    },
  });

  const campaignActions = [
    {
      title: 'Open the World Cup kickoff guide',
      actionType: 'CLICK_CTA',
      pointsAwarded: 5,
      displayOrder: 1,
      isRequired: true,
    },
    {
      title: 'Read the public World Cup guide',
      actionType: 'WATCH_MEDIA',
      requiredMediaAssetSlug: 'world-cup-2026-kickoff-guide',
      pointsAwarded: 10,
      displayOrder: 2,
      isRequired: true,
    },
  ] as const;

  for (const action of campaignActions) {
    const existing = await prisma.campaignAction.findFirst({
      where: { campaignId: worldCupCampaign.id, title: action.title },
    });
    const data = {
      campaignId: worldCupCampaign.id,
      title: action.title,
      actionType: action.actionType,
      pointsAwarded: action.pointsAwarded,
      displayOrder: action.displayOrder,
      isRequired: action.isRequired,
      ...(action.requiredMediaAssetSlug ? { requiredMediaAssetId: publicMediaBySlug.get(action.requiredMediaAssetSlug) } : {}),
    };

    if (existing) {
      await prisma.campaignAction.update({
        where: { id: existing.id },
        data: {
          actionType: action.actionType,
          pointsAwarded: action.pointsAwarded,
          displayOrder: action.displayOrder,
          isRequired: action.isRequired,
          ...(action.requiredMediaAssetSlug ? { requiredMediaAssetId: publicMediaBySlug.get(action.requiredMediaAssetSlug) } : {}),
        },
      });
    } else {
      await prisma.campaignAction.create({ data });
    }
  }
  console.log(`  ✓ Public campaign seeded: ${worldCupCampaign.slug} (${campaignActions.length} actions)`);

  // ── STORY-37: Fan Value reward definition ─────────────────────────────────
  await prisma.rewardDefinition.upsert({
    where: { id: 'reward-def-fan-value-demo' },
    create: {
      id: 'reward-def-fan-value-demo',
      title: 'Campaign Fan Value Reward',
      description: 'Demonstration Fan Value reward. Non-financial — points only. No cash value.',
      rewardType: 'FAN_VALUE_POINTS',
      campaignId: draftCampaign.id,
      sponsorId: demoSponsor.id,
      pointsAmount: 50,
      displayValue: '50 Fan Value points',
      isActive: true,
    },
    update: {},
  });
  console.log(`  ✓ Fan Value reward definition seeded (50 pts, non-financial, no cash value)`);

  // ── STORY-38: Seed system user (for market config authorship) ────────────
  const seedPasswordHash = await bcrypt.hash(SEED_PLATFORM_USERS_PASSWORD, 12);

  const seedAdminUser = await prisma.user.upsert({
    where: { email: 'seed-admin@psl-one.internal' },
    update: {},
    create: {
      email: 'seed-admin@psl-one.internal',
      passwordHash: '$SEED_NOT_A_REAL_PASSWORD',
      role: UserRole.PSL_ADMIN,
      dateOfBirth: new Date('1990-01-01'),
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`  ✓ Seed admin user upserted (seed-admin@psl-one.internal)`);

  const platformAdminUser = await prisma.user.upsert({
    where: { email: SEED_PLATFORM_ADMIN_EMAIL },
    update: {
      role: UserRole.PSL_ADMIN,
      isVerified: true,
      isActive: true,
    },
    create: {
      email: SEED_PLATFORM_ADMIN_EMAIL,
      passwordHash: seedPasswordHash,
      role: UserRole.PSL_ADMIN,
      dateOfBirth: new Date('1985-01-01'),
      isVerified: true,
      isActive: true,
    },
  });
  console.log(`  ✓ Platform admin user upserted (${platformAdminUser.email})`);

  const platformUser = await prisma.user.upsert({
    where: { email: SEED_PLATFORM_USER_EMAIL },
    update: {
      role: UserRole.FAN,
      isVerified: true,
      isActive: true,
    },
    create: {
      email: SEED_PLATFORM_USER_EMAIL,
      passwordHash: seedPasswordHash,
      role: UserRole.FAN,
      dateOfBirth: new Date('1993-01-01'),
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.fanProfile.upsert({
    where: { userId: platformUser.id },
    update: {
      displayName: 'Obe',
      city: 'Johannesburg',
      country: 'South Africa',
    },
    create: {
      userId: platformUser.id,
      displayName: 'Obe',
      city: 'Johannesburg',
      country: 'South Africa',
    },
  });
  console.log(`  ✓ Platform fan user upserted (${SEED_PLATFORM_USER_EMAIL})`);

  const partnerSponsor = await prisma.sponsor.upsert({
    where: { slug: 'guess-the-score-partner' },
    update: {
      name: 'Guess The Score Partner',
      primaryContactEmail: SEED_PLATFORM_PARTNER_EMAIL,
      status: 'PROSPECT',
    },
    create: {
      name: 'Guess The Score Partner',
      slug: 'guess-the-score-partner',
      sector: 'Media & Fan Engagement',
      primaryContactEmail: SEED_PLATFORM_PARTNER_EMAIL,
      status: 'PROSPECT',
    },
  });

  const partnerUser = await prisma.user.upsert({
    where: { email: SEED_PLATFORM_PARTNER_EMAIL },
    update: {
      role: UserRole.SPONSOR,
      isVerified: true,
      isActive: true,
    },
    create: {
      email: SEED_PLATFORM_PARTNER_EMAIL,
      passwordHash: seedPasswordHash,
      role: UserRole.SPONSOR,
      dateOfBirth: new Date('1988-01-01'),
      isVerified: true,
      isActive: true,
    },
  });
  await prisma.sponsorMembership.upsert({
    where: { userId_sponsorId: { userId: partnerUser.id, sponsorId: partnerSponsor.id } },
    update: {
      role: 'SPONSOR',
      isActive: true,
    },
    create: {
      userId: partnerUser.id,
      sponsorId: partnerSponsor.id,
      role: 'SPONSOR',
      isActive: true,
    },
  });
  console.log(`  ✓ Partner sponsor user upserted (${SEED_PLATFORM_PARTNER_EMAIL})`);

  // ── STORY-38: Compliance domain config ───────────────────────────────────
  await prisma.complianceDomainConfig.upsert({
    where: { domainKey: 'POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE' },
    create: {
      domainKey: 'POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE',
      displayName: 'Points-Based Social Prediction Compliance',
      status: ComplianceReviewStatus.INTERNAL_REVIEW_REQUIRED,
      statusNotes: 'PSL One social prediction challenges use system-issued gameplay points only. Gameplay points cannot be purchased, transferred, withdrawn or exchanged for money. Challenge results affect platform scoring and leaderboard positions only.',
    },
    update: {},
  });
  console.log(`  ✓ Compliance domain config seeded (POINTS_BASED_SOCIAL_PREDICTION_COMPLIANCE)`);

  // ── SPRINT-38B: WC2026 FantasyRulesConfig ────────────────────────────────
  // 9 gameweeks (group MD1, MD2, MD3 + R32, R16, QF, SF, 3P, Final)
  await prisma.fantasyRulesConfig.upsert({
    where: { seasonId: season.id },
    create: {
      seasonId: season.id,
      halfwayGameweek: 5,
      seasonGameweekCount: 9,
    },
    update: {},
  });
  console.log(`  ✓ WC2026 FantasyRulesConfig seeded (9 gameweeks)`);

  // ── SPRINT-38B: WC2026 Market configs (for FixturePredictionMarket) ──────
  const wcMarketConfigDefs: Array<{ marketType: PredictionMarketType; label: string; baseOpportunity: number; allowedMultipliers: number[] }> = [
    { marketType: PredictionMarketType.MATCH_RESULT, label: 'WC2026 Match Result (1X2)', baseOpportunity: 100, allowedMultipliers: [1.0, 1.5, 2.0] },
    { marketType: PredictionMarketType.BOTH_TEAMS_TO_SCORE, label: 'WC2026 Both Teams to Score', baseOpportunity: 80, allowedMultipliers: [1.0, 1.5] },
    { marketType: PredictionMarketType.CORRECT_SCORE, label: 'WC2026 Correct Score', baseOpportunity: 60, allowedMultipliers: [1.0, 2.0, 3.0] },
  ];
  const wcMarketConfigMap = new Map<PredictionMarketType, string>(); // marketType → id
  for (const mc of wcMarketConfigDefs) {
    const existing = await prisma.predictionMarketConfig.findFirst({
      where: { seasonId: season.id, marketType: mc.marketType },
    });
    if (!existing) {
      const created = await prisma.predictionMarketConfig.create({
        data: {
          seasonId: season.id,
          marketType: mc.marketType,
          label: mc.label,
          baseOpportunity: mc.baseOpportunity,
          allowedMultipliersJson: mc.allowedMultipliers,
          minCommitmentPct: 10,
          maxCommitmentPct: 100,
          pointsReturnRate: 1.0,
          isEnabled: true,
          createdByUserId: seedAdminUser.id,
        },
      });
      wcMarketConfigMap.set(mc.marketType, created.id);
    } else {
      wcMarketConfigMap.set(mc.marketType, existing.id);
    }
  }
  console.log(`  ✓ WC2026 prediction market configs seeded (${wcMarketConfigDefs.length} configs)`);

  // ── SPRINT-38B: WC2026 FantasyPlayerPrice (points-only, no cash value) ───
  // Seed prices for all real WC2026 players (excludes TBD team)
  // GK: 55 pts · DEF: 50 pts · MID: 70 pts · FWD: 85 pts
  // Prices are fantasy points only — no cash value whatsoever
  const WC_PRICE: Record<string, number> = {
    GOALKEEPER: 55,
    DEFENDER:   50,
    MIDFIELDER: 70,
    FORWARD:    85,
  };

  const wcPlayers = await prisma.player.findMany({
    where: { source: 'fifa-wc2026', team: { NOT: { slug: 'tbd' } } },
    select: { id: true, position: true },
  });
  let wcPriceCount = 0;
  for (const p of wcPlayers) {
    const price = WC_PRICE[p.position] ?? 55;
    await prisma.fantasyPlayerPrice.upsert({
      where: { playerId_seasonId: { playerId: p.id, seasonId: season.id } },
      create: { playerId: p.id, seasonId: season.id, price },
      update: {},
    });
    wcPriceCount++;
  }
  console.log(`  ✓ WC2026 fantasy player prices seeded: ${wcPriceCount} (POINTS-ONLY, no cash value)`);

  // ── SPRINT-38B: WC2026 FixturePredictionMarket (RESULT market per fixture)
  // Only for isPublished=true fixtures. marketType=MATCH_RESULT.
  // locksAt = kickoffAt - 30 min. status = OPEN. Points-only, no wagering.
  const matchResultConfigId = wcMarketConfigMap.get(PredictionMarketType.MATCH_RESULT);
  let wcMarketCount = 0;
  if (matchResultConfigId) {
    const publishedFixtures = await prisma.fixture.findMany({
      where: { seasonId: season.id, isPublished: true },
      select: { id: true, kickoffAt: true, homeTeam: { select: { shortName: true } }, awayTeam: { select: { shortName: true } } },
    });
    for (const f of publishedFixtures) {
      const existing = await prisma.fixturePredictionMarket.findFirst({
        where: { fixtureId: f.id, marketType: PredictionMarketType.MATCH_RESULT },
      });
      if (!existing) {
        const locksAt = new Date(f.kickoffAt.getTime() - 30 * 60 * 1000);
        await prisma.fixturePredictionMarket.create({
          data: {
            fixtureId: f.id,
            marketConfigId: matchResultConfigId,
            marketType: PredictionMarketType.MATCH_RESULT,
            status: 'OPEN',
            homeSelectionLabel: f.homeTeam.shortName,
            drawSelectionLabel: 'Draw',
            awaySelectionLabel: f.awayTeam.shortName,
            baseOpportunity: 100,
            pointsReturnRate: 1.0,
            allowedMultipliersJson: [1.0, 1.5, 2.0],
            locksAt,
          },
        });
        wcMarketCount++;
      }
    }
  }
  console.log(`  ✓ WC2026 fixture prediction markets seeded: ${wcMarketCount} (MATCH_RESULT, OPEN, POINTS-ONLY)`);

  // ── STORY-38: Market configs for PSL season ───────────────────────────────
  const marketConfigDefs: Array<{ marketType: PredictionMarketType; label: string; baseOpportunity: number; allowedMultipliers: number[] }> = [
    { marketType: PredictionMarketType.MATCH_RESULT, label: 'Match Result (1X2)', baseOpportunity: 100, allowedMultipliers: [1.0, 1.5, 2.0] },
    { marketType: PredictionMarketType.BOTH_TEAMS_TO_SCORE, label: 'Both Teams to Score', baseOpportunity: 80, allowedMultipliers: [1.0, 1.5] },
    { marketType: PredictionMarketType.HALF_TIME_RESULT, label: 'Half-Time Result', baseOpportunity: 60, allowedMultipliers: [1.0, 1.5, 2.0] },
  ];
  for (const mc of marketConfigDefs) {
    const existing = await prisma.predictionMarketConfig.findFirst({
      where: { seasonId: pslSeason.id, marketType: mc.marketType },
    });
    if (!existing) {
      await prisma.predictionMarketConfig.create({
        data: {
          seasonId: pslSeason.id,
          marketType: mc.marketType,
          label: mc.label,
          baseOpportunity: mc.baseOpportunity,
          allowedMultipliersJson: mc.allowedMultipliers,
          minCommitmentPct: 10,
          maxCommitmentPct: 100,
          pointsReturnRate: 1.0,
          isEnabled: true,
          createdByUserId: seedAdminUser.id,
        },
      });
    }
  }
  console.log(`  ✓ Social prediction market configs seeded (${marketConfigDefs.length} configs for PSL season)`);

  // ── STORY-38: Zeroed league standings for PSL clubs ───────────────────────
  let standingCount38 = 0;
  for (let i = 0; i < PSL_CLUBS.length; i++) {
    const club = PSL_CLUBS[i]!;
    const teamId = pslTeamMap.get(club.externalId);
    if (!teamId) continue;
    const existing = await prisma.leagueStanding.findUnique({
      where: { seasonId_clubId: { seasonId: pslSeason.id, clubId: teamId } },
    });
    if (!existing) {
      await prisma.leagueStanding.create({
        data: {
          seasonId: pslSeason.id,
          clubId: teamId,
          position: i + 1,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          goalDifference: 0,
          points: 0,
          sourceType: DataSourceType.SEEDED,
          dataStatus: DataStatus.PROVISIONAL,
          freshnessStatus: FreshnessStatus.MANUAL,
          lastUpdatedAt: new Date(),
        },
      });
      standingCount38++;
    }
  }
  console.log(`  ✓ League standings seeded (${standingCount38} PSL clubs, zeroed, PROVISIONAL)`);

  // ── STORY-38: Published trigger-ready campaign for demo/testing ──────────
  // This campaign is PUBLISHED and within its time window so CampaignTriggerService will
  // fire events for it when match events are ingested via the sandbox.
  const publishedCampaign = await prisma.sponsorCampaign.upsert({
    where: { slug: 'match-day-trigger-demo' },
    create: {
      title: 'Match Day Engagement Demo',
      slug: 'match-day-trigger-demo',
      description: 'PUBLISHED campaign for testing campaign triggers. Points-based only. No real rewards.',
      sponsorId: demoSponsor.id,
      campaignType: 'OTHER',
      status: 'PUBLISHED',
      startsAt: new Date('2026-01-01T00:00:00Z'),
      endsAt: new Date('2027-12-31T23:59:59Z'),
      audienceScope: 'GLOBAL',
      requiresWalletLinked: false,
      requiresAgeConfirmation: false,
    },
    update: {},
  });
  console.log(`  ✓ Published trigger-ready campaign seeded (match-day-trigger-demo, no real rewards)`);

  void publishedCampaign;

  console.log('');
  console.log('Seed complete.');
  console.log(`  Competition : ${competition.name}`);
  console.log(`  Season      : ${season.name} (active=true)`);
  console.log(`  Venues      : ${VENUES.length}`);
  console.log(`  Teams       : ${TEAMS.length} + 1 TBD`);
  console.log(`  Players     : ${playersBatch.length}`);
  console.log(`  Groups      : ${GROUPS.length}`);
  console.log(`  Fixtures    : ${fixtureCount}`);
  console.log(`  Stages      : ${STAGE_DEFS.length}`);
  console.log(`  Gameweeks   : ${gameweekMap.size}`);
  console.log(`  Standings   : ${standingCount} rows (all zeroed)`);
  console.log(`  PSL Clubs   : ${PSL_CLUBS.length}`);
  console.log(`  PSL Players : ${pslPlayerCount} (provisional)`);
  console.log(`  PSL Prices  : ${pslPriceCount} (provisional)`);
  console.log(`  WC Prices   : ${wcPriceCount} (points-only, no cash value)`);
  console.log(`  WC Markets  : ${wcMarketCount} (MATCH_RESULT, OPEN, points-only)`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
