import { Platform } from 'react-native';
import type { HeartRateReading, HealthPermissionStatus } from '../../types/health';

const MOCK_MODE = process.env.EXPO_PUBLIC_MOCK_HEART_RATE === 'true';

let pollingInterval: ReturnType<typeof setInterval> | null = null;
let mockHeartRate = 128;

export const GoogleFitService = {
  async requestPermissions(): Promise<HealthPermissionStatus> {
    if (Platform.OS !== 'android') return 'unavailable';
    if (MOCK_MODE) return 'granted';
    // Real Google Fit integration requires react-native-google-fit native module
    return 'unavailable';
  },

  startPolling(onHeartRate: (reading: HeartRateReading) => void, intervalMs = 5000): void {
    if (pollingInterval) return;

    if (MOCK_MODE) {
      pollingInterval = setInterval(() => {
        mockHeartRate += Math.round((Math.random() - 0.45) * 8);
        mockHeartRate = Math.max(110, Math.min(190, mockHeartRate));
        onHeartRate({ value: mockHeartRate, timestamp: Date.now() });
      }, intervalMs);
      return;
    }

    console.warn('Google Fit polling not available in this build. Set EXPO_PUBLIC_MOCK_HEART_RATE=true for testing.');
  },

  stopPolling(): void {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
    mockHeartRate = 128;
  },
};
