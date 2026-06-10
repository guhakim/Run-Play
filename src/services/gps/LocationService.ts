import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { BACKGROUND_LOCATION_TASK, GPS_OPTIONS } from '../../constants/coaching';
import type { GPSPoint } from '../../types/run';

type LocationCallback = (point: GPSPoint) => void;

let foregroundSubscription: Location.LocationSubscription | null = null;
let locationCallback: LocationCallback | null = null;
let webSimInterval: ReturnType<typeof setInterval> | null = null;

// Register background task only on native
if (Platform.OS !== 'web') {
  // Dynamic import to avoid web crash on module load
  const TaskManager = require('expo-task-manager');
  TaskManager.defineTask(BACKGROUND_LOCATION_TASK, async ({ data, error }: any) => {
    if (error || !data?.locations?.length) return;
    const loc = data.locations[0] as Location.LocationObject;
    const point: GPSPoint = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      altitude: loc.coords.altitude,
      speed: loc.coords.speed,
      timestamp: loc.timestamp,
    };
    locationCallback?.(point);
  });
}

// Web: simulate GPS movement for prototype demo
function startWebSimulation(onLocation: LocationCallback): void {
  let lat = 37.5665;
  let lon = 126.9780;
  let speed = 2.8;
  webSimInterval = setInterval(() => {
    lat += 0.00003 + (Math.random() - 0.5) * 0.00001;
    lon += 0.00002 + (Math.random() - 0.5) * 0.00001;
    speed = Math.max(1.5, Math.min(4.5, speed + (Math.random() - 0.5) * 0.3));
    onLocation({ latitude: lat, longitude: lon, altitude: 50, speed, timestamp: Date.now() });
  }, 1500);
}

export const LocationService = {
  async requestPermissions(): Promise<boolean> {
    if (Platform.OS === 'web') return true;
    const { status: fg } = await Location.requestForegroundPermissionsAsync();
    if (fg !== 'granted') return false;
    const { status: bg } = await Location.requestBackgroundPermissionsAsync();
    return bg === 'granted';
  },

  async startTracking(onLocation: LocationCallback): Promise<void> {
    locationCallback = onLocation;

    if (Platform.OS === 'web') {
      startWebSimulation(onLocation);
      return;
    }

    foregroundSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.BestForNavigation,
        distanceInterval: GPS_OPTIONS.distanceInterval,
        timeInterval: GPS_OPTIONS.timeInterval,
      },
      (loc) => {
        const point: GPSPoint = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          altitude: loc.coords.altitude,
          speed: loc.coords.speed,
          timestamp: loc.timestamp,
        };
        onLocation(point);
      }
    );

    const TaskManager = require('expo-task-manager');
    await Location.startLocationUpdatesAsync(BACKGROUND_LOCATION_TASK, {
      accuracy: Location.Accuracy.BestForNavigation,
      distanceInterval: GPS_OPTIONS.distanceInterval,
      timeInterval: GPS_OPTIONS.timeInterval,
      showsBackgroundLocationIndicator: true,
      foregroundService: {
        notificationTitle: '런플 러닝 추적 중',
        notificationBody: '달리기를 추적하고 있어요 🏃',
        notificationColor: '#FF4D00',
      },
    });
  },

  async stopTracking(): Promise<void> {
    if (Platform.OS === 'web') {
      if (webSimInterval) { clearInterval(webSimInterval); webSimInterval = null; }
      locationCallback = null;
      return;
    }
    foregroundSubscription?.remove();
    foregroundSubscription = null;
    locationCallback = null;
    const TaskManager = require('expo-task-manager');
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_LOCATION_TASK);
    if (isRegistered) {
      await Location.stopLocationUpdatesAsync(BACKGROUND_LOCATION_TASK);
    }
  },
};
