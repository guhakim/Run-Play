export const TRIGGER_THRESHOLDS = {
  HIGH_HEART_RATE_BPM: 180,
  OVER_PACE_DELTA_SEC: 15,
  AUTO_PAUSE_SPEED_MS: 0.5,
  AUTO_PAUSE_CONSECUTIVE_READINGS: 3,
  GOAL_NEAR_DISTANCE_KM: 0.5,
};

export const TRIGGER_COOLDOWNS_MS: Record<string, number> = {
  OVER_PACE_WARNING: 120_000,
  HIGH_HEART_RATE_ALERT: 60_000,
};

export const BACKGROUND_LOCATION_TASK = 'background-location-task';

export const GPS_OPTIONS = {
  distanceInterval: 5,
  timeInterval: 1000,
};
