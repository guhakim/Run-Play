import { useRunStore } from '../stores/useRunStore';
import { TRIGGER_THRESHOLDS } from '../constants/coaching';
import type { GPSPoint } from '../types/run';

export function useAutoPause() {
  const { status, consecutiveLowSpeedCount, incrementLowSpeedCount, resetLowSpeedCount, pauseRun, resumeRun } =
    useRunStore();

  function checkMotion(point: GPSPoint): void {
    const speed = point.speed ?? 0;

    if (speed < TRIGGER_THRESHOLDS.AUTO_PAUSE_SPEED_MS) {
      incrementLowSpeedCount();
      if (
        consecutiveLowSpeedCount + 1 >= TRIGGER_THRESHOLDS.AUTO_PAUSE_CONSECUTIVE_READINGS &&
        status === 'active'
      ) {
        pauseRun();
      }
    } else {
      resetLowSpeedCount();
      if (status === 'paused') {
        resumeRun();
      }
    }
  }

  return { checkMotion };
}
