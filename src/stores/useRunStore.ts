import { create } from 'zustand';
import type { RunStatus, GPSPoint } from '../types/run';

interface RunState {
  status: RunStatus;
  startedAt: number | null;
  elapsedSeconds: number;
  totalDistanceKm: number;
  currentPaceSecPerKm: number;
  avgPaceSecPerKm: number;
  heartRate: number;
  maxHeartRate: number;
  heartRateHistory: number[];
  route: GPSPoint[];
  lastMilestoneKm: number;
  goalNearFired: boolean;
  finishFired: boolean;
  consecutiveLowSpeedCount: number;

  // Actions
  startRun: () => void;
  pauseRun: () => void;
  resumeRun: () => void;
  finishRun: () => void;
  resetRun: () => void;
  addGPSPoint: (point: GPSPoint) => void;
  updateDistanceAndPace: (totalDistanceKm: number, currentPaceSecPerKm: number, avgPaceSecPerKm: number) => void;
  updateHeartRate: (bpm: number) => void;
  tickElapsed: () => void;
  setMilestone: (km: number) => void;
  setGoalNearFired: () => void;
  setFinishFired: () => void;
  incrementLowSpeedCount: () => void;
  resetLowSpeedCount: () => void;
}

const initialState = {
  status: 'idle' as RunStatus,
  startedAt: null,
  elapsedSeconds: 0,
  totalDistanceKm: 0,
  currentPaceSecPerKm: 0,
  avgPaceSecPerKm: 0,
  heartRate: 0,
  maxHeartRate: 0,
  heartRateHistory: [] as number[],
  route: [] as GPSPoint[],
  lastMilestoneKm: 0,
  goalNearFired: false,
  finishFired: false,
  consecutiveLowSpeedCount: 0,
};

export const useRunStore = create<RunState>((set) => ({
  ...initialState,

  startRun: () => set({ status: 'active', startedAt: Date.now(), elapsedSeconds: 0 }),
  pauseRun: () => set({ status: 'paused' }),
  resumeRun: () => set({ status: 'active' }),
  finishRun: () => set({ status: 'finished' }),
  resetRun: () => set(initialState),

  addGPSPoint: (point) =>
    set((state) => ({ route: [...state.route, point] })),

  updateDistanceAndPace: (totalDistanceKm, currentPaceSecPerKm, avgPaceSecPerKm) =>
    set({ totalDistanceKm, currentPaceSecPerKm, avgPaceSecPerKm }),

  updateHeartRate: (bpm) =>
    set((state) => ({
      heartRate: bpm,
      maxHeartRate: Math.max(state.maxHeartRate, bpm),
      heartRateHistory: [...state.heartRateHistory.slice(-60), bpm],
    })),

  tickElapsed: () =>
    set((state) =>
      state.status === 'active' ? { elapsedSeconds: state.elapsedSeconds + 1 } : {}
    ),

  setMilestone: (km) => set({ lastMilestoneKm: km }),
  setGoalNearFired: () => set({ goalNearFired: true }),
  setFinishFired: () => set({ finishFired: true }),
  incrementLowSpeedCount: () =>
    set((state) => ({ consecutiveLowSpeedCount: state.consecutiveLowSpeedCount + 1 })),
  resetLowSpeedCount: () => set({ consecutiveLowSpeedCount: 0 }),
}));
