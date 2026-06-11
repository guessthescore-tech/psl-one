import { PrismaClient, PlayerPosition, FixtureStatus, GameweekStatus, CompetitionFormat, StageType, SeasonStatus, AchievementCategory, AchievementTriggerType, BadgeRarity, FanValueType, RewardReadinessCategory, SeasonTeamStatus, SeasonTeamSource, ClubProfileStatus, ShopProductCategory, ShopProductAvailability, ShopProductStatus, ClubContentType, ClubContentStatus } from '@prisma/client';
import { VENUES } from './seed-data/world-cup-2026/venues';
import { TEAMS, TBD_TEAM } from './seed-data/world-cup-2026/teams';
import { GROUPS } from './seed-data/world-cup-2026/groups';
import { ALL_FIXTURES } from './seed-data/world-cup-2026/fixtures';
import { PLAYERS } from './seed-data/world-cup-2026/players';
import { PSL_CLUBS } from './seed-data/psl-clubs';

const prisma = new PrismaClient();

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

  // Clear fixture import data (depend on season and fixture)
  await prisma.fixtureImportRow.deleteMany();
  await prisma.fixtureImportBatch.deleteMany();

  // Clear season switch audit data
  await prisma.seasonSwitchAudit.deleteMany();

  // Clear football data in dependency order
  await prisma.fantasyPlayerMatchStat.deleteMany();
  await prisma.fixtureLineup.deleteMany();
  await prisma.matchEvent.deleteMany();
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
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
