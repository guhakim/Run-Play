export function calculatePoints(params: {
  actualDistanceKm: number;
  targetDistanceKm: number;
  avgPaceSecPerKm: number;
  targetPaceSecPerKm: number;
  maxHeartRate: number;
  streakDays: number;
}): number {
  const { actualDistanceKm, targetDistanceKm, avgPaceSecPerKm, targetPaceSecPerKm, maxHeartRate, streakDays } = params;

  const base = Math.floor(actualDistanceKm * 100);

  const paceDelta = avgPaceSecPerKm - targetPaceSecPerKm;
  let paceBonus = 0;
  if (paceDelta <= 0) paceBonus = Math.floor(base * 0.2);
  else if (paceDelta <= 30) paceBonus = Math.floor(base * 0.1);

  const goalBonus = actualDistanceKm >= targetDistanceKm ? 50 : 0;
  const hrBonus = maxHeartRate < 180 ? 15 : 0;

  const streakMultiplier = 1.0 + Math.min(streakDays, 7) * 0.05;

  return Math.floor((base + paceBonus + goalBonus + hrBonus) * streakMultiplier);
}
