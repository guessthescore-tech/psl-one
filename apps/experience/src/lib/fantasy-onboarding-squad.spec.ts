import { describe, expect, it } from 'vitest';
import type { ExpFantasyPlayer } from './data';
import {
  buildEmptySquad,
  getStarterSlotPosition,
  reseatStartersForFormation,
  selectPlayerForSlot,
} from './fantasy-onboarding-squad';

const club = {
  id: 'club-1',
  name: 'Club One',
  shortName: 'CLB',
  abbr: 'CLB',
  city: '',
  country: '',
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  textColor: '#ffffff',
  founded: 2000,
};

function player(id: string, position: ExpFantasyPlayer['position']): ExpFantasyPlayer {
  return {
    id,
    name: id,
    position,
    club,
    nationality: '',
    imageKey: id,
    goalsThisTournament: 0,
    assistsThisTournament: 0,
    cleanSheets: 0,
    fantasyPoints: 0,
    fantasyPrice: 5,
    squadRole: 'STARTER',
    benchSlot: null,
    isCaptain: false,
    isViceCaptain: false,
    gameweekPoints: 0,
    isUnavailable: false,
  };
}

describe('fantasy onboarding squad helper', () => {
  it('maps 4-3-3 starter indexes to stable flat slot positions', () => {
    expect(getStarterSlotPosition('4-3-3', 0)).toBe('GK');
    expect(getStarterSlotPosition('4-3-3', 1)).toBe('DEF');
    expect(getStarterSlotPosition('4-3-3', 4)).toBe('DEF');
    expect(getStarterSlotPosition('4-3-3', 5)).toBe('MID');
    expect(getStarterSlotPosition('4-3-3', 7)).toBe('MID');
    expect(getStarterSlotPosition('4-3-3', 8)).toBe('FWD');
    expect(getStarterSlotPosition('4-3-3', 10)).toBe('FWD');
  });

  it('preserves all 11 starter picks as the final starter slots are filled', () => {
    let squad = buildEmptySquad('4-3-3');
    const starterPlayers = [
      player('gk1', 'GK'),
      ...Array.from({ length: 4 }, (_, i) => player(`def${i + 1}`, 'DEF')),
      ...Array.from({ length: 3 }, (_, i) => player(`mid${i + 1}`, 'MID')),
      ...Array.from({ length: 3 }, (_, i) => player(`fwd${i + 1}`, 'FWD')),
    ];

    starterPlayers.forEach((p, idx) => {
      squad = selectPlayerForSlot(squad, { isStarter: true, idx }, p, '4-3-3');
      expect(squad.starters.filter(Boolean).map(selected => selected!.id)).toEqual(
        starterPlayers.slice(0, idx + 1).map(selected => selected.id),
      );
      expect(squad.bench).toEqual([null, null, null, null]);
    });

    expect(squad.starters.map(p => p?.id)).toEqual(starterPlayers.map(p => p.id));
  });

  it('preserves all bench picks and never writes bench selections into starters', () => {
    let squad = buildEmptySquad('4-3-3');
    const benchPlayers = [
      player('bench-gk', 'GK'),
      player('bench-def', 'DEF'),
      player('bench-mid', 'MID'),
      player('bench-fwd', 'FWD'),
    ];

    benchPlayers.forEach((p, idx) => {
      squad = selectPlayerForSlot(squad, { isStarter: false, idx }, p, '4-3-3');
      expect(squad.bench.filter(Boolean).map(selected => selected!.id)).toEqual(
        benchPlayers.slice(0, idx + 1).map(selected => selected.id),
      );
      expect(squad.starters.every(selected => selected === null)).toBe(true);
    });

    expect(squad.bench.map(p => p?.id)).toEqual(benchPlayers.map(p => p.id));
    expect(squad.bench.map(p => p?.squadRole)).toEqual([
      'SUBSTITUTE',
      'SUBSTITUTE',
      'SUBSTITUTE',
      'SUBSTITUTE',
    ]);
    expect(squad.bench.map(p => p?.benchSlot)).toEqual([1, 2, 3, 4]);
  });

  it('keeps starter and bench writes isolated across the 11th through 15th picks', () => {
    let squad = buildEmptySquad('4-3-3');
    const picks = [
      player('gk1', 'GK'),
      ...Array.from({ length: 4 }, (_, i) => player(`def${i + 1}`, 'DEF')),
      ...Array.from({ length: 3 }, (_, i) => player(`mid${i + 1}`, 'MID')),
      ...Array.from({ length: 3 }, (_, i) => player(`fwd${i + 1}`, 'FWD')),
      player('bench-gk', 'GK'),
      player('bench-def', 'DEF'),
      player('bench-mid', 'MID'),
      player('bench-fwd', 'FWD'),
    ];

    picks.forEach((p, idx) => {
      const selectedSlot = idx < 11
        ? { isStarter: true, idx }
        : { isStarter: false, idx: idx - 11 };
      squad = selectPlayerForSlot(squad, selectedSlot, p, '4-3-3');
      const selectedIds = [...squad.starters, ...squad.bench].filter(Boolean).map(selected => selected!.id);
      expect(selectedIds).toEqual(picks.slice(0, idx + 1).map(selected => selected.id));
    });

    expect([...squad.starters, ...squad.bench].filter(Boolean)).toHaveLength(15);
  });

  it('rejects a wrong-position starter selection without clearing existing picks', () => {
    let squad = buildEmptySquad('4-3-3');
    squad = selectPlayerForSlot(squad, { isStarter: true, idx: 0 }, player('gk1', 'GK'), '4-3-3');

    const next = selectPlayerForSlot(squad, { isStarter: true, idx: 1 }, player('wrong-mid', 'MID'), '4-3-3');

    expect(next).toBe(squad);
    expect(next.starters[0]?.id).toBe('gk1');
    expect(next.starters[1]).toBeNull();
  });

  it('re-seats starters by position on formation change while preserving bench', () => {
    let squad = buildEmptySquad('4-3-3');
    const starterPlayers = [
      player('gk1', 'GK'),
      ...Array.from({ length: 4 }, (_, i) => player(`def${i + 1}`, 'DEF')),
      ...Array.from({ length: 3 }, (_, i) => player(`mid${i + 1}`, 'MID')),
      ...Array.from({ length: 3 }, (_, i) => player(`fwd${i + 1}`, 'FWD')),
    ];
    starterPlayers.forEach((p, idx) => {
      squad = selectPlayerForSlot(squad, { isStarter: true, idx }, p, '4-3-3');
    });
    squad = selectPlayerForSlot(squad, { isStarter: false, idx: 0 }, player('bench-gk', 'GK'), '4-3-3');

    const next = reseatStartersForFormation(squad, '5-3-2');

    expect(next.starters.map(p => p?.position ?? null)).toEqual([
      'GK',
      'DEF',
      'DEF',
      'DEF',
      'DEF',
      null,
      'MID',
      'MID',
      'MID',
      'FWD',
      'FWD',
    ]);
    expect(next.bench[0]?.id).toBe('bench-gk');
  });
});
