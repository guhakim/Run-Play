import { create } from 'zustand';
import type { CoachingMessage, CoachingTrigger } from '../types/coaching';

interface CoachingState {
  messages: CoachingMessage[];
  currentMessage: CoachingMessage | null;
  isLoading: boolean;
  lastFiredAt: Partial<Record<CoachingTrigger, number>>;

  addMessage: (message: CoachingMessage) => void;
  setCurrentMessage: (message: CoachingMessage | null) => void;
  setLoading: (loading: boolean) => void;
  recordTriggerFired: (trigger: CoachingTrigger) => void;
  resetSession: () => void;
}

export const useCoachingStore = create<CoachingState>((set) => ({
  messages: [],
  currentMessage: null,
  isLoading: false,
  lastFiredAt: {},

  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  setCurrentMessage: (message) => set({ currentMessage: message }),

  setLoading: (loading) => set({ isLoading: loading }),

  recordTriggerFired: (trigger) =>
    set((state) => ({
      lastFiredAt: { ...state.lastFiredAt, [trigger]: Date.now() },
    })),

  resetSession: () => set({ messages: [], currentMessage: null, isLoading: false, lastFiredAt: {} }),
}));
