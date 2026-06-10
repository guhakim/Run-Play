export type RunStatus = 'idle' | 'active' | 'paused' | 'finished';

export interface GPSPoint {
  latitude: number;
  longitude: number;
  altitude: number | null;
  speed: number | null;
  timestamp: number;
}

export interface RunGoal {
  targetDistanceKm: number;
  targetPaceSecPerKm: number;
}

export interface RunSession {
  id: string;
  startedAt: number;
  endedAt: number | null;
  goal: RunGoal;
  status: RunStatus;
  totalDistanceKm: number;
  elapsedSeconds: number;
  currentPaceSecPerKm: number;
  avgPaceSecPerKm: number;
  heartRate: number;
  maxHeartRate: number;
  avgHeartRate: number;
  route: GPSPoint[];
  pointsEarned: number;
  lastMilestoneKm: number;
  goalNearFired: boolean;
  finishFired: boolean;
}
