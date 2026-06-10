export interface HeartRateReading {
  value: number;
  timestamp: number;
}

export type HealthPermissionStatus = 'granted' | 'denied' | 'not_determined' | 'unavailable';
