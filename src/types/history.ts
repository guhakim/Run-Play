export interface SplitPace {
  km: number;
  paceSecPerKm: number;
}

export interface HistoryRun {
  id: string;
  date: number; // ms timestamp
  distanceKm: number;
  durationSeconds: number;
  avgPaceSecPerKm: number;
  maxHeartRate: number;
  avgHeartRate: number;
  goalDistanceKm: number;
  goalPaceSecPerKm: number;
  goalAchieved: boolean;
  pointsEarned: number;
  // Posture breakdown
  postureScore: number;     // 0-100 overall
  paceConsistency: number;  // 0-100
  hrEfficiency: number;     // 0-100
  rhythmStability: number;  // 0-100
  // Coaching
  coachingCount: number;
  coachingMessages: string[];
  // Raw data for charts
  hrHistory: number[];
  splitPaces: SplitPace[];
}
