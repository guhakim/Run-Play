import type { CoachingTrigger } from '../../types/coaching';
import { TRIGGER_THRESHOLDS, TRIGGER_COOLDOWNS_MS } from '../../constants/coaching';

interface TriggerInput {
  status: 'idle' | 'active' | 'paused' | 'finished';
  totalDistanceKm: number;
  targetDistanceKm: number;
  currentPaceSecPerKm: number;
  targetPaceSecPerKm: number;
  heartRate: number;
  lastMilestoneKm: number;
  goalNearFired: boolean;
  finishFired: boolean;
  consecutiveLowSpeedCount: number;
  lastFiredAt: Partial<Record<CoachingTrigger, number>>;
}

function isCooledDown(trigger: CoachingTrigger, lastFiredAt: Partial<Record<CoachingTrigger, number>>): boolean {
  const cooldown = TRIGGER_COOLDOWNS_MS[trigger];
  if (!cooldown) return true;
  const last = lastFiredAt[trigger];
  if (!last) return true;
  return Date.now() - last >= cooldown;
}

export function evaluateTriggers(input: TriggerInput): CoachingTrigger | null {
  const {
    status, totalDistanceKm, targetDistanceKm,
    currentPaceSecPerKm, targetPaceSecPerKm,
    heartRate, lastMilestoneKm, goalNearFired, finishFired,
    consecutiveLowSpeedCount, lastFiredAt,
  } = input;

  if (status !== 'active' && status !== 'paused') return null;

  // 1. HIGH_HEART_RATE — highest priority
  if (heartRate >= TRIGGER_THRESHOLDS.HIGH_HEART_RATE_BPM && isCooledDown('HIGH_HEART_RATE_ALERT', lastFiredAt)) {
    return 'HIGH_HEART_RATE_ALERT';
  }

  // 2. FINISH_RUN
  if (!finishFired && totalDistanceKm >= targetDistanceKm && targetDistanceKm > 0) {
    return 'FINISH_RUN';
  }

  // 3. AUTO_PAUSE — fire when just transitioned to paused
  if (status === 'paused' && consecutiveLowSpeedCount === TRIGGER_THRESHOLDS.AUTO_PAUSE_CONSECUTIVE_READINGS) {
    return 'AUTO_PAUSE';
  }

  // 4. GOAL_NEAR
  if (!goalNearFired && totalDistanceKm >= targetDistanceKm - TRIGGER_THRESHOLDS.GOAL_NEAR_DISTANCE_KM && targetDistanceKm > 0) {
    return 'GOAL_NEAR';
  }

  // 5. DISTANCE_MILESTONE — every 1km
  const nextMilestone = lastMilestoneKm + 1;
  if (totalDistanceKm >= nextMilestone && nextMilestone <= targetDistanceKm) {
    return 'DISTANCE_MILESTONE';
  }

  // 6. OVER_PACE_WARNING
  if (
    currentPaceSecPerKm > 0 &&
    targetPaceSecPerKm > 0 &&
    currentPaceSecPerKm < targetPaceSecPerKm - TRIGGER_THRESHOLDS.OVER_PACE_DELTA_SEC &&
    isCooledDown('OVER_PACE_WARNING', lastFiredAt)
  ) {
    return 'OVER_PACE_WARNING';
  }

  return null;
}
