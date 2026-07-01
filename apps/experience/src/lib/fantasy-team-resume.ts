/**
 * Shared constants and helpers for the fantasy onboarding / team-completeness
 * lifecycle. Both the onboarding page and the team page use these so the
 * squad-size threshold and resume logic live in exactly one place.
 */

/** Must stay in sync with the backend's DEFAULT_SQUAD_CONFIG.squadSize (= 15). */
export const SQUAD_SIZE = 15;

/**
 * Returns the onboarding step a user should resume at based on how many
 * players their existing team has, or null if the team is already complete
 * and the user should be sent to /fantasy/team.
 *
 * Step 2 = Formation  (name already saved, squad not started)
 * Step 3 = Build Squad (partial squad, continue picking players)
 * null   = Complete    (15 players, go to /fantasy/team)
 */
export function getResumeStep(playerCount: number): 2 | 3 | null {
  if (playerCount >= SQUAD_SIZE) return null;
  if (playerCount === 0) return 2;
  return 3;
}
