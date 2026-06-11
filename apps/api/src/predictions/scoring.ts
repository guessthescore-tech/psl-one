export function calculatePoints(
  actualHome: number,
  actualAway: number,
  predictedHome: number,
  predictedAway: number,
): number {
  if (predictedHome === actualHome && predictedAway === actualAway) return 10;

  const actualDiff = actualHome - actualAway;
  const predictedDiff = predictedHome - predictedAway;
  const actualResult = Math.sign(actualDiff);
  const predictedResult = Math.sign(predictedDiff);

  if (actualResult !== predictedResult) return 0;
  if (actualDiff === predictedDiff) return 5;
  return 3;
}
