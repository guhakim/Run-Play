import { create } from 'zustand';

interface GoalState {
  targetDistanceKm: number;
  targetPaceSecPerKm: number;
  setTargetDistance: (km: number) => void;
  setTargetPace: (secPerKm: number) => void;
}

export const useGoalStore = create<GoalState>((set) => ({
  targetDistanceKm: 5,
  targetPaceSecPerKm: 330, // 5:30 /km
  setTargetDistance: (km) => set({ targetDistanceKm: km }),
  setTargetPace: (secPerKm) => set({ targetPaceSecPerKm: secPerKm }),
}));
