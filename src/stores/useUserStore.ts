import { create } from 'zustand';

interface UserState {
  userId: string | null;
  name: string;
  totalPoints: number;
  streakDays: number;
  isAuthenticated: boolean;

  setUser: (userId: string, name: string) => void;
  addPoints: (points: number) => void;
  setStreak: (days: number) => void;
  signOut: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  userId: null,
  name: '런플러',
  totalPoints: 0,
  streakDays: 0,
  isAuthenticated: false,

  setUser: (userId, name) => set({ userId, name, isAuthenticated: true }),
  addPoints: (points) => set((state) => ({ totalPoints: state.totalPoints + points })),
  setStreak: (days) => set({ streakDays: days }),
  signOut: () => set({ userId: null, isAuthenticated: false, name: '런플러' }),
}));
