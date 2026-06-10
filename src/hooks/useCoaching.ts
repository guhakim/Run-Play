import { useRunStore } from '../stores/useRunStore';
import { useGoalStore } from '../stores/useGoalStore';
import { useCoachingStore } from '../stores/useCoachingStore';
import { evaluateTriggers } from '../services/coaching/TriggerEngine';
import { fireTrigger } from '../services/coaching/CoachingOrchestrator';

export function useCoaching() {
  const runState = useRunStore();
  const { targetDistanceKm, targetPaceSecPerKm } = useGoalStore();
  const { lastFiredAt } = useCoachingStore();

  function evaluate(): void {
    const trigger = evaluateTriggers({
      status: runState.status,
      totalDistanceKm: runState.totalDistanceKm,
      targetDistanceKm,
      currentPaceSecPerKm: runState.currentPaceSecPerKm,
      targetPaceSecPerKm,
      heartRate: runState.heartRate,
      lastMilestoneKm: runState.lastMilestoneKm,
      goalNearFired: runState.goalNearFired,
      finishFired: runState.finishFired,
      consecutiveLowSpeedCount: runState.consecutiveLowSpeedCount,
      lastFiredAt,
    });

    if (trigger) {
      fireTrigger(trigger);
    }
  }

  return { evaluate };
}
