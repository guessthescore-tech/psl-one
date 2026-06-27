import type { ExpStory } from './data';
import { getFixtures, getMatchCentre, getStandings, type Fixture, type MatchCentre, type StandingGroup } from './football-api';
import { getTopPerformers, type TopPerformer } from './players-api';
import type { MediaItem } from './media-api';

const SEASON_SLUG = 'fifa-world-cup-2026';

export interface LiveWorldCupFeedInput {
  fixtures: Fixture[];
  standings: StandingGroup[];
  topPerformers: TopPerformer[];
  matchCentre: MatchCentre | null;
  now?: Date;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-ZA', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function sortByKickoffDesc(left: Fixture, right: Fixture): number {
  return new Date(right.kickoffAt).getTime() - new Date(left.kickoffAt).getTime();
}

function sortByKickoffAsc(left: Fixture, right: Fixture): number {
  return new Date(left.kickoffAt).getTime() - new Date(right.kickoffAt).getTime();
}

function pickStoryFixture(fixtures: Fixture[]): Fixture | null {
  const liveFixture = fixtures.find((fixture) => fixture.status === 'LIVE' || fixture.status === 'HALF_TIME') ?? null;
  if (liveFixture) return liveFixture;

  const finishedFixture = [...fixtures].filter((fixture) => fixture.status === 'FINISHED').sort(sortByKickoffDesc)[0] ?? null;
  if (finishedFixture) return finishedFixture;

  return [...fixtures].filter((fixture) => fixture.status === 'SCHEDULED').sort(sortByKickoffAsc)[0] ?? null;
}

function pickTopStanding(standings: StandingGroup[]): StandingGroup['standings'][number] | null {
  const flattened = standings.flatMap((group) => group.standings);
  if (!flattened.length) return null;
  return [...flattened].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    const aGoalDiff = a.goalsFor - a.goalsAgainst;
    const bGoalDiff = b.goalsFor - b.goalsAgainst;
    if (bGoalDiff !== aGoalDiff) return bGoalDiff - aGoalDiff;
    if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
    return a.team.shortName.localeCompare(b.team.shortName);
  })[0] ?? null;
}

function makeStory(input: {
  id: string;
  title: string;
  category: string;
  summary: string;
  imageKey: string;
  readMinutes: number;
  publishedAt: string;
  featured?: boolean;
}): ExpStory {
  return {
    id: input.id,
    title: input.title,
    category: input.category,
    summary: input.summary,
    imageKey: input.imageKey,
    readMinutes: input.readMinutes,
    publishedAt: input.publishedAt,
    featured: input.featured ?? false,
  };
}

function buildMatchStory(fixtures: Fixture[], matchCentre: MatchCentre | null, now: Date): ExpStory | null {
  const liveFixture = fixtures.find((fixture) => fixture.status === 'LIVE' || fixture.status === 'HALF_TIME');
  const finishedFixture = [...fixtures].filter((fixture) => fixture.status === 'FINISHED').sort(sortByKickoffDesc)[0] ?? null;

  const fixture = liveFixture ?? finishedFixture;
  if (!fixture) return null;

  const publishedAt = matchCentre?.fixture.finishedAt
    ?? matchCentre?.fixture.startedAt
    ?? fixture.kickoffAt
    ?? now.toISOString();
  const score = fixture.homeScore !== null && fixture.awayScore !== null
    ? `${fixture.homeScore}-${fixture.awayScore}`
    : '0-0';

  if (liveFixture) {
    const minute = fixture.currentMinute ?? matchCentre?.fixture.currentMinute;
    const minuteLabel = minute ? `${minute}'` : 'live';
    const rating = matchCentre?.playerRatings[0];
    return makeStory({
      id: `live-match-${fixture.id}`,
      title: `${fixture.homeTeam.shortName} ${score} ${fixture.awayTeam.shortName} — live update`,
      category: 'Live Update',
      summary: rating
        ? `${minuteLabel} match centre: ${rating.player.name} is leading the live ratings board with ${rating.performanceRating.toFixed(1)}/10.`
        : `${minuteLabel} match centre: live events and lineups are flowing for ${fixture.homeTeam.shortName} vs ${fixture.awayTeam.shortName}.`,
      imageKey: `wc-story-live-${fixture.id}`,
      readMinutes: 2,
      publishedAt,
      featured: true,
    });
  }

  if (finishedFixture) {
    return makeStory({
      id: `match-report-${fixture.id}`,
      title: `${fixture.homeTeam.shortName} ${score} ${fixture.awayTeam.shortName} — match report`,
      category: 'Match Report',
      summary: `The latest completed fixture produced a ${score} result at ${fixture.venue?.name ?? 'a World Cup venue'} and keeps the beta story stack moving.`,
      imageKey: `wc-story-report-${fixture.id}`,
      readMinutes: 4,
      publishedAt,
      featured: true,
    });
  }

  return null;
}

function buildStandingsStory(standings: StandingGroup[], now: Date): ExpStory | null {
  const topStanding = pickTopStanding(standings);
  if (!topStanding) return null;
  const groupName = standings[0]?.groupName ?? 'their group';
  const goalDifference = topStanding.goalsFor - topStanding.goalsAgainst;

  return makeStory({
    id: `standings-${topStanding.team.id}`,
    title: `${topStanding.team.shortName} set the pace in ${groupName}`,
    category: 'Standings',
    summary: `${topStanding.team.name} sit on ${topStanding.points} points with a ${goalDifference >= 0 ? '+' : ''}${goalDifference} goal difference after ${topStanding.played} matches.`,
    imageKey: `wc-story-standings-${topStanding.team.id}`,
    readMinutes: 2,
    publishedAt: now.toISOString(),
  });
}

function buildPlayerStory(matchCentre: MatchCentre | null, topPerformers: TopPerformer[], now: Date): ExpStory | null {
  const rating = matchCentre?.playerRatings[0];
  const performer = topPerformers[0];

  if (!rating && !performer) return null;

  if (rating) {
    return makeStory({
      id: `player-spotlight-${rating.player.id}`,
      title: `${rating.player.name} leads the live ratings board`,
      category: 'Player Spotlight',
      summary: `The match centre has ${rating.player.name} at ${rating.performanceRating.toFixed(1)}/10 after a strong live display for ${matchCentre?.homeTeam.shortName ?? 'the home side'}.`,
      imageKey: `wc-player-${rating.player.id}`,
      readMinutes: 2,
      publishedAt: now.toISOString(),
    });
  }

  if (!performer) return null;

  return makeStory({
    id: `player-spotlight-${performer.playerId}`,
    title: `${performer.playerName} leads the scoring chart`,
    category: 'Player Spotlight',
    summary: `${performer.playerName} has ${performer.goals} goals and ${performer.assists} assists, making them the early beta standout for fantasy and match coverage.`,
    imageKey: `wc-player-${performer.playerId}`,
    readMinutes: 2,
    publishedAt: now.toISOString(),
  });
}

function buildPreviewStory(fixtures: Fixture[], now: Date): ExpStory | null {
  const upcomingFixture = [...fixtures].filter((fixture) => fixture.status === 'SCHEDULED').sort(sortByKickoffAsc)[0] ?? null;
  if (!upcomingFixture) return null;

  return makeStory({
    id: `preview-${upcomingFixture.id}`,
    title: `${upcomingFixture.homeTeam.shortName} vs ${upcomingFixture.awayTeam.shortName} — next up`,
    category: 'Preview',
    summary: `The next kick-off lands at ${formatDateTime(upcomingFixture.kickoffAt)} from ${upcomingFixture.venue?.name ?? 'a World Cup venue'}.`,
    imageKey: `wc-story-preview-${upcomingFixture.id}`,
    readMinutes: 3,
    publishedAt: upcomingFixture.kickoffAt ?? now.toISOString(),
  });
}

function buildPulseStory(fixtures: Fixture[], now: Date): ExpStory {
  const liveCount = fixtures.filter((fixture) => fixture.status === 'LIVE' || fixture.status === 'HALF_TIME').length;
  const finishedCount = fixtures.filter((fixture) => fixture.status === 'FINISHED').length;
  const upcomingCount = fixtures.filter((fixture) => fixture.status === 'SCHEDULED').length;

  return makeStory({
    id: 'tournament-pulse',
    title: `World Cup beta pulse: ${finishedCount} results, ${upcomingCount} upcoming`,
    category: 'Analysis',
    summary: liveCount > 0
      ? `${liveCount} live match${liveCount === 1 ? '' : 'es'} are updating the feed right now, with fixtures, standings and player ratings all in sync.`
      : 'Fixtures, standings and player ratings are in sync for the beta feed, keeping the story stack live and ready for the next whistle.',
    imageKey: 'wc-story-pulse',
    readMinutes: 2,
    publishedAt: now.toISOString(),
  });
}

export function buildLiveWorldCupStories(input: LiveWorldCupFeedInput): ExpStory[] {
  const now = input.now ?? new Date();

  const featured = buildMatchStory(input.fixtures, input.matchCentre, now);
  const standingsStory = buildStandingsStory(input.standings, now);
  const playerStory = buildPlayerStory(input.matchCentre, input.topPerformers, now);
  const previewStory = buildPreviewStory(input.fixtures, now);
  const pulseStory = buildPulseStory(input.fixtures, now);

  const orderedStories = [
    featured ?? previewStory,
    featured ? previewStory : null,
    standingsStory,
    playerStory,
    pulseStory,
  ].filter(Boolean) as ExpStory[];

  const deduped: ExpStory[] = [];
  const seen = new Set<string>();
  for (const story of orderedStories) {
    if (seen.has(story.id)) continue;
    seen.add(story.id);
    deduped.push(story);
  }

  return deduped.map((story, index) => ({
    ...story,
    featured: index === 0,
  }));
}

export async function getLiveWorldCupStories(): Promise<ExpStory[]> {
  const fixturesPromise = getFixtures({ seasonSlug: SEASON_SLUG }).catch(() => [] as Fixture[]);
  const standingsPromise = getStandings({ seasonSlug: SEASON_SLUG }).catch(() => [] as StandingGroup[]);

  const [fixtures, standings] = await Promise.all([
    fixturesPromise,
    standingsPromise,
  ]);

  const seasonId = fixtures[0]?.season.id ?? null;
  const topPerformersPromise = seasonId
    ? getTopPerformers(seasonId, 8).catch(() => [] as TopPerformer[])
    : Promise.resolve([] as TopPerformer[]);
  const storyFixture = pickStoryFixture(fixtures);
  const matchCentre = storyFixture ? await getMatchCentre(storyFixture.id).catch(() => null) : null;
  const topPerformers = await topPerformersPromise;

  return buildLiveWorldCupStories({
    fixtures,
    standings,
    topPerformers,
    matchCentre,
  });
}

export async function getLiveWorldCupStory(slug: string): Promise<ExpStory | null> {
  const stories = await getLiveWorldCupStories();
  return stories.find((story) => story.id === slug) ?? null;
}

export function liveStoryToMediaItem(story: ExpStory): MediaItem {
  return {
    id: story.id,
    slug: story.id,
    title: story.title,
    type: 'ARTICLE',
    summary: story.summary,
    body: story.summary,
    thumbnailUrl: null,
    videoUrl: null,
    durationSeconds: null,
    tags: [story.category],
    publishedAt: story.publishedAt,
    club: null,
  };
}
