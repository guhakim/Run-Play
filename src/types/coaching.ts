export type CoachingTrigger =
  | 'START_RUN'
  | 'DISTANCE_MILESTONE'
  | 'OVER_PACE_WARNING'
  | 'HIGH_HEART_RATE_ALERT'
  | 'AUTO_PAUSE'
  | 'GOAL_NEAR'
  | 'FINISH_RUN';

export const TRIGGER_PRIORITY: Record<CoachingTrigger, number> = {
  HIGH_HEART_RATE_ALERT: 0,
  FINISH_RUN: 1,
  AUTO_PAUSE: 2,
  GOAL_NEAR: 3,
  START_RUN: 4,
  DISTANCE_MILESTONE: 5,
  OVER_PACE_WARNING: 6,
};

export interface CoachingContext {
  trigger: CoachingTrigger;
  targetDistanceKm: number;
  targetPaceSecPerKm: number;
  currentDistanceKm: number;
  currentPaceSecPerKm: number;
  heartRate: number;
  elapsedSeconds: number;
}

export interface CoachingMessage {
  id: string;
  trigger: CoachingTrigger;
  text: string;
  firedAt: number;
}
