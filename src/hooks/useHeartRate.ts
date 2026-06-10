import { useEffect } from 'react';
import { Platform } from 'react-native';
import { HealthKitService } from '../services/health/HealthKitService';
import { GoogleFitService } from '../services/health/GoogleFitService';
import { useRunStore } from '../stores/useRunStore';

export function useHeartRate(isActive: boolean): void {
  const updateHeartRate = useRunStore((s) => s.updateHeartRate);

  useEffect(() => {
    if (!isActive) return;

    const service = Platform.OS === 'ios' ? HealthKitService : GoogleFitService;
    service.startPolling((reading) => {
      updateHeartRate(reading.value);
    });

    return () => service.stopPolling();
  }, [isActive, updateHeartRate]);
}
