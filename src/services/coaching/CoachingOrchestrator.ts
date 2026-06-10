import type { CoachingTrigger, CoachingContext } from '../../types/coaching';
import { getCoachingMessage } from '../api/coachingProxy';
import { TTSService } from './TTSService';
import { useCoachingStore } from '../../stores/useCoachingStore';
import { useRunStore } from '../../stores/useRunStore';
import { useGoalStore } from '../../stores/useGoalStore';

let processing = false;

export async function fireTrigger(trigger: CoachingTrigger): Promise<void> {
  if (processing && trigger !== 'HIGH_HEART_RATE_ALERT') return;

  const runState = useRunStore.getState();
  const goalState = useGoalStore.getState();
  const coachingStore = useCoachingStore.getState();

  coachingStore.recordTriggerFired(trigger);

  // Advance milestone tracking
  if (trigger === 'DISTANCE_MILESTONE') {
    runState.setMilestone(Math.floor(runState.totalDistanceKm));
  }
  if (trigger === 'GOAL_NEAR') runState.setGoalNearFired();
  if (trigger === 'FINISH_RUN') runState.setFinishFired();

  const ctx: CoachingContext = {
    trigger,
    targetDistanceKm: goalState.targetDistanceKm,
    targetPaceSecPerKm: goalState.targetPaceSecPerKm,
    currentDistanceKm: runState.totalDistanceKm,
    currentPaceSecPerKm: runState.currentPaceSecPerKm,
    heartRate: runState.heartRate,
    elapsedSeconds: runState.elapsedSeconds,
  };

  processing = true;
  coachingStore.setLoading(true);

  try {
    const text = await getCoachingMessage(ctx);
    const message = { id: `${trigger}-${Date.now()}`, trigger, text, firedAt: Date.now() };
    coachingStore.addMessage(message);
    coachingStore.setCurrentMessage(message);
    TTSService.speak(text, trigger);
  } finally {
    processing = false;
    coachingStore.setLoading(false);
  }
}

export function resetOrchestrator(): void {
  processing = false;
}
