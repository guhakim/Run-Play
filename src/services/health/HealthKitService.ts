import { Platform } from 'react-native';
import type { HeartRateReading, HealthPermissionStatus } from '../../types/health';

const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_HEART_RATE === 'true';

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let mockHeartRate = 130;

export const HealthKitService = {
  async requestPermissions(): Promise<HealthPermissionStatus> {
    if (Platform.OS !== 'ios') return 'unavailable';
    if (MOCK_MODE) return 'granted';
    // Real HealthKit integration requires react-native-health native module
    // For now, return unavailable until native module is installed
    return 'unavailable';
  },

  startPolling(onHeartRate: (reading: HeartRateReading) => void, intervalMs = 5000): void {
    if (pollingInterval) return;

    if (MOCK_MODE) {
      pollingInterval = setInterval(() => {
        // Simulate realistic heart rate during running (120-175 bpm)
        mockHeartRate += Math.round((Math.random() - 0.45) * 8);
        mockHeartRate = Math.max(110, Math.min(190, mockHeartRate));
        onHeartRate({ value: mockHeartRate, timestamp: Date.now() });
      }, intervalMs);
      return;
    }

    // Stub for real HealthKit polling — implement once react-native-health is installed
    console.warn('HealthKit polling not available in this build. Set EXPO_PUBLIC_MOCK_HEART_RATE=true for testing.');
  },

  stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    mockHeartRate = 130;
  },
};
